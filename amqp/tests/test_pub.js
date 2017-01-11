var amqp = require('amqplib/callback_api');
var configs = require('../../setup/configs.json');

var exchangeName = configs.broker_setup.exchange_name;

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
                    console.log(msg.content.toString())
                    setTimeout(function() { conn.close(); process.exit(0) }, 500);

                }
            }, {noAck: true});
            ch.assertExchange(exchangeName, 'topic', {durable: false});
            var _s = {email: "hafiyyan.jtk10@gmail.com", password: ""};
            ch.publish(exchangeName, "semut.service.app.login", new Buffer(JSON.stringify(_s)),
                { correlationId: corr, replyTo: q.queue});
            console.log(" [x] Sent ");

        });
    });
});


