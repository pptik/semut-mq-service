var mysql = require('mysql');
var appconfig = require('./setup/configs.json');
var amqp = require('amqplib/callback_api');

//connect to db
var pool = mysql.createPool({
    host     : appconfig.mysql['hostname'],
    user     : appconfig.mysql['user'],
    password : appconfig.mysql['password'],
    database : appconfig.mysql['database']
});


function connectToMysql(callback){
    callback({status: true, msg: "MySql :  Connection to  "+appconfig.mysql['hostname'] + " success"});
}

connectToMysql(function(result){
    if(result.status == true){
        exports.pool = pool;
        console.log(result.msg);
        connectToBroker();
    }else {
        console.log("error connect to db : "+result.msg);
        console.log("try connect in 5 secs ...");
        setTimeout(function() {
            process.exit(0);
            // todo: run with forever js
        }, 5000);
    }
});


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
            conn.on('error', function connectionClose() {
                console.log(connectionClose().msg);
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
                    semutService.startConsume();
                }
            });
        }
    });
}
