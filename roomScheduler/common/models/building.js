'use strict';

module.exports = function(Building) {
    //Dimensione massima di lunghezza per InnoDB per colonne con indice unico
    Building.validatesLengthOf('name', {max: 191, message: {max: 'Name too long'}});
    
    /*Gli orari di apertura e di chiusura devono essere corretti
     Si usano le regular expression per effettuare la verifica.
     L'espressione regolare time_format verifica che la stringa inizi con alla sinistra del carattere ':'
     una delle seguenti:
     a) Un numero di una sola cifra, da 0 a 9
     b) Un numero che abbia come prima cifra 0 e come seconda cifra un numero da 0 a 9
     c) Un numero che abbia come prima cifra 2 e come seconda cifra un numero da 0 a 3
     
     Alla destra del carattere ':' terminerà con alla prima cifra un numero da 0 a 5 e la seconda cifra
     un numero da 0 a 9

    */
    let time_format = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;


    Building.validatesFormatOf('openingTime', {with: time_format});
    Building.validatesFormatOf('closingTime', {with: time_format});


    Building.observe('before save', function(ctx, next) {
        let model=ctx.Model;
        var data = ctx.instance || ctx.data;
        console.log(
            "> before save triggered:",
            ctx.Model.modelName,
            data
          );
          //Verifica che l'ora di inizio è minore dell'ora di fine (nota bene: la data non è importante, basta che siano uguali)
          let scheduleStart = Date.parse(`01/01/2018 ${data['openingTime']}:00`);
          let scheduleEnd = Date.parse(`01/01/2018 ${data['closingTime']}:00`);
          if(scheduleStart >= scheduleEnd){
            //Preparo l'invio di un messaggio di errore, non devo proseguire nella creazione del Building
            let err=Building.app.buildBiggerError('openingTime', 'closingTime', ctx);
            return next(err);
          }
          next();
    });
}
