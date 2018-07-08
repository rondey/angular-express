'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');

var app = module.exports = loopback();

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});

app.buildDupError = function(err) {
  console.log("Gestione dell'errore");
  //Tramite la regular expression cerco l'ultima parola con gli apostrofi. Essa sarà la proprietà duplicata
  let patternArray = /'\w+'$/.exec(err.message);
  
  let key = patternArray[0];
  console.log(key);
  //restituisco il nome della proprietà senza gli apostrofi. 
  err.details = {
    key: key.substring(1,key.length-1)
  }
  err.message = 'Duplicate entry';
  err.statusCode = 409; // override the status
  

  // remove the statusCode property
  //delete err.statusCode;

  console.log(err);

  return err;
};

app.buildNoInstanceError = function(id, modelName){
  let err = new Error("No instance with id "+id+" found for "+modelName);
  err.name = "Error";
  err.statusCode = 404;

  return err;
}

app.buildBiggerError = function(bigger, smaller, modelName){
  //Preparo l'invio di un messaggio di errore, non devo proseguire nella creazione dello Building
  let description = "`"+bigger+"` is bigger than `"+smaller+"`; `"+smaller+"` is smaller than `"+bigger+"`";
  let codes = new Object();
  codes[bigger] = "value";
  codes[smaller] = "value";

  let messages = new Object();
  messages[bigger] = ["is bigger than"];
  messages[smaller] = ["is lower than"];

  let err=app.ValidationErrorBuilder(modelName, description, codes, messages);
  return err;
}

app.buildPresenceError = function(field, modelName){
  //Preparo l'invio di un messaggio di errore, non devo proseguire nella creazione dello Building
  let description = "`"+field+"` can't be blank; `"+field+"` is blank";
  let codes = new Object();
  codes[field] = [ "presence", "format.blank"];

  let messages = new Object();
  messages[field] = ["can't be blank", "is blank"];

  let err=app.ValidationErrorBuilder(modelName, description, codes, messages);
  return err;
}

app.buildFormatError = function(field, value, modelName){
  //Preparo l'invio di un messaggio di errore, non devo proseguire nella creazione dello Building
  let description = "`"+field+"` is invalid (value: \""+value+"\")";
  let codes = new Object();
  codes[field] = ["format"];

  let messages = new Object();
  messages[field] = ["is invalid"];

  let err=app.ValidationErrorBuilder(modelName, description, codes, messages);
  return err;
}

app.ValidationErrorBuilder = function(modelName, description, codes, messages){
  let err = new Error("L'istanza `"+modelName+"` non è valida. Dettagli: "+description);
  err.name = "ValidationError"
  err.statusCode = 422;
  err.details = {
    "context" : modelName,
    "codes" : codes,
    "messages" : messages
  };
  return err;
} 
