'use strict';

let periodicity_enum = {
    ONCE: 1,
    DAILY: 2,
    WEEKLY: 3,
    MONTHLY: 4,
    CUSTOM: 5
};

let date_diff = require('./date.js');

exports.checkParameters = function(ctx, next, app) {
    let body = ctx.req.body;

    let starting = body.starting;
    let ending = body.ending;
    let periodicity = parseInt(body.periodicity);
    let roomId = body.roomId;

    //Individuo sia se starting è undefined sia se è impostato a null
    if (starting == null) {
        let err = app.buildPresenceError('starting', 'Event');
        return next(err);
    }
    
    if (ending == null) {
        let err = app.buildPresenceError('ending', 'Event');
        return next(err);
    }

    if ( roomId == null ){
        let err = app.buildPresenceError('roomId', 'Event');
        return next(err);
    }

    //Verifica che l'ora di inizio è minore dell'ora di fine (nota bene: la data non è importante, basta che siano uguali)
    let eventStart = Date.parse(`01/01/2018 ${starting}:00`);
    let eventEnd = Date.parse(`01/01/2018 ${ending}:00`);

    if (eventStart >= eventEnd) {
        //Preparo l'invio di un messaggio di errore, non devo proseguire nella creazione dello event
        let err = app.buildBiggerError('starting', 'ending', 'Event');
        return next(err);
    }

    //Imposto hoursPerEvent, un parametro che mi indichi la durata in ore di ogni schedule.
    body.hoursPerEvent = date_diff.inHours(eventStart, eventEnd);

    //Dalla dateStart estraggo la data, l'ora non mi serve
    let ds = new Date(body.dateStart);
    ds.setHours(12,0,0,0);
    body.dateStart = ds;

    //Nel caso in cui dataEnd sia impostato, estraggo la data e verifico che sia maggiore o uguale a quella di inizio
    if(body.dateEnd != null){
        let de = new Date(body.dateEnd);
        de.setHours(12,0,0,0);
        body.dateEnd = de;
        if(ds > de){
            let err = app.buildBiggerError('dateStart', 'dateEnd', 'Event');
            return next(err);
        }
    }

    //Se l'evento non ha impostato una periodicity, significa che si ripeterà una sola volta.
    if (periodicity != null && periodicity != periodicity_enum.ONCE){
        //Verifichiamo che la periodicity assuma un valore valido, cioè da 1 al numero totale di valori che può assumere la periodicity
        if( periodicity <= 0 || periodicity > Object.keys(periodicity_enum).length ){
            let err = app.buildFormatError('periodicity', periodicity, 'Event');
            return next(err);
        }
        //Per capire quanti saranno gli schedule da creare è necessario che uno dei seguenti parametri venga impostato
        if ( body.hours == null && body.dateEnd == null ){
            //Restituisco un errore di presenza sul campo hours, il campro preferibile da riempire
            let err = app.buildPresenceError('hours', 'Event');
            return next(err);       
        }

        //Verifico che l'ora sia maggiore di zero
        if ( body.hours != null && parseInt(body.hours) <= 0 && body.dateEnd == null){
            let err = app.buildFormatError('hours', body.hours, 'Event');
            return next(err);
        }

        //Se è CUSTOM, verificare che l'array contenente i giorni della settimana sia corretto
        if ( periodicity == periodicity_enum.CUSTOM ){
            if ( body.weekDays == null){
                let err = app.buildPresenceError('weekDays', 'Event');
                return next(err);   
            }
            //Utilizzo la reduce che permette di filtrare eventuali ripetizioni e di individuare
            // eventuali valori non corretti
            body.weekDays = body.weekDays.reduce(function(weekDays, day, index) {
                //I valori vanno da 0 (Domenica) a 6 (Sabato) 
                if ( day < 0 || day > 6 ){
                    let err = app.buildFormatError('weekDays['+index+']', day, 'Event');
                    return next(err);
                }
                weekDays[day] = true;
                return weekDays;
            }, {});
        }
    }else{
        //Mi assicuro che periodicity venga impostato in modo da facilitare i controllli futuri
        body.periodicity = 1;
    }

    //Verifico che la stanza esista
    app.models.Room.exists(roomId, function(err, exists) {
        //Se ci sono errori, li mostro
        if(err) { return next(err); }
        if( !exists ){
          let err = app.buildFormatError('roomId', roomId, 'Event');
          return next(err);
        }
        //Fine dei controlli, posso proseguire
        next();
    });
}

