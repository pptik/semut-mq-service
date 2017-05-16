var app = require('../app');
var locationController = require('../controllers/location_controller');
var emergencyController = require('../controllers/emergency_controller');
var taxiController = require('../controllers/taxi_controller');
var notifier = require('./notification_service');
var routingKey = require('../setup/configs.json').broker_routes.emergency_notifier;

exports.updateLocation = function (msg) {
    var req = JSON.parse(msg.content.toString());
    console.log(req);
    locationController.store(req, function (err, data) {
        if(err){
            console.log(err);
                var response = {success:false, message: "Terjadi kesalahan pada server / server tidak merespon"};
                app.chnannel.sendToQueue(msg.properties.replyTo, new Buffer(JSON.stringify(response)), {
                    correlationId: msg.properties.correlationId,
                    type: msg.properties.type
                });
        } else {
            console.log(data);
            app.chnannel.sendToQueue(msg.properties.replyTo, new Buffer(JSON.stringify(data)), {
                correlationId: msg.properties.correlationId,
                type: msg.properties.type
            });
        }
    });
};


exports.requestTaxi  = msg => {
    var req = JSON.parse(msg.content.toString());
    taxiController.requestTaxi(req).then(result => {
        app.chnannel.sendToQueue(msg.properties.replyTo, new Buffer(JSON.stringify(result)), {
            correlationId: msg.properties.correlationId,
            type: msg.properties.type
        });
        if(result['success']){
            app.chnannel.sendToQueue(result['driver_queue'], new Buffer(JSON.stringify(result)), {
                correlationId: msg.properties.correlationId,
                type: msg.properties.type
            });
        }
    }).catch(err => {
        console.log(err);
        var response = {success:false, message: "Terjadi kesalahan pada server / server tidak merespon"};
        app.chnannel.sendToQueue(msg.properties.replyTo, new Buffer(JSON.stringify(response)), {
            correlationId: msg.properties.correlationId,
            type: msg.properties.type
        });
    })
};


exports.addEmergency = function (msg) {
  var req = JSON.parse(msg.content.toString());
  emergencyController.insertEmergency(req).then(function (result) {
      console.log(result);
      notifier.sendNotification(req, routingKey);
  }).catch(function (err) {
     console.log('Oops, insert emergency error : '+err);
  });
};