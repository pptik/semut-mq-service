var app = require('../app');
var appconfig = require('../setup/configs.json');
var rest = require('restler');

exports.updateLocation = function (msg) {
    var req = JSON.parse(msg.content.toString());
    console.log(req);
    rest.post(appconfig.rest_api_uri+'location/store', {
        headers: {'Content-Type':'application/x-www-form-urlencoded'},
        data: req['store']
    }).on('complete', function(data, response) {
        var success = (data['success'] == true) ? true : false;
        if(success) {
            rest.post(appconfig.rest_api_uri+'location/mapview', {
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                data: req['mapview']
            }).on('complete', function (data, response) {
                app.chnannel.sendToQueue(msg.properties.replyTo, new Buffer(JSON.stringify(data)), {
                    correlationId: msg.properties.correlationId,
                  //  type: appconfig.type.callback
                    type: msg.properties.type
                });
            });
        }else {
            app.chnannel.sendToQueue(msg.properties.replyTo, new Buffer(JSON.stringify(data)), {
                correlationId: msg.properties.correlationId,
               // type: appconfig.type.callback
                type: msg.properties.type
            });
        }
    });
};