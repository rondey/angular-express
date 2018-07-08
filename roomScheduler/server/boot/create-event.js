//Si occupa di creare la tabella Events nel database se essa non dovesse esistere.
//Questo script viene autoeseguito da Loopback in quanto si trova nella cartella boot 
module.exports = function(app) {
    app.dataSources.database.autoupdate('Event', function(err) {
      if (err) throw err;
      
      //Questa funzione permette anche di popolare la tabella se si sostituisce l'array vuoto con un array di oggetti che contengono le stesse proprietà del
      //modello Events
      app.models.Event.create([], function(err, Events) {
        if (err) throw err;
  
        console.log('Models created');
      });
    });
  };
  