exports.createSchedules = function(ctx, remoteMethodOutput, next, app) {
    let Schedule = app.models.Schedule;

    //Inizializzo il campo conflict
    remoteMethodOutput.conflict = false;

    //Mi assicuro che le ore e il periodicity siano numerici
    remoteMethodOutput.hours = parseInt(remoteMethodOutput.hours);
    remoteMethodOutput.periodicity = parseInt(remoteMethodOutput.periodicity);


    //Devo scegliere, in base alla request, quale sarà la funzione check da eseguire per sapere se proseguire con la creazione di schedule
    let check;
    if(remoteMethodOutput.periodicity == periodicity_enum.ONCE){
        //Creo una funzione dummy in modo che nel ciclo do-while si esca alla prima iterazione
        check = function(){
            return false;
        }
    }
    else if(remoteMethodOutput.hours > 0){
        check = checkHours;
    }
    else{
        check = checkDates;
    }

    //Uso le transazioni, in modo che se si dovesse verificare un errore, tutti gli schedule fino a quel momento creati
    // verranno eliminati. Notare il livello di isolazione: una volta che è stato creato uno schedule, voglio che tutti
    // gli altri eventuali schedule che vengono creati in concomitanza vedano gli schedule creati dalla transazione, in
    // modo da impostare correttamente il loro valore di conflict.
    Schedule.beginTransaction({isolationLevel: Schedule.Transaction.READ_UNCOMMITTED}, function(err, tx) {
        let actualDate = remoteMethodOutput.dateStart;
        let nextDate = remoteMethodOutput.dateStart;
        let actualHours = 0;
        let nextTotalHours = remoteMethodOutput.hoursPerEvent;
        let periodicity = remoteMethodOutput.periodicity;

        let lastSchedule = false;

        createNewSchedule(actualDate, nextDate, actualHours, nextTotalHours, periodicity, lastSchedule, remoteMethodOutput, Schedule, tx, check, next);
    });

    function createNewSchedule(actualDate, nextDate, actualHours, nextTotalHours, periodicity, lastSchedule, remoteMethodOutput, Schedule, tx, check, next){
        if (periodicity != null && periodicity != periodicity_enum.ONCE){
            actualHours = nextTotalHours;
            nextTotalHours += remoteMethodOutput.hoursPerEvent;
            actualDate = nextDate;
            //In base alla periodicità dovrò decidere quale sarà la prossima data dello schedule
            switch(periodicity){
                case periodicity_enum.DAILY:
                    nextDate = date_diff.newDate(nextDate, 1);
                    break;
                case periodicity_enum.WEEKLY:
                    nextDate = date_diff.newDate(nextDate, 7);
                    break;
                case periodicity_enum.MONTHLY:
                    nextDate = date_diff.newDate(nextDate, 30);
                    break;
                case periodicity_enum.CUSTOM:
                    let days = 0;
                    let indexDay = (new Date(nextDate)).getDay();
                    //Bisogna procedere in avanti fino a che non si trova il successivo giorno
                    do{
                        ++days;
                        indexDay = (indexDay + 1) % 7;
                    }while(remoteMethodOutput.weekDays[indexDay.toString()] == null);
                    nextDate = date_diff.newDate(nextDate, days);
                    break;
            }
        }
    
        lastSchedule = !check(actualHours, nextDate, remoteMethodOutput);
        console.log("lastSchedule = "+lastSchedule);

        function catchError(err){
            if(err){
                tx.rollback(function(err) {});
                Event.destroyById(remoteMethodOutput.id, function(err) {});
                return next(err);
            }
        }
    
        Schedule.create({
            starting: remoteMethodOutput.starting, 
            ending: remoteMethodOutput.ending,
            date: actualDate,
            roomId: remoteMethodOutput.roomId,
            eventId: remoteMethodOutput.id,
            lastSchedule: lastSchedule
        }, {transaction: tx}, function(err, schedule) {
            //In caso di errore, annullo la transazione, elimino l'evento che avevo creato e restituisco l'errore
            catchError(err);
            //Verifico la presenza di conflitti con lo schedule appena creato.
            // In caso affermativo, metterò nella risposta il campo conflict di risposta a true
            if(schedule.conflict){
                remoteMethodOutput.conflict = true;
            }
    
            //Se questo è l'ultimo schedule che deve essere creato per l'evento, effettuo il commit
            if(schedule.lastSchedule){
                // Aggiorno il dateEnd
                app.models.Event.findById(remoteMethodOutput.id, function(err, event){
                    catchError(err);

                    event.updateAttribute('dateEnd', schedule.date, function(err, event){
                        catchError(err);

                        remoteMethodOutput.dateEnd = schedule.date;
                        console.log("Committo e vado avanti");
                        tx.commit(function(err) {});
                        next();
                    });
                })
            }
            else{
                createNewSchedule(actualDate, nextDate, actualHours, nextTotalHours, periodicity, lastSchedule, remoteMethodOutput, Schedule, tx, check, next);
            }
        });
    }

     //Verifica che il numero di ore di schedule impostati fino a quel momento sia minore del numero di ore della request
     function checkHours(hours, nextDate, remoteMethodOutput){
        return hours < remoteMethodOutput.hours;
    }
    
    //Verifica che la data del prossimo schedule da impostare sia minore o uguale della data di fine evento
    function checkDates(hours, nextDate, remoteMethodOutput){
        return Date.parse(nextDate) <= Date.parse(remoteMethodOutput.dateEnd);
    }
}