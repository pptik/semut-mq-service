var amqp = require('amqplib/callback_api');
var configs = require('../../setup/configs.example.json');
amqp.connect(configs.broker_uri, function(err, conn) {
    conn.createChannel(function(err, ch) {
        var ex = 'direct_logs';
        var args = process.argv.slice(2);
        var msg = args.slice(1).join(' ') || 'Hello World!';
        var severity = (args.length > 0) ? args[0] : 'info';

        ch.assertExchange(ex, 'direct', {durable: false});
        ch.publish(ex, severity, new Buffer(msg));
        console.log(" [x] Sent %s: '%s'", severity, msg);
    });

    setTimeout(function() { conn.close(); process.exit(0) }, 500);
});