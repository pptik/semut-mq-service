var appconfig = require('./setup/configs.json');
var amqp = require('amqplib/callback_api');
var database = require('./setup/database');






function connectToBroker() {
    amqp.connect(appconfig.broker_uri, function(err, conn) {
        if(err){
            console.log("connect to broker err %s", err);
            console.log("retry to connect in 5 secs ...")
            setTimeout(function() {
                connectToBroker();
            }, 5000);
        }else {
            console.log("connect to broker sukses");
            database.connect(function (err, db) {
                if (err) {
                    console.log(err);
                } else {
                    exports.db = db;
                    console.log("connect mongodb sukses");
                    conn.on('error', function connectionClose() {
                        console.log('Connection closed, try reconnect ...');
                        connectToBroker();
                    });

                    conn.createChannel(function (err, ch) {
                        if (err) {
                            console.log("create channel err %s", err);
                        } else {
                            console.log("sukses bikin channel");
                            exports.chnannel = ch;
                            var semutService = require('./amqp/semutservice');
                          //  semutService.startGpsConsume();
                            semutService.startService();
                          //  semutService.broadcastTrackers();
                          //  semutService.broadcastMultiTrackers();
                        }
                    });

                }
            });
        }
    });
}

connectToBroker();
