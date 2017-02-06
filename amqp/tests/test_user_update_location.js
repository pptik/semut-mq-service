var amqp = require('amqplib/callback_api');
var configs = require('../../setup/configs.json');

var exchangeName = "semut.service";

function generateUuid() {
    return Math.random().toString() +
        Math.random().toString() +
        Math.random().toString();
}

amqp.connect(configs.broker_uri, function(err, conn) {
    conn.createChannel(function(err, ch) {
        ch.assertQueue('semut.user.48', {exclusive: true}, function(err, q) {
            var corr = generateUuid();
            ch.consume(q.queue, function(msg) {
                if (msg.properties.correlationId == corr) {
                    console.log(' [.] Got : %s', msg.properties.type);
                    console.log(msg.content.toString());
                }
            }, {noAck: true});
            ch.assertExchange(exchangeName, 'topic', {durable: false});
            var _s = {
                Date: new Date(),
                SessionID: "f77a4db0da83ab3aec354f5580ef71c8",
                Altitude: 0,
                Latitude: -6.88821,
                Longitude: 107.610061,
                Speed: 0
            };
            ch.publish(exchangeName, "semut.services.updatelocation", new Buffer(JSON.stringify(_s)),
                { correlationId: corr, replyTo: q.queue});
            console.log(" [x] Sent ");

        });
    });
});