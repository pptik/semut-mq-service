var  app = require('../app');
var appconfig = require('../setup/configs.json');
var userService = require('./users');
var trackerService = require('./tracker');
var queueServiceName = appconfig.broker_setup.queue_service_name;
var queueGps = appconfig.broker_setup.queue_service_name_gps;
var exchangeName = appconfig.broker_setup.exchange_name;
var defaultExchangeTopic = appconfig.broker_setup.default_exchange;

var states = {
    LOGIN: appconfig.broker_routes.login_route,
    SIGNUP: appconfig.broker_routes.register_route,
    GET_PROFILE: appconfig.broker_routes.get_profile_route,
    GET_PROFILE_BY_ID: appconfig.broker_routes.get_profile_by_id_route,
    GPS_TRACKER: appconfig.broker_routes.gps_tracker_route
};

function startService () {
    app.chnannel.assertExchange(exchangeName, 'topic', {durable: false});
    app.chnannel.assertQueue(queueServiceName, {exclusive: true}, function (err, q) {
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
    app.chnannel.assertQueue(queueGps, {exclusive: true}, function (err, q) {
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
        case states.LOGIN:
            console.log("-------------------------------------------------");
            console.log("request login diterima");
            userService.login(msg);
            break;
        case states.SIGNUP:
            console.log("-------------------------------------------------");
            console.log("request register diterima");
            userService.register(msg);
            break;
        case states.GET_PROFILE:
            console.log("-------------------------------------------------");
            console.log("request get profile diterima");
            userService.getprofile(msg);
            break;
        case states.GET_PROFILE_BY_ID:
            console.log("-------------------------------------------------");
            console.log("request get profile by id diterima");
            userService.getProfileById(msg);
            break;
        case states.GPS_TRACKER:
            console.log("-------------------------------------------------");
            console.log("update Tracker");
            trackerService.updateTracker(msg);
            break;
    }
}



module.exports = {
    startConsume: startService,
    startGpsConsume: startGpsService
};