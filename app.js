var mysql = require('mysql');
var appconfig = require('./setup/configs.json');
var amqp = require('amqplib/callback_api');

//connect to db
var connection = mysql.createConnection({
    host     : appconfig.mysql['hostname'],
    user     : appconfig.mysql['user'],
    password : appconfig.mysql['password'],
    database : appconfig.mysql['database']
});


function connectToMysql(callback){
    connection.connect(function (err) {
        if(err){
            callback({status: false, msg: "MySql : Connection to  "+appconfig.mysql['hostname'] + " error : "+err});
        }else {
            callback({status: true, msg: "MySql :  Connection to  "+appconfig.mysql['hostname'] + " success"});
        }
    });
}

connectToMysql(function(result){
    if(result.status == true){
        exports.conn = connection;
        console.log(result.msg);
        //test sql
      /*  var userModel = require('./models/users');
        var _req = {email: "3@test.com", phonenumber: "081311415274", gender: 1, birthday: "1991-09-20", password: "qwerty", name: "test"};
        userModel.register(_req, function(err, response) {
            console.log(response);
        }); */
        connectToBroker();
    }else {
        console.log(result.msg);
    }
});


function connectToBroker() {
    amqp.connect(appconfig.broker_uri, function(err, conn) {
        if(err){
            console.log("connect to broker err %s", err);
        }else {
            console.log("connect to broker sukses");
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
