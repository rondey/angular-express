'use strict';

module.exports = function (Event) {
    let event_validator = require('../event_validator');
    let hourModule = require('../hour');

    Event.validatesFormatOf('starting', {with: hourModule.time_format, allowBlank: true});
    Event.validatesFormatOf('ending', {with: hourModule.time_format, allowBlank: true});
    Event.validatesFormatOf('hours', {int: true, allowBlank: true});

    //I campi di starting e di ending servono solo per creare i relativi event, di conseguenza servono
    // solo se si sta creando una nuova istanza, cioè quando viene effettuato una POST o una PUT senza 
    // aver impostato l'id oppure si chiama il metodo findOrCreate, che si traduce in una chiamata al metodo create nel primo caso e in una
    // chiamata al metodo replaceOrCreate nel secondo

    Event.beforeRemote('create', function (ctx, modelInstance, next) {
        event_validator.checkParameters(ctx, next, Event.app);
    });

    Event.beforeRemote('replaceOrCreate', function (ctx, modelInstance, next) {
        if(ctx.req.body.id == null){
            event_validator.checkParameters(ctx, next, Event.app);
        }
    });

    Event.beforeRemote('findOrCreate', function (ctx, modelInstance, next) {
        event_validator.checkParameters(ctx, next, Event.app);
    });

    Event.afterRemote('create', function (ctx, remoteMethodOutput, next) {
        event_validator.createSchedules(ctx, remoteMethodOutput, next, Event.app);
    });

    Event.afterRemote('replaceOrCreate', function (ctx, remoteMethodOutput, next) {
        if(ctx.req.body.id == null){
            event_validator.createSchedules(ctx, remoteMethodOutput, next, Event.app);
        }
    });

    Event.afterRemote('findOrCreate', function (ctx, remoteMethodOutput, next) {
        event_validator.createSchedules(ctx, remoteMethodOutput, next, Event.app);
    });

    
};