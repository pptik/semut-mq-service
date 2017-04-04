var trackerModel = require('../models/tracker');
var configs = require('../setup/configs.json');

function startBroadcastAngkot(ch) {
        ch.assertExchange(configs.broker_setup.exchange_name_multi_broadcast, 'topic', {durable: false});
        ch.assertQueue(configs.broker_setup.queue_broadcast_type_angkot, {exclusive: false, messageTtl: 1000}, function (err, q) {
            if (err) {
                console.log("error : %s",err);
            } else {
                ch.bindQueue(q.queue, configs.broker_setup.exchange_name_multi_broadcast, configs.broker_setup.queue_broadcast_type_angkot);
                setInterval(function () {
                    trackerModel.getAngkotTracker(null, function (err, result) {
                        if(err){
                            console.log(err);
                            result = {success: false};
                        }else result = {success:true, data:result};
                        var msg = JSON.stringify(result);
                        ch.publish(configs.broker_setup.exchange_name_multi_broadcast, configs.broker_routes.broadcast_tracker_type_angkot, new Buffer(msg));
                    });
                }, 1500);
            }
        });
}


function startBroadcastBus(ch) {
    ch.assertExchange(configs.broker_setup.exchange_name_multi_broadcast, 'topic', {durable: false});
    ch.assertQueue(configs.broker_setup.queue_broadcast_type_bus, {exclusive: false, messageTtl: 1000}, function (err, q) {
        if (err) {
            console.log("error : %s",err);
        } else {
            ch.bindQueue(q.queue, configs.broker_setup.exchange_name_multi_broadcast, configs.broker_setup.queue_broadcast_type_bus);
            setInterval(function () {
                trackerModel.getBusTracker(null, function (err, result) {
                    if(err){
                        console.log(err);
                        result = {success: false};
                    }else result = {success:true, data:result};
                    var msg = JSON.stringify(result);
                    ch.publish(configs.broker_setup.exchange_name_multi_broadcast, configs.broker_routes.broadcast_tracker_type_bus, new Buffer(msg));
                });
            }, 1500);
        }
    });
}

module.exports = {
    startBroadcastAngkot:startBroadcastAngkot,
    startBroadcastBus:startBroadcastBus
};