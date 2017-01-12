var amqp = require('amqplib/callback_api');
var configs = require('../../setup/configs.json');
var exchangeName = "semut.service";

function generateUuid() {
    return Math.random().toString() +
        Math.random().toString() +
        Math.random().toString();
}

amqp.connect(configs.broker_uri, function(err, conn) {
    conn.on('error', function connectionClose() {
        console.log('Connection closed');
    });
    conn.createChannel(function(err, ch) {
        ch.assertQueue('', {exclusive: true}, function(err, q) {
            var corr = generateUuid();
            ch.consume(q.queue, function(msg) {
                if (msg.properties.correlationId == corr) {
                    console.log(' [.] Got : %s', msg.properties.type);
                    console.log(msg.content.toString())
                    //   setTimeout(function() { pool.close(); process.exit(0) }, 500);

                }
            }, {noAck: true});
            ch.assertExchange(exchangeName, 'topic', {durable: false});
            var _req = {email: "5@test.com", phonenumber: "081311415274", gender: 1, birthday: "1991-09-20", password: "qwerty", name: "test"};
            ch.publish(exchangeName, "semut.service.app.register", new Buffer(JSON.stringify(_req)),
                { correlationId: corr, replyTo: q.queue});
            console.log(" [x] Sent ");

        });

    });
});