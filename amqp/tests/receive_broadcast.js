var amqp = require('amqplib/callback_api');
var configs = require('../../setup/configs.json');

var exchangeName = configs.broker_setup.exchange_name_broadcast;

/*amqp.connect(configs.broker_uri, function(err, conn) {
    conn.createChannel(function(err, ch) {
        var ex = exchangeName;

        ch.assertExchange(ex, 'fanout', {durable: false});

        ch.assertQueue('', {exclusive: true}, function(err, q) {
            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
            ch.bindQueue(q.queue, ex, '');

            ch.consume(q.queue, function(msg) {
                console.log(" [x] %s", msg.content.toString());
            }, {noAck: true});
        });
    });
}); */

amqp.connect(configs.broker_uri, function(err, conn) {
    conn.createChannel(function(err, ch) {
        var ex = "semut.broadcast";

        ch.assertExchange(ex, 'topic', {durable: false});
        ch.assertQueue('', {exclusive: true}, function(err, q) {
            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
            //ch.bindQueue(q.queue, ex, 'broadcast.tracker.angkot');
            ch.bindQueue(q.queue, ex, 'broadcast.tracker.elang.unit1');
            ch.consume(q.queue, function(msg) {
                console.log(" [x] %s", msg.content.toString());
            }, {noAck: true});
        });
    });
});