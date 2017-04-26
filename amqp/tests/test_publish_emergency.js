var amqp = require('amqplib/callback_api');
var broker_uri = require('../../setup/configs.json').broker_uri;
var exchangeName = require('../../setup/configs.json').broker_setup.exchange_name;
var routingKey = require('../../setup/configs.json').broker_routes.emergency_report;

amqp.connect(broker_uri, function(err, conn) {
    conn.createChannel(function(err, ch) {
        ch.assertQueue('', {exclusive: true}, function(err, q) {
            var msg = {
                SessionID: 'a89acaab4ecaec506a90384945497559',
                Latitude: 0.0,
                Longitude: 0.0,
                EmergencyID: 5,
                EmergencyType: 'Panic Button'
            };
            ch.publish(exchangeName, routingKey, new Buffer(JSON.stringify(msg)),
                {});
            console.log(" [x] Sent ");

        });
    });
});