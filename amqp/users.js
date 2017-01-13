var app = require('../app');
var userModel = require('../models/users');
var appconfig = require('../setup/configs.json');

exports.login = function (msg) {
    var req = JSON.parse(msg.content.toString());
    console.log(req);
    userModel.login(req, function(err, response) {
        var res;
        if(err){
            res = appconfig.messages.server_error;
        }else {
            console.log(response);
            res = response;
        }
        app.chnannel.sendToQueue(msg.properties.replyTo, new Buffer(JSON.stringify(res)), {
            correlationId: msg.properties.correlationId,
            type: appconfig.type.callback
        });
     });
};


exports.register = function (msg) {
    var req = JSON.parse(msg.content.toString());
    console.log(req);
    userModel.register(req, function(err, response) {
        var res;
        if(err){
            res = appconfig.messages.server_error;
        }else {
            console.log(response);
            res = response;
        }
        app.chnannel.sendToQueue(msg.properties.replyTo, new Buffer(JSON.stringify(res)), {
            correlationId: msg.properties.correlationId,
            type: appconfig.type.callback
        });
    });

};


exports.getprofile = function (msg) {
    var req = JSON.parse(msg.content.toString());
    console.log(req);
    userModel.getProfile(req, function(err, response) {
        var res;
        if(err){
            res = appconfig.messages.server_error;
        }else {
            console.log(response);
            res = response;
        }
        app.chnannel.sendToQueue(msg.properties.replyTo, new Buffer(JSON.stringify(res)), {
            correlationId: msg.properties.correlationId,
            type: appconfig.type.callback
        });
    });
};

exports.getProfileById = function (msg) {
    var req = JSON.parse(msg.content.toString());
    userModel.getProfileById(req, function(err, response) {
        var res;
        if(err){
            res = appconfig.messages.server_error;
        }else {
            console.log(response);
            res = response;
        }
        app.chnannel.sendToQueue(msg.properties.replyTo, new Buffer(JSON.stringify(res)), {
            correlationId: msg.properties.correlationId,
            type: appconfig.type.callback
        });
    });
}


