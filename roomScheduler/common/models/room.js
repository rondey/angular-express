'use strict';

module.exports = function (Room) {
    let hourModule = require('../hour');

    Room.validatesFormatOf('starting', {with: hourModule.time_format, allowBlank: true});
    Room.validatesFormatOf('ending', {with: hourModule.time_format, allowBlank: true});


    //Definisco un metodo del client che mi permetta di individuare tutti gli schedule di un determinato evento
    Room.__find__empty = function (dateSchedule, startingSchedule, endingSchedule, idSchedule, next) {
        let app = this.app;
        if(!hourModule.time_format.test(startingSchedule)){
            let err = app.buildPresenceError('starting', 'Room');
            return next(err);
        }

        if(!hourModule.time_format.test(endingSchedule)){
            let err = app.buildPresenceError('ending', 'Room');
            return next(err);
        }

        idSchedule = parseInt(idSchedule);

        Room.find({}, function (err, rooms) {
            if (err) { return next(err) };


            let roomsFiltered = [];

            let roomsIterator = rooms[Symbol.iterator]();

            nextIteration(roomsIterator, roomsFiltered);
        });

        function nextIteration(roomsIterator, rooms) {
            let room = roomsIterator.next().value;
            if (!room) {
                return next(null, rooms);
            }

            let where = {
                and: [{
                    or: [
                        { and: [{ starting: { lte: startingSchedule } }, { ending: { gt: startingSchedule } }] },
                        { and: [{ starting: { lt: endingSchedule } }, { ending: { gte: endingSchedule } }] },
                        { and: [{ starting: { gt: startingSchedule } }, { ending: { lt: endingSchedule } }] }
                    ]
                },
                { conflict: false },
                { date: dateSchedule }]
            };

            //Se sto facendo una modifica dello schedule, non devo includere nella ricerca di conflitto lo schedule per com'era in precedenza
            if( idSchedule > 0 ){
                where.and.push( { id: { neq: idSchedule } } );
            }

            room.schedules.count(where, function (err, count) {
                if (err) { return next(err); };

                if(count == 0){
                    rooms.push(room);
                }

                nextIteration(roomsIterator, rooms);
            })
        }

    }

    //Definisco il metodo REST per la ricerca di stanze disponibili per l'orario e il giorno richiesto. 
    Room.remoteMethod(
        //Il nome del metodo simula il nome che avrebbe il metodo se fosse definito da loopback
        '__find__empty', {
            accepts: [{
                arg: 'date',
                type: 'date',
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
                arg: 'scheduleId',
                type: 'number',
                required: false
            }
            ],
            http: {
                path: '/empty',
                verb: 'get'
            },
            returns: {
                root: true,
                type: 'array'
            },
            documented: true,
            description: "Find empty rooms for that day"
        }
    );
};
