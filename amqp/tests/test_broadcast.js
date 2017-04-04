var amqp = require('amqplib/callback_api');
var configs = require('../../setup/configs.json');


var exchangeName = "semut.broadcast";

amqp.connect(configs.broker_uri, function(err, conn) {
    conn.createChannel(function(err, ch) {
        startBroadcast(ch);
    });
});


function startBroadcast(ch) {
    var counter = 0;
    setInterval(function () {
        counter += 1;
        ch.assertExchange(exchangeName, 'topic', {durable: false});
        ch.assertQueue("broadcast.tracker.angkot", {exclusive: false, messageTtl: 1000}, function (err, q) {
            if (err) {
                console.log("error : %s",err);
            } else {
                ch.bindQueue(q.queue, exchangeName, "broadcast.tracker.angkot");
                var msg = "test aja "+counter;
                ch.publish(exchangeName, 'broadcast.tracker.angkot', new Buffer(msg));

            }
        });
    }, 1500);

    setInterval(function () {
        ch.assertExchange(exchangeName, 'topic', {durable: false});
        ch.assertQueue("broadcast.tracker.bus", {exclusive: false, messageTtl: 1000}, function (err, q) {
            if (err) {
                console.log("error : %s",err);
            } else {
                ch.bindQueue(q.queue, exchangeName, "broadcast.tracker.bus");
                var msg = "test banget";
                ch.publish(exchangeName, 'broadcast.tracker.bus', new Buffer(msg));

            }
        });
    }, 1500);
}