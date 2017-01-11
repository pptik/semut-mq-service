var mysql = require('mysql');
var appconfig = require('./setup/configs.json');

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
    }else {
        console.log(result.msg);
    }
});


//var send = require('./amqp/tests/test_service');