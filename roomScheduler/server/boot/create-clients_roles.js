//Si occupa di creare la tabella Clients nel database se essa non dovesse esistere.
//Questo script viene autoeseguito da Loopback in quanto si trova nella cartella boot 
module.exports = function(app) {
    app.dataSources.database.autoupdate('Client', function(err) {
      if (err) throw err;
      
      //Questa funzione permette anche di popolare la tabella se si sostituisce l'array vuoto con un array di oggetti che contengono le stesse proprietà del
      //modello Clients
      app.models.Client.create([
        {username: 'admin', email: 'admin@admin.com', password: 'admin', name: 'admin', surname: 'admin'},
        {username: 'user', email: 'user@user.com', password: 'user', name: 'user', surname: 'user'},
        {username: 'user2', email: 'user2@user.com', password: 'user', name: 'user2', surname: 'user2'}
      ], function(err, clients) {
        //if (err) throw err;
  
        console.log('Models created');

        //Creo la tabella Role (se ancora non esiste) e creo il ruolo admin
        app.dataSources.database.autoupdate('Role', function(err) {
          if (err) throw err;
          
          //Creo il ruolo admin
          app.models.Role.create({
            name: 'admin'
          }, function(err, role) {
            //if (err) throw(err);

            //Creo la tabella RoleMapping (se ancora non esiste) e associo il ruolo admin al relativo utente
            app.dataSources.database.autoupdate('RoleMapping', function(err) {
              if (err) throw err;

              //make admin an admin
              role.principals.create({
                principalType: app.models.RoleMapping.USER,
                principalId: clients[0].id,
                roleId: role.id
              }, function(err, principal) {
                if (err) throw(err);
              });
            });
          });
        });

        
      });
    });
  };
  