var trackerModel = require('../../models/tracker');
var configs = require('../../setup/configs.json');

function startBroadcastElang(ch) {
		console.log("start Broadcast Elang");
        ch.assertExchange(configs.broker_setup.exchange_name_multi_broadcast, 'topic', {durable: false});
        ch.assertQueue(configs.broker_setup.queue_broadcast_type_elang_unit1, {exclusive: false, messageTtl: 1000}, function (err, q) {
            if (err) {
                console.log("error : %s",err);
            } else {
                ch.bindQueue(q.queue, configs.broker_setup.exchange_name_multi_broadcast, configs.broker_setup.queue_broadcast_type_elang_unit1);
                setInterval(function () {
                    trackerModel.getElangTracker(null, function (err, result) {
                        if(err){
                            console.log(err);
                            result = {success: false};
                        }else result = {success:true, data:result};
                        var msg = JSON.stringify(result);
                        ch.publish(configs.broker_setup.exchange_name_multi_broadcast, configs.broker_routes.broadcast_tracker_type_elang, new Buffer(msg));
                    });
                }, 1500);
            }
        });
}

module.exports = {
    startBroadcastElang:startBroadcastElang
};