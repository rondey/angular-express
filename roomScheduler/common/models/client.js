'use strict';

module.exports = function(Client) {
    let event_validator = require('../event_validator');
    let date_diff = require('../date.js');

    let updateAll_enum = {
        NO: 1,
        CONFLICT: 2,
        WEEKLY: 3,
        ALL: 4
    };

    //Definisco un metodo del client che mi permetta di individuare tutti gli schedule di un determinato evento
    Client.__find__event__schedules = function(id, fk, next) {
        findEvent(this.app, next, id, fk, function(event){
            //Nel caso in cui esista l'evento appartenente al client id, posso procedere restituendo tutti gli schedule appartenenti allo specifico evento
            event.schedules(function(err, schedules) {
                if (err) return next(err);

                next(null, schedules);
            });
        });
        
    }

    //Definisco il metodo REST per la ricerca degli schedule dato uno specifico evento. 
    Client.remoteMethod(
        //Il nome del metodo simula il nome che avrebbe il metodo se fosse definito da loopback.
        // id è l'id del client, fk è l'id dell'event
        '__find__event__schedules', {
            accepts: [{
                    arg: 'id',
                    type: 'number',
                    required: true
                },
                {
                    arg: 'fk',
                    type: 'number',
                    required: true
                }
            ],
            http: {
                path: '/:id/events/:fk/schedules',
                verb: 'get'
            },
            returns: {
                root: true,
                type: 'array'
            },
            documented: true
        }
    );

    //Definisco un metodo del client che mi permetta di patchare uno schedule
    Client.__patchOrCreate__event__schedule = function(id, eventFk, scheduleFk, starting, ending, date, roomId, updateAll, next) {
        let app = this.app;

        findEvent(app, next, id, eventFk, function(event){
            //Nel caso in cui esista l'evento appartenente all'id, posso procedere restituendo tutti gli schedule appartenenti allo specifico evento
            event.schedules.findById(scheduleFk, function(err, schedule) {
                if (err) return next(err);
                
                //Se lo schedule non esiste, restituisco l'errore
                if (schedule == null){
                    let err = app.buildNoInstanceError(scheduleFk, 'Schedule');
                    return next(err);
                }

                if (updateAll != null){
                    //Verifichiamo che l'updateAll assuma un valore valido, cioè da 1 al numero totale di valori che può assumere l'updateAll
                    if( updateAll <= 0 || updateAll > Object.keys(updateAll_enum).length ){
                        let err = app.buildFormatError('updateAll', updateAll, 'Event');
                        return next(err);
                    }
                }
                

                //Dalla date estraggo la data, l'ora non mi serve
                let ds = new Date(date);
                ds.setHours(12,0,0,0);
                date = ds;

                let prevDate = schedule.date;
                let dateDiff = date_diff.inDays(new Date(prevDate), date);

                //Aggiorno lo schedule con i nuovi attributi
                updateSchedule(schedule, next, starting, ending, date, roomId, function(schedule){
                    //Se lo schedule non ha impostato l'updateAll, significa che si vuole aggiornare solo lo schedule richiesto
                    if (updateAll != null && updateAll != updateAll_enum.NO){

                        let filter = {};

                        //Gli aggiornamenti avverranno su tutti gli schedule successivi inerenti allo stesso evento dello schedule
                        let where = {
                            and: [
                                { date: { gt: prevDate } },
                                { id: { neq: schedule.id } }
                            ]
                        }

                        //Se updateAll assume valore CONFLICT, significa che dovranno essere aggiornati solo gli schedule in conflitto
                        if(updateAll == updateAll_enum.CONFLICT){
                            where.and.push( { conflict: true } );
                        }

                        filter.where = where;

                        //Per evitare possibili conflitti con schedule dello stesso evento e che potrebbero essere a loro volta coinvolti nell'update
                        // si sceglie di aggiornare gli schedule in base a come e se verranno traslate le date: se gli schedule sono posticipati, si
                        // aggiorneranno gli schedule dai più distanti ai più vicini. Se invece gli schedule sono anticipati, si aggiorneranno gli schedule
                        // dal più vicino al più distante.
                        if(dateDiff != 0){
                            let o;
                            if(dateDiff > 0){
                                o = 'DESC';
                            }
                            else{
                                o = 'ASC';
                            }

                            filter.order = 'date '+o;
                        }

                        console.log(JSON.stringify(filter));

                        //Cerco tutti gli schedule associati
                        event.schedules.find(filter, function(err, scheduleArr){
                            if (err) return next(err);

                            console.log(scheduleArr);

                            //Se trovo schedule da aggiornare, li aggiorno, altrimenti vado avanti
                            if(scheduleArr.length > 0){
                                //Creo un iteratore per semplificare la gestione dell'array
                                let scheduleIterator = scheduleArr[Symbol.iterator]();

                                //Definisco una routine che si occupa di aggiornare tutti gli schedule dell'iteratore
                                let cb = function(){
                                    let iteration;
                                    let sch;
                                    do{
                                        iteration = scheduleIterator.next();
                                        //Se non sono rimasti più schedule, esco
                                        if( iteration.done ){
                                            //Aggiorno le date di inizio e fine
                                            refreshEventDates(event);
                                            return next(null, schedule);
                                        }
                                        //Prendo lo schedule contenuto nell'iterazione
                                        sch = iteration.value;
                                        //Se l'updateAll è per gli schedule della stessa settimana, devo continuare a ciclare fino a ottenere lo schedule
                                        // della settimana successiva
                                    }while(updateAll == updateAll_enum.WEEKLY && (date_diff.inDays(prevDate, sch.date) % 7) != 0)

                                    
                                    //Imposto la nuova data dello schedule, in base ai giorni in più(o in meno) che sono stati dati allo schedule d'origine
                                    let newDate = date_diff.newDate(sch.date, dateDiff);
                                    updateSchedule(sch, next, starting, ending, newDate, roomId, function(s){
                                        if(s.conflict){
                                            schedule.otherConflicts = true;
                                        }
                                        cb();
                                    });
                                }

                                //Aggiorno gli schedule
                                cb();
                                
                                
                            }
                            else{
                                //Aggiorno le date di inizio e fine
                                refreshEventDates(event);
                                next(null, schedule);
                            }
                        });
                    }
                    else{
                        //Aggiorno le date di inizio e fine
                        refreshEventDates(event);
                        //Invio lo schedule modificato
                        next(null, schedule);
                    }
                });
            });
        });
        
    }

    //Definisco il metodo REST per aggiornare uno schedule 
    Client.remoteMethod(
        //Il nome del metodo simula il nome che avrebbe il metodo se fosse definito da loopback.
        // id è l'id del client, fk è l'id dell'event
        '__patchOrCreate__event__schedule', {
            accepts: [{
                    arg: 'id',
                    type: 'number',
                    required: true
                },
                {
                    arg: 'eventFk',
                    type: 'number',
                    required: true
                },
                {
                    arg: 'scheduleFk',
                    type: 'number',
                    required: true
                },
                {
                    arg: 'starting',
                    type: 'string',
                    required: true
                },
                {
                    arg: 'ending',
                    type: 'string',
                    required: true
                },
                {
                    arg: 'date',
                    type: 'date',
                    required: true
                },
                {
                    arg: 'roomId',
                    type: 'number',
                    required: true
                },
                {
                    arg: 'updateAll',
                    type: 'number',
                    required: false,
                    default: 1
                },
            ],
            http: {
                path: '/:id/events/:eventFk/schedules/:scheduleFk',
                verb: 'patch'
            },
            returns: {
                root: true,
                type: 'Schedule'
            },
            documented: true,
            description: "Update a related or more items by id for schedules."
        }
    );

    function findEvent(app, next, clientId, eventId, callback){
        let models = app.models;

        //Per assicurarmi che la richiesta non cerchi schedule che non appartengano al client, si cerca prima di tutto l'evento
        // con l'id della richiesta e che abbia come clientId quello del client. Se non dovesse trovarlo, probabilmente
        // sarà perchè non ha l'autorizzazione per farlo (si cerca di emulare il comportamento che avrebbe loopback)
        models.Event.findOne({
            where: {
                id: eventId,
                clientId: clientId
            }
        }, function(err, event) {
            if (err) return next(err);

            //Se l'evento non è presente, restituisco un errore in cui segnalo la non esistenza dell'istanza
            if (event == null){
                let err = app.buildNoInstanceError(eventId, 'Event');
                return next(err);
            }
            //In caso contrario, procedo con la funzione callback
            callback(event);
        });
    }

    function updateSchedule(schedule, next, starting, ending, date, roomId, callback){
        //Effettuo l'aggiornamento degli attributi e restituisco il nuovo schedule
        schedule.updateAttributes({
            "starting": starting,
            "ending": ending,
            "date": date,
            "roomId": roomId
        }, function(err, s){
            if (err) return next(err);

            //Restituisco il nuovo schedule
            callback(s);
        });
    }

    function refreshEventDates(event){
        event.schedules({order: 'date ASC'}, function(err, schedules){
            if(err) console.log(err);
            event.updateAttributes({
                dateStart: schedules[0].date,
                dateEnd: schedules[schedules.length-1].date
            }, function(err, event){
                if(err) console.log(err);
            });
        });
    }

    //Prima della creazione dell'evento si effettua il controllo sui parametri
    Client.beforeRemote('prototype.__create__events', function (ctx, modelInstance, next) {
        event_validator.checkParameters(ctx, next, Client.app);
    });

    //Dopo la creazione dell'evento si effettua la creazione dei relativi schedule
    Client.afterRemote('prototype.__create__events', function (ctx, remoteMethodOutput, next) {
        event_validator.createSchedules(ctx, remoteMethodOutput, next, Client.app);
    });

    //Dopo aver ottenuto tutti gli eventi dal database, inserisco la la variabile per identificare gli eventi che
    // hanno un conflitto
    Client.afterRemote('prototype.__get__events', function (ctx, remoteMethodOutput, next) {
        let app = Client.app;

        //Iteratore di eventi
        let eventsIterator = remoteMethodOutput[Symbol.iterator]();

        nextIteration(eventsIterator);

        function nextIteration(eventsIterator) {
            //Ottengo l'evento attuale
            let event = eventsIterator.next().value;
            if (!event) {
                //Non ci sono altri eventi, restituisco la lista
                return next();
            }

            //Cerco il primo schedule appartenente all'evento corrente che è in conflitto
            app.models.Schedule.findOne({
                where: {
                    and: [
                        { eventId: event.id },
                        { conflict: true }
                    ]
                }
            }, function (err, schedule) {
                if (err) { return next(err); };

                //Inserisco nell'evento la proprietà conflict
                if(schedule){
                    event.conflict = true;
                }
                else{
                    event.conflict = false;
                }

                nextIteration(eventsIterator);
            })
        }

    });


    // Client.beforeRemote('**', function (ctx, modelInstance, next) {
    //     console.log("Validiamo, ", ctx.methodString);
    // });
};
