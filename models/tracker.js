var app = require('../app');
var db = app.db;

exports.updateTracker = function (query, callback) {
    db.collection('tb_tracker', function(err, collection) {
        collection.find({Mac: query['MAC']}).toArray(function (err, items) {
            if(err){
                callback(err, null);
            }else {
                if(items[0]){
                    console.log(items[0]);
                    if(items[0].Date == ""){
                        collection.updateOne({Mac: query['MAC']}
                            , { $set: { Speed : query['Speed'], Date: query['date'], Time: query['time'], Data: query['data']} }, function(err, result) {
                                if(err){
                                    callback(err, null);
                                }else {
                                 //   console.log(result);
                                    callback(null, {success: true, message: "berhasil update"});
                                }
                            });
                    }else {
                        callback(null, {success: false, message: "device mengirim lokasi 0"});
                    }

                }else {
                    callback(null, {success: false, message: "device tidak terdaftar"});
                }
            }
        });
    });
}