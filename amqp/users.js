var app = require('../app');
var userModel = require('../models/users');

exports.login = function (msg) {
    var req = JSON.parse(msg.content.toString());
    console.log(req);
    userModel.login(req, function(err, response) {
     console.log(response);
        app.chnannel.sendToQueue(msg.properties.replyTo, new Buffer(JSON.stringify(response)), {
            correlationId: msg.properties.correlationId,
            type: "callback"
        });
     });

}