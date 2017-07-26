var app = require('../app');
var trackerModel = require('../models/tracker');
var appconfig = require('../setup/configs.json');

exports.updateTracker = function (msg, callback) {
    var req = JSON.parse(msg.content.toString());
    console.log(req);

    trackerModel.updateTracker(req, function (err, response) {
       if(err){
           callback({sucess:false, message: "server tidak merespon"}, null);
       }else {
           callback(null, response);
       }
    });
};


exports.getAllTracker = function (msg) {
    var req = JSON.parse(msg.content.toString());
    console.log(req);
    trackerModel.getAllTracker(req, function (err, results) {
        var res;
        if(err) {
            res = err;
        }
        else {
            res = results;
        }
        app.chnannel.sendToQueue(msg.properties.replyTo, new Buffer(JSON.stringify(res)), {
            correlationId: msg.properties.correlationId,
            type: appconfig.type.callback
        });

    });
};