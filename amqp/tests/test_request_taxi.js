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
        ch.assertQueue('041997e4d9eacfb2070dd44cf316c740', {exclusive: true}, function(err, q) {
            var corr = generateUuid();
            ch.consume(q.queue, function(msg) {
                console.log(' [.] Got : %s', msg.properties.type);
                console.log(msg.content.toString());
            }, {noAck: true});
            ch.assertExchange(exchangeName, 'topic', {durable: false});
            var _s = {
                SessionID : '041997e4d9eacfb2070dd44cf316c740',
                source_lat : -6.8881146,
                source_lon : 107.6248152,
                destination_lat : 0,
                destination_lon : 0,
                source_address : 'test',
                destination_address : 'test',
              //  request_by : query['profile'],
                status : 1,
                distance : 0
            };
            ch.publish(exchangeName, configs.broker_routes.taxi_order, new Buffer(JSON.stringify(_s)),
                { correlationId: corr, replyTo: q.queue, type: 'Request Taxi'});
            console.log(" [x] Sent ");

        });
    });
});