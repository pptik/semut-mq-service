var locationModel = require('../models/location_model');
var cctvModel = require('../models/cctv_model');
var userModel = require('../models/user_model');
var messages = require('../setup/messages.json');
var geoPlaceModel = require('../models/geo_place_model');
var postModel = require('../models/post_model');
var trackerModel = require('../models/tracker');

var valuesIndex = [
    {userLocation:0},
    {cctvPost: 0},
    {policePost: 0},
    {accidentPost: 0},
    {trafficPost: 0},
    {disasterPost: 0},
    {closurePost: 0},
    {otherPost: 0},
    {commuterTrain: 0},
    {angkotLocation: 0},
    {publicTransportPost: 0}
];


exports.store = function (call, callback) {
    userModel.checkSession(call['SessionID'], function (err, userID) {
        if(err)callback(err, null);
        else {
            if(userID){
                var query = {
                    'UserID': userID,
                    'Timespan': call['Timespan'],
                    'Altitude': parseFloat(call['Altitude']),
                    'Latitude': parseFloat(call['Latitude']),
                    'Longitude': parseFloat(call['Longitude']),
                    'preferences' : {
                        'mapitem': call['mapitem'],
                        'Radius' : parseInt(call['Radius']),
                        'Limit' : parseInt(call['Limit'])
                    },
                    'StatusOnline' : parseInt(call['StatusOnline']),
                    'Speed': parseFloat(call['Speed']),
                    'location':{
                        'type': 'Point',
                        'coordinates': [parseFloat(call['Longitude']), parseFloat(call['Latitude'])]
                    }
                };
                locationModel.insertOrUpdate(query, function (err, result) {
                    if(err)callback(err, null);
                    else{
                        locationModel.insertToHistory(query, function (err, res) {
                            if(err)callback(err, null);
                            else  {
                                if(parseInt(call['StatusOnline']) == 1){
                                    mapview(userID, call, function (err, results) {

                                        if(err)callback(err, null);
                                        else callback(null, results);
                                    });
                                }else {
                                    callback(null, {success: true, message: "Sukses insert lokasi", location: query});
                                }
                            }
                        });
                    }
                });
            }else callback(null, messages.invalid_session);
        }
    });
};


function mapview(userID, call, callback) {
    locationModel.getUserLocation(userID, function (err, response) {
        if(err) {
            callback(err, null);
        }
        else {
            var pref = response['preferences'];
            call['Latitude'] = response['Latitude'];
            call['Longitude'] = response['Longitude'];
            call['Item'] = pref['mapitem'];
            call['Radius'] = pref['Radius'];
            call['Limit'] = pref['Limit'];

            checkItem(call['Item'].toString());
            var filter = getFilter(valuesIndex);
            console.log(filter);
            Promise.all([
                getUserLocation(filter.userLocation, call, userID),
                getCCTVLocation(filter.cctvPost, call, userID),
                getPolicePosts(filter.policePost, call, userID),
                getAccidents(filter.accidentPost, call, userID),
                getTrafficPosts(filter.trafficPost, call, userID),
                getDisasterPosts(filter.disasterPost, call, userID),
                getClosurePosts(filter.closurePost, call, userID),
                getOtherPosts(filter.otherPost, call, userID),
                getTrackerLocation(filter.angkotLocation, call, userID),
                getPublicTransPost(filter.publicTransportPost, call, userID),
            ]).then(function(results) {
                callback(null, {success: true, message: "berhasil memuat permintaan", results:results});
            }).catch(function(err) {
                callback(err, null);
            });
        }
    });
};



//---------------- function --------------------//

// M A P  P R O M I S E S


function getTrackerLocation(state, query, userID) {
    return new Promise(function(resolve, reject) {
        if(state == true){
            trackerModel.getTrackerNearby(
                {
                    Latitude: parseFloat(query['Latitude']),
                    Longitude: parseFloat(query['Longitude']),
                    UserID: userID,
                    Radius: parseFloat(query['Radius']),
                    Limit: parseInt(query['Limit'])

                }, function (err, results) {
                    if(results) {
                        resolve({Trackers:results});
                    }
                    else reject(err);
                });
        }else {
            resolve({Trackers:[]});
        }
    });
}

