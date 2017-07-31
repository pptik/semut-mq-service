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
                                , { $set: {
                                    Speed : query['Speed'],
                                    Date: query['date'],
                                    Time: query['time'],
                                    Data: query['data'],
                                    Lokasi: loc,
                                    location:
                                        {
                                            type: 'Point',
                                            coordinates:[query['data'][1], query['data'][0]]
                                        }
                                }}, function(err, result) {
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


exports.updateElangTracker = function (query, callback) {
    db.collection('tb_elang_tracker', function(err, collection) {
        collection.find({ID: query['ID']}).toArray(function (err, items) {
            if(err){
                callback(err, null);
            }else {
				var loc;
                if(items[0]){
                    //console.log(query['data']);
                    if(query['data'][0] != 0){
                        getLocation(query['data'][0], query['data'][1], function (err, result) {
                           
                            if(err){
                                loc = "Lokasi tidak terdeteksi"
                            }else {
                                loc = result;
                            }
                            collection.updateOne({ID: query['ID']}
                                , { $set: {
                                    Speed : query['Speed'],
                                    Date: query['date'],
                                    Time: query['time'],
                                    Data: query['data'],
                                    Jabatan: query['jabatan'],
                                    Satuan: query['satuan'],
									Phone: query['phone'],
                                    Lokasi: loc,
                                    location:
                                        {
                                            type: 'Point',
                                            coordinates:[query['data'][1], query['data'][0]]
                                        },
									Desc: query['desc']
                                }}, function(err, result) {
                                    if(err){
                                        console.log(err);
                                        callback(err, null);
                                    }else {
                                        db.collection('tb_elang_tracker_history', function (err, collection) {
                                            if(err){
                                                callback(err,null);
                                            }else {
                                                var _query = {
                                                    ID: query['ID'],
                                                    Speed : query['Speed'],
                                                    Date: query['date'],
                                                    Time: query['time'],
                                                    Data: query['data'],
                                                    Lokasi: loc,
													Desc: query['desc']
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
                    //callback(null, {success: false, message: "device tidak terdaftar"});
					 var _query = {
                                                    ID: query['ID'],
                                                    Speed : query['Speed'],
                                                    Date: query['date'],
                                                    Time: query['time'],
                                                    Data: query['data'],
                                                    Lokasi: loc,
													Desc: query['desc']
                                                };
												
					 collection.insertOne(_query, function (err, result) {
                                                    if (err) {
                                                        callback(err, null);
                                                    } else {
                                                        callback(null, {success: true, message: "berhasil update"});
                                                    }
                                                });
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


exports.getAngkotTracker = function (query, callback) {
    var trackerCollection = db.collection('tb_tracker');
    trackerCollection.find({Data: {$ne: [0,0]}, Type: "Angkot"}).toArray(function (err, results) {
        if(err)callback(err, null);
        else callback(null, results);
    });
};

exports.getBusTracker = function (query, callback) {
    var trackerCollection = db.collection('tb_tracker');
    trackerCollection.find({Data: {$ne: [0,0]}, Type: "Bus"}).toArray(function (err, results) {
        if(err)callback(err, null);
        else callback(null, results);
    });
};


exports.getBusTrackerByAppID = query => {
    return new Promise((resolve, reject) => {
        var trackerCollection = db.collection('tb_tracker');
        trackerCollection.find({Data: {$ne: [0,0]}, Type: "Bus", AppID: query['AppID']}).toArray((err, results) => {
            if(err) reject(err);
            else resolve(results);
        });
    })
};

exports.getElangTracker = function (query, callback) {
    var trackerCollection = db.collection('tb_elang_tracker');
        trackerCollection.find({Data: {$ne: [0,0]}}).toArray((err, results) => {
			if(err)callback(err, null);
			else callback(null, results);
			//console.log("elang model: "+JSON.stringify(results));
        });
};

exports.getTrackerNearby = function(query, callback) {
    var latitude = parseFloat(query['Latitude']);
    var longitude = parseFloat(query['Longitude']);
    var trackerCollection = db.collection('tb_tracker');
    trackerCollection.find(
        {
            location:
            { $near :
            {
                $geometry: { type: "Point",  coordinates: [ longitude, latitude ] },
                $minDistance: 0,
                $maxDistance: query['Radius']
            }
            }
        }
    ).limit(query['Limit']).toArray(function (err, trackers) {
        if(err)callback(err, null);
        else {
            callback(null, trackers);
            console.log(trackers);
        }
    });
};

function getLocation(lat, lon, callback) {
    rest.get('http://nominatim.openstreetmap.org/reverse?format=json&lat='+lat+'&lon='+lon+'&zoom=18&addressdetails=1').on('complete', function(result) {
        if (result instanceof Error) {
            callback(result.message, null);
        } else {
          //  console.log(result);
            if(result['address']) {
                var road = (result['address']['road']) ? result['address']['road']+", " : "";
                var suburb = (result['address']['suburb']) ? result['address']['suburb']+", " : "";
                var village = (result['address']['village']) ? result['address']['village'] : "";
                var state = (result['address']['state']) ? ", "+result['address']['state'] : "";
                callback(null, road+suburb+village+state);
            }else {
                callback(null, "Lokasi tidak terdeteksi");
            }
        }
    });
}