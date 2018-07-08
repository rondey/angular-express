//Si occupa di creare la tabella Rooms nel database se essa non dovesse esistere.
//Questo script viene autoeseguito da Loopback in quanto si trova nella cartella boot 
module.exports = function(app) {
    app.dataSources.database.autoupdate('Room', function(err) {
      if (err) throw err;
      
      //Questa funzione permette anche di popolare la tabella se si sostituisce l'array vuoto con un array di oggetti che contengono le stesse proprietà del
      //modello Rooms
      app.models.Room.create([
        {name: 'aula 1', capacity: 140, wifi: true, socket: true},
        {name: 'aula 2', capacity: 90, wifi: true, socket: true, computer: true, interactiveWhiteboard: true},
      ], function(err, Rooms) {
        //if (err) throw err;
  
        console.log('Models created');
      });
    });
  };
  