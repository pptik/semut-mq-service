var app = require('../app');
var locationController = require('../controllers/location_controller');

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