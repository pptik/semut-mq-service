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
    USER_UPDATE_USER_LOCATION : appconfig.broker_routes.user_update_user_location,
    USER_EMERGENCY_REPORT : appconfig.broker_routes.emergency_report,
    TAXI_ORDER : appconfig.broker_routes.taxi_order
};


/** Common Service **/
function startService () {
    app.chnannel.assertExchange(exchangeName, 'topic', {durable: false});
    app.chnannel.prefetch(1);
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




/** Hardware location Services **/
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

/** Broadcast All Tracker **/
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
        });
    }, 1500);
}


/* Broadcast Multi Tracker */
function broadcastMultiTrackers() {
    var broadcaster = require('./broadcaster');
    broadcaster.startBroadcastAngkot(app.chnannel);
    broadcaster.startBroadcastBus(app.chnannel);
}



function checkState(state, msg) {
    switch (state){
        case states.GPS_TRACKER:
            console.log("-------------------------------------------------");
            console.log("update Tracker");
            console.log("-------------------------------------------------");
            trackerService.updateTracker(msg, function (err, result) {
                if(err) console.log(err);
                else console.log(result);
            });
            break;
        case states.GPS_TRACKER_GET_ALL:
            console.log("-------------------------------------------------");
            console.log("request all Tracker");
            console.log("-------------------------------------------------");
            trackerService.getAllTracker(msg);
            break;
        case states.USER_UPDATE_USER_LOCATION:
            console.log("-------------------------------------------------");
            console.log("update user loation");
            console.log("-------------------------------------------------");
            userService.updateLocation(msg);
            break;
        case states.USER_EMERGENCY_REPORT:
            console.log("-------------------------------------------------");
            console.log("user emergency");
            console.log("-------------------------------------------------");
            userService.addEmergency(msg);
            break;
        case states.TAXI_ORDER:
            console.log("-------------------------------------------------");
            console.log("order a taxi");
            console.log("-------------------------------------------------");
            userService.requestTaxi(msg);
            break;
    }
}



module.exports = {
    startGpsConsume: startGpsService,
    startService: startService,
    broadcastTrackers:broadcastTrackers,
    broadcastMultiTrackers:broadcastMultiTrackers
};
