var app = require('../app');
var trackerModel = require('../models/tracker');
var appconfig = require('../setup/configs.json');

exports.updateTracker = function (msg) {
    var req = JSON.parse(msg.content.toString());
    console.log(req);

    trackerModel.updateTracker(req, function (err, response) {
       if(err){
           console.log({sucess:false, message: "server tidak merespon"})
       }else {
           console.log(response);
       }
    });
    /*userModel.login(req, function(err, response) {
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
    }); */
};