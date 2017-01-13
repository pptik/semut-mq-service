var  app = require('../app');
var appconfig = require('../setup/configs.json');
var userService = require('./users');
var queueServiceName = appconfig.broker_setup.queue_service_name;
var exchangeName = appconfig.broker_setup.exchange_name;

var states = {
    LOGIN: appconfig.broker_routes.login_route,
    SIGNUP: appconfig.broker_routes.register_route,
    GET_PROFILE: appconfig.broker_routes.get_profile_route,
    GET_PROFILE_BY_ID: appconfig.broker_routes.get_profile_by_id_route
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


function checkState(state, msg) {
    switch (state){
        case states.LOGIN:
            userService.login(msg);
            console.log("request login diterima");
            break;
        case states.SIGNUP:
            userService.register(msg);
            console.log("request register diterima");
            break;
        case states.GET_PROFILE:
            userService.getprofile(msg);
            console.log("request get profile diterima");
            break;
        case states.GET_PROFILE_BY_ID:
            userService.getProfileById(msg);
            console.log("request get profile by id diterima");
            break;
    }
}



module.exports = {
    startConsume: startService
};