function getUserLocation(state, query, userID) {
    return new Promise(function(resolve, reject) {
        if(state == true){
            locationModel.getUserNearby(
                {
                    Latitude: parseFloat(query['Latitude']),
                    Longitude: parseFloat(query['Longitude']),
                    UserID: userID,
                    Radius: parseFloat(query['Radius']),
                    Limit: parseInt(query['Limit'])

                }, function (err, users) {
                    if(users) resolve({Users:users});
                    else reject(err);
                });
        }else {
            resolve({Users:[]});
        }
    });
}

function getPolicePosts(state, query, userID) {
    return new Promise(function(resolve, reject) {
        if(state == true){
            postModel.findPostNearby(
                {
                    Latitude: parseFloat(query['Latitude']),
                    Longitude: parseFloat(query['Longitude']),
                    UserID: userID,
                    Radius: parseFloat(query['Radius']),
                    Limit: parseInt(query['Limit']),
                    Type:2
                }).then(function (posts) {
                resolve({Polices:posts});
            }).catch(function (err) {
                reject(err);
            });
        }else {
            resolve({Polices:[]});
        }
    });
}

function getTrafficPosts(state, query, userID) {
    return new Promise(function(resolve, reject) {
        if(state == true){
            postModel.findPostNearby(
                {
                    Latitude: parseFloat(query['Latitude']),
                    Longitude: parseFloat(query['Longitude']),
                    UserID: userID,
                    Radius: parseFloat(query['Radius']),
                    Limit: parseInt(query['Limit']),
                    Type:1
                }).then(function (posts) {
                resolve({Traffics:posts});
            }).catch(function (err) {
                reject(err);
            });
        }else {
            resolve({Traffics:[]});
        }
    });
}

function getDisasterPosts(state, query, userID) {
    return new Promise(function(resolve, reject) {
        if(state == true){
            postModel.findPostNearby(
                {
                    Latitude: parseFloat(query['Latitude']),
                    Longitude: parseFloat(query['Longitude']),
                    UserID: userID,
                    Radius: parseFloat(query['Radius']),
                    Limit: parseInt(query['Limit']),
                    Type:4
                }).then(function (posts) {
                resolve({Disasters:posts});
            }).catch(function (err) {
                reject(err);
            });
        }else {
            resolve({Disasters:[]});
        }
    });
}

function getClosurePosts(state, query, userID) {
    return new Promise(function(resolve, reject) {
        if(state == true){
            postModel.findPostNearby(
                {
                    Latitude: parseFloat(query['Latitude']),
                    Longitude: parseFloat(query['Longitude']),
                    UserID: userID,
                    Radius: parseFloat(query['Radius']),
                    Limit: parseInt(query['Limit']),
                    Type:5
                }).then(function (posts) {
                resolve({Closures:posts});
            }).catch(function (err) {
                reject(err);
            });
        }else {
            resolve({Closures:[]});
        }
    });
}

function getOtherPosts(state, query, userID) {
    return new Promise(function(resolve, reject) {
        if(state == true){
            postModel.findPostNearby(
                {
                    Latitude: parseFloat(query['Latitude']),
                    Longitude: parseFloat(query['Longitude']),
                    UserID: userID,
                    Radius: parseFloat(query['Radius']),
                    Limit: parseInt(query['Limit']),
                    Type:6
                }).then(function (posts) {
                resolve({Other:posts});
            }).catch(function (err) {
                reject(err);
            });
        }else {
            resolve({Other:[]});
        }
    });
}

function getPublicTransPost(state, query, userID) {
    return new Promise(function(resolve, reject) {
        if(state == true){
            postModel.findPostNearby(
                {
                    Latitude: parseFloat(query['Latitude']),
                    Longitude: parseFloat(query['Longitude']),
                    UserID: userID,
                    Radius: parseFloat(query['Radius']),
                    Limit: parseInt(query['Limit']),
                    Type:7
                }).then(function (posts) {
                resolve({PublicTran:posts});
            }).catch(function (err) {
                reject(err);
            });
        }else {
            resolve({PublicTran:[]});
        }
    });
}

