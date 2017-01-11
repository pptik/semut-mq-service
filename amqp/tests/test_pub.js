var amqp = require('amqplib/callback_api');
var configs = require('../../setup/configs.json');

var exchangeName = "hendra.test";

function generateUuid() {
    return Math.random().toString() +
        Math.random().toString() +
        Math.random().toString();
}

amqp.connect(configs.broker_uri, function(err, conn) {
    conn.createChannel(function(err, ch) {
        ch.assertQueue('test.login', {exclusive: true}, function(err, q) {
            var corr = generateUuid();
            ch.consume(q.queue, function(msg) {
                if (msg.properties.correlationId == corr) {
                    console.log(' [.] Got : %s', msg.properties.type);
//                    setTimeout(function() { conn.close(); process.exit(0) }, 500);
                }
            }, {noAck: true});
            ch.assertExchange(exchangeName, 'topic', {durable: false});
            ch.publish(exchangeName, "hendra.test.login", new Buffer("hello again"), { correlationId: corr, replyTo: q.queue });
            console.log(" [x] Sent ");

        });
    });
});


