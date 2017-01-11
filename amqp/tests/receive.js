var amqp = require('amqplib/callback_api');
var configs = require('../../setup/configs.example.json');
amqp.connect(configs.broker_uri, function(err, conn) {
    conn.createChannel(function(err, ch) {
        var q = 'hello';

        ch.assertQueue(q, {durable: false});
        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
     //   var foo_consume_opts = Object.create(common_options);
     //   foo_consume_opts.arguments = {'x-priority': 10};
        ch.consume(q, function(msg) {
            console.log(" [x] Received %s", msg.content.toString());
        }, {noAck: true});
    });
});