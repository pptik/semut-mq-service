var rabbitConn = require('../app').connection;
var setup = require('../setup/configs.json');
const exchangeName = setup.broker_setup.exchange_name;


function sendNotification(msg, routingKey) {
    rabbitConn.createChannel(function (err, ch) {
        if(err) console.log(err);
        else {
            ch.assertQueue('', {exclusive: true}, function (err, q) {
                if(err)console.log(err);
                else {
                    ch.publish(exchangeName, routingKey, new Buffer(JSON.stringify(msg)),
                        {});
                    console.log(" [x] Sent ");
                    ch.close();
                }
            });
        }
    });
}


module.exports = {
    sendNotification:sendNotification
};