var amqp = require('amqplib/callback_api');
var configs = require('../../setup/configs.example.json');
amqp.connect(configs.broker_uri, function(err, conn) {
    conn.createChannel(function(err, ch) {
        var ex = 'logs';
        var msg = process.argv.slice(2).join(' ') || 'Hello World!';

        ch.assertExchange(ex, 'fanout', {durable: false});
        ch.publish(ex, '', new Buffer(msg));
        console.log(" [x] Sent %s", msg);
    });

    setTimeout(function() { conn.close(); process.exit(0) }, 500);
});