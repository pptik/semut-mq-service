var amqp = require('amqplib/callback_api');
var configs = require('../../setup/configs.json');

var queueServiceName = "TestService";
var exchangeName = "hendra.test";

amqp.connect(configs.broker_uri, function(err, conn) {
    conn.createChannel(function(err, ch) {
        ch.assertExchange(exchangeName, 'topic', {durable: false});
        ch.assertQueue(queueServiceName, {exclusive: true}, function(err, q) {
            ch.bindQueue(q.queue, exchangeName, "hendra.test.*");
            ch.consume(q.queue, function(msg) {
                console.log(" [x] %s:'%s'", msg.fields.routingKey, msg.content.toString());
                ch.sendToQueue(msg.properties.replyTo, new Buffer("this is from rpc"), {correlationId: msg.properties.correlationId, type: "callback"});
            }, {noAck: true});
        });
    });
});