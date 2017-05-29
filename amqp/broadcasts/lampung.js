var trackerModel = require('../../models/tracker');
var configs = require('../../setup/configs.json');


/** App ID Lampung = 2 **/
function startBroadcastBus(ch) {
    ch.assertExchange(configs.broker_setup.exchange_name_multi_broadcast, 'topic', {durable: false});
    ch.assertQueue(configs.broker_setup.queue_broadcast_type_bus_lampung, {exclusive: false, messageTtl: 1000}, (err, q) => {
        if (err) {
            console.log("error : %s",err);
        } else {
            ch.bindQueue(q.queue, configs.broker_setup.exchange_name_multi_broadcast, configs.broker_setup.queue_broadcast_type_bus_lampung);
            setInterval(function () {
                var response;
                trackerModel.getBusTrackerByAppID({AppID: 2}).then(items => {
                    response = {success:true, data:items};
                    var msg = JSON.stringify(response);
                    ch.publish(configs.broker_setup.exchange_name_multi_broadcast, configs.broker_routes.broadcast_tracker_type_bus_lampung, new Buffer(msg));
                }).catch(err => {
                    console.log(err);
                    response = {success: false, message: "unknown error", raw : err};
                    var msg = JSON.stringify(response);
                    ch.publish(configs.broker_setup.exchange_name_multi_broadcast, configs.broker_routes.broadcast_tracker_type_bus_lampung, new Buffer(msg));
                });

            }, 1500);
        }
    });
}

module.exports = {
    startBroadcastBus:startBroadcastBus
};