'use strict';

module.exports = function (Schedule) {
  let hourModule = require('../hour');


  Schedule.validatesFormatOf('starting', { with: hourModule.time_format });
  Schedule.validatesFormatOf('ending', { with: hourModule.time_format });

  //Bisogna verificare che la prenotazione si verifichi in un orario in cui l'edificio sia aperto.
  //Per farlo, si usa un operational hook che possa intercettare la creazione o la modifica di una istanza
  //prima che venga salvata nella tabella 
  Schedule.observe('before save', function (ctx, next) {
    let model = ctx.Model;
    var data = ctx.instance || ctx.data;
    console.log(
      "> before save triggered:",
      ctx.Model.modelName,
      data
    );
    //Verifica che l'ora di inizio è minore dell'ora di fine (nota bene: la data non è importante, basta che siano uguali)
    let scheduleStart = Date.parse(`01/01/2018 ${data.starting}:00`);
    let scheduleEnd = Date.parse(`01/01/2018 ${data.ending}:00`);

    if (scheduleStart >= scheduleEnd) {
      //Preparo l'invio di un messaggio di errore, non devo proseguire nella creazione dello Schedule
      let err = Schedule.app.buildBiggerError('starting', 'ending', ctx);
      return next(err);
    }

    //Bisogna adesso verificare che gli orari di svolgimento dell'evento avvengano mentre l'edificio in cui si
    // svolgerà l'evento è effettivamento all'interno degli orari di apertura
    //Si accede al modello Room dalla lista di modelli e di trovare la stanza dello scheduling,
    // includendo nei risultati anche il building in cui si trova la stanza:
    Schedule.app.models.Room.findById(data.roomId, {
      include: { // includo il building
        relation: 'building'
      }
    }, function (err, room) {
      if(err){ return next(err) };

      let buildOpening = Date.parse(`01/01/2018 ${room.building['opening-time']}:00`);
      let buildClosing = Date.parse(`01/01/2018 ${room.building['closing-time']}:00`);


      if (buildOpening > scheduleStart || buildClosing < scheduleEnd) {
        //Verifico il caso e decido di conseguenza i componenti della response
        let smaller = '';
        let bigger = '';
        if (buildOpening > scheduleStart) {
          smaller = 'starting';
          bigger = 'room.building.opening-time';
        }
        else {
          smaller = 'ending';
          bigger = 'room.building.closing-time';
        }
        let err = Schedule.app.buildBiggerError(bigger, smaller, 'Schedule');
        return next(err);
      }

      //Dalla date estraggo la data, l'ora non mi serve
      let ds = new Date(data.date);
      ds.setHours(12,0,0,0);
      data.date = ds;

      /*
    Ricerca di conflitti:
    1) starting <= data.starting < ending 
    2) starting < data.ending <= ending
    3) data.starting < starting && ending < data.ending

    Gli schedule devono avere la proprietà conflict a false: se un evento aveva generato
    un conflitto e successivamente viene eliminato, il suo spazio diventa disponibile per
    tutti gli altri eventi. In tal caso, il primo utente fortunato che si accorgerà
    che il conflitto non esiste più, avrà l'opportunità di convertire il suo schedule
    in non conflittuale (a patto ovviamente che non vada a essere in conflitto con 
    altri schedule in contemporanea).

    Gli schedule devono avvenire nella stessa stanza, perciò le proprietà room devono essere
    uguali.

    Gli schedule devono avvenire nello stesso giorno, perciò le proprietà date devono essere 
    uguali.
  */


      //lt: minore di, lte: minore o uguale di, gt: maggiore di, gte maggiore o uguale di
      //Mi basta trovare uno schedule che và in conflitto, per questo uso findOne
      let where = {
        and: [{
          or: [
            { and: [{ starting: { lte: data.starting } }, { ending: { gt: data.starting } }] },
            { and: [{ starting: { lt: data.ending } }, { ending: { gte: data.ending } }] },
            { and: [{ starting: { gt: data.starting } }, { ending: { lt: data.ending } }] }
          ]
        },
        { conflict: false },
        { roomId: data.roomId },
        { date: data.date }]
      }

      //Se sto facendo una modifica dello schedule, non devo includere nella ricerca di conflitto lo schedule per com'era in precedenza
      if( ctx.currentInstance != null ){
        where.and.push( { id: { neq: ctx.currentInstance.id } } );
      }
      
      Schedule.findOne({
        where: where
      }, function (err, schedule) {
        if(err){ return next(err) };

        //Se è stato trovato un conflitto, bisogna impostare il campo conflict dello schedule che sta per essere salvato
        if(schedule !== null){
          data.conflict = true;
          
          console.log("Ecco lo schedule che genera il conflitto");
          console.log(schedule);
        }
        else{
          //Il conflitto non esiste.
          data.conflict = false;
        }
        
        next();
      });
    });
  });
};
