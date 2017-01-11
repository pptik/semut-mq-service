var amqp = require('amqplib/callback_api');
var configs = require('../../setup/configs.json');
amqp.connect(configs.broker_uri, function(err, conn) {
    if(err){
        console.log(err);
    }
    conn.createChannel(function(err, ch) {
        var q = 'hello';
        var msg = 'Hello World!';
        ch.assertQueue(q, {durable: false, 'x-message-ttl': 100});
        ch.sendToQueue(q, new Buffer(msg));
        console.log(" [x] Sent %s", msg);
    });
    //setTimeout(function() { conn.close(); process.exit(0) }, 500);
});
