var app = require('../app');
var db = app.db;
var rest = require('restler');

exports.updateTracker = function (query, callback) {
    db.collection('tb_tracker', function(err, collection) {
        collection.find({Mac: query['MAC']}).toArray(function (err, items) {
            if(err){
                callback(err, null);
            }else {
                if(items[0]){
                    console.log(items[0]);
                    if(query['data'][0] != 0){
                        getLocation(query['data'][0], query['data'][1], function (err, result) {
                            var loc;
                            if(err){
                                loc = "Lokasi tidak terdeteksi"
                            }else {
                                loc = result;
                            }
                            collection.updateOne({Mac: query['MAC']}
                                , { $set: { Speed : query['Speed'], Date: query['date'], Time: query['time'], Data: query['data'], Lokasi: loc}}, function(err, result) {
                                    if(err){
                                        console.log(err);
                                        callback(err, null);
                                    }else {
                                        db.collection('tb_tracker_history', function (err, collection) {
                                            if(err){
                                                callback(err,null);
                                            }else {
                                                var _query = {
                                                    Mac: query['MAC'],
                                                    Speed : query['Speed'],
                                                    Date: query['date'],
                                                    Time: query['time'],
                                                    Data: query['data'],
                                                    Lokasi: loc
                                                };
                                                collection.insertOne(_query, function (err, result) {
                                                    if (err) {
                                                        callback(err, null);
                                                    } else {
                                                        callback(null, {success: true, message: "berhasil update"});
                                                    }
                                                });

                                            }
                                        });

                                    }
                                });
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
};


exports.getAllTracker = function (query, callback) {
  var trackerCollection = db.collection('tb_tracker');
    trackerCollection.find({Data: {$ne: [0,0]}}).toArray(function (err, results) {
        if(err)callback(err, null);
        else callback(null, results);
    });
};

function getLocation(lat, lon, callback) {
    rest.get('http://nominatim.openstreetmap.org/reverse?format=json&lat='+lat+'&lon='+lon+'&zoom=18&addressdetails=1').on('complete', function(result) {
        if (result instanceof Error) {
            callback(result.message, null);
        } else {
          //  console.log(result);
            if(result['address']) {
                callback(null, result['address']['road']+', '+result['address']['suburb']+', '+result['address']['village']+', '+result['address']['state']);
            }else {
                callback(null, "Lokasi tidak terdeteksi");
            }
        }
    });
}