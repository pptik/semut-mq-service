var  app = require('../app');
var appconfig = require('../setup/configs.json');
var trackerService = require('./tracker');
var queueGps = appconfig.broker_setup.queue_service_name_gps;
var defaultExchangeTopic = appconfig.broker_setup.default_exchange;

var states = {
    GPS_TRACKER: appconfig.broker_routes.gps_tracker_route
};


function startGpsService () {
    app.chnannel.assertExchange(defaultExchangeTopic, 'topic', {durable: true});
    app.chnannel.assertQueue(queueGps, {exclusive: false}, function (err, q) {
        if (err) {
            console.log("error : %s",err);
        } else {
            app.chnannel.bindQueue(q.queue, defaultExchangeTopic, appconfig.broker_routes.service_route_gps);
            app.chnannel.consume(q.queue, function (msg) {
                console.log(msg.content.toString());
                checkState(msg.fields.routingKey, msg);
            }, {noAck: true});
        }
    });
}


function checkState(state, msg) {
    switch (state){
        case states.GPS_TRACKER:
            console.log("-------------------------------------------------");
            console.log("update Tracker");
            trackerService.updateTracker(msg);
            break;
    }
}



module.exports = {
    startGpsConsume: startGpsService
};