function getAccidents(state, query, userID) {
    return new Promise(function(resolve, reject) {
        if(state == true){
            postModel.findPostNearby(
                {
                    Latitude: parseFloat(query['Latitude']),
                    Longitude: parseFloat(query['Longitude']),
                    UserID: userID,
                    Radius: parseFloat(query['Radius']),
                    Limit: parseInt(query['Limit']),
                    Type:3
                }).then(function (posts) {
                resolve({Accidents:posts});
            }).catch(function (err) {
                reject(err);
            });
        }else {
            resolve({Accidents:[]});
        }
    });
}

function getCCTVLocation(state, query, userID) {
    return new Promise(function(resolve, reject) {
        if(state == true){
            cctvModel.getCCTVNearby(
                {
                    Latitude: parseFloat(query['Latitude']),
                    Longitude: parseFloat(query['Longitude']),
                    UserID: userID,
                    Radius: parseFloat(query['Radius']),
                    Limit: parseInt(query['Limit'])

                }, function (err, cctvs) {
                    if(cctvs) {
                        iterateCCTV(cctvs).then(function (details) {
                            resolve({CCTV:details})
                        }).catch(function (err) {
                            reject(err);
                        });
                    }
                    else reject(err);
                });
        }else {
            resolve({CCTV:[]});
        }
    });
}


//--------------------- regular

function iterateCCTV(items) {
    for(var i = 0; i< items.length; i++){
        items[i].index = i;
    }
    var maxCount = (items.length > 0) ? items.length-1 : 0;
    return new Promise(function(resolve, reject) {
        var arrResult = [];
        if(items.length > 0) {
            items.forEach(function (index) {
                geoPlaceModel.getCity(index['CityID']).then(function (city) {
                    if (index['index'] == maxCount) {
                        delete index['index'];
                        delete index['CityID'];
                        index['City'] = city['Name'];
                        arrResult.push(index);
                        resolve(arrResult);
                    } else {
                        delete index['index'];
                        delete index['CityID'];
                        index['City'] = city['Name'];
                        arrResult.push(index);
                        resolve(arrResult);
                    }
                }).catch(function (err) {
                    reject(err);
                });
            });
        }else {resolve([])}
    });
}

function getFilter(arr) {
    var filter = {};
    for(var i = 0; i < arr.length; i++) {
        for (var k in arr[i]) {
            if (arr[i].hasOwnProperty(k)) {
                filter[k] = arr[i][k];
            }
        }
    }
    return filter;
}

function checkItem(items) {

    items = items.split('');
    for(var i = 0; i <items.length; i++){
        items[i] = parseInt(items[i]);
    }

    if(items.length < valuesIndex.length){

        var _s = valuesIndex.length - items.length;
        for(var i = 0; i < _s; i++){
            items.push(0);
        }
        for(var i =0; i < items.length; i++){
            if(items[i] == 0){
                items[i] = false;
                for(var propName in valuesIndex[i]) {
                    if(valuesIndex[i].hasOwnProperty(propName)) {
                        valuesIndex[i][propName] = false;
                    }
                }
            }else {
                items[i] = true;
                for(var propName in valuesIndex[i]) {
                    if(valuesIndex[i].hasOwnProperty(propName)) {
                        valuesIndex[i][propName] = true;
                    }
                }
            }
        }
        return items;
    }else if(items.length > valuesIndex.length){
        items.splice(valuesIndex.length, items.length-valuesIndex.length);
        for(var i =0; i < items.length; i++){
            if(items[i] == 0){
                items[i] = false;
                for(var propName in valuesIndex[i]) {
                    if(valuesIndex[i].hasOwnProperty(propName)) {
                        valuesIndex[i][propName] = false;
                    }
                }
            }else {
                items[i] = true;
                for(var propName in valuesIndex[i]) {
                    if(valuesIndex[i].hasOwnProperty(propName)) {
                        valuesIndex[i][propName] = true;
                    }
                }
            }
        }
        return items;
    }else {
        for(var i =0; i < items.length; i++){
            if(items[i] == 0){
                items[i] = false;
                for(var propName in valuesIndex[i]) {
                    if(valuesIndex[i].hasOwnProperty(propName)) {
                        valuesIndex[i][propName] = false;
                    }
                }
            }else {
                items[i] = true;
                for(var propName in valuesIndex[i]) {
                    if(valuesIndex[i].hasOwnProperty(propName)) {
                        valuesIndex[i][propName] = true;
                    }
                }
            }
        }
        return items;
    }
}
