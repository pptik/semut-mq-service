var  app = require('../app');
var appconfig = require('../setup/configs.json');
var trackerService = require('./tracker');
var userService = require('./users');
var queueGps = appconfig.broker_setup.queue_service_name_gps;
var defaultExchangeTopic = appconfig.broker_setup.default_exchange;
var exchangeName = appconfig.broker_setup.exchange_name;
var queueServiceName = appconfig.broker_setup.queue_service_name;

var modelTracker = require('../models/tracker');

var states = {
    GPS_TRACKER: appconfig.broker_routes.gps_tracker_route,
    GPS_TRACKER_GET_ALL: appconfig.broker_routes.gps_get_all_tracker,
    USER_UPDATE_USER_LOCATION : appconfig.broker_routes.user_update_user_location
};



function startService () {
    app.chnannel.assertExchange(exchangeName, 'topic', {durable: false});
    app.chnannel.assertQueue(queueServiceName, {exclusive: false}, function (err, q) {
        if (err) {
            console.log("error : %s",err);
        } else {
            app.chnannel.bindQueue(q.queue, exchangeName, appconfig.broker_routes.service_route);
            app.chnannel.consume(q.queue, function (msg) {
                console.log(msg.content.toString());
                checkState(msg.fields.routingKey, msg);
            }, {noAck: true});
        }
    });
}





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


function broadcastTrackers() {
    var  exchangeName = appconfig.broker_setup.exchange_name_broadcast;
    app.chnannel.assertExchange(exchangeName, 'fanout', {durable: false});
    setInterval(function () {
        modelTracker.getAllTracker(null, function (err, results) {
            if(err){
                console.log(err);
                results = {success:false};
            }else {
                results = {success:true, data:results};
            }
            var msg = JSON.stringify(results);
            app.chnannel.publish(exchangeName, '', new Buffer(msg));
            //console.log(" [x] Sent %s", msg);
        });
    }, 1500);
}


function checkState(state, msg) {
    switch (state){
        case states.GPS_TRACKER:
            console.log("-------------------------------------------------");
            console.log("update Tracker");
            trackerService.updateTracker(msg, function (err, result) {
                if(err) console.log(err);
                else console.log(result);
            });
            break;
        case states.GPS_TRACKER_GET_ALL:
            console.log("-------------------------------------------------");
            console.log("request all Tracker");
            trackerService.getAllTracker(msg);
            break;
        case states.USER_UPDATE_USER_LOCATION:
            console.log("-------------------------------------------------");
            console.log("update user loation");
            userService.updateLocation(msg);
            break;
    }
}



module.exports = {
    startGpsConsume: startGpsService,
    startService: startService,
    broadcastTrackers:broadcastTrackers
};
