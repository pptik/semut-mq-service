var app = require('../app');
var appconfig = require('../setup/configs.json');
var rest = require('restler');

exports.updateLocation = function (msg) {
    var req = JSON.parse(msg.content.toString());
    console.log(req);
    rest.post('http://localhost:3030/api/location/store', {
        headers: {'Content-Type':'application/x-www-form-urlencoded'},
        data: req
    }).on('complete', function(data, response) {
        app.chnannel.sendToQueue(msg.properties.replyTo, new Buffer(JSON.stringify(data)), {
            correlationId: msg.properties.correlationId,
            type: appconfig.type.callback
        });
    });
};