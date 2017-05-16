var taxiModel = require('../models/taxi_model');
var userModel = require('../models/user_model');
var responseMsg = require('../setup/messages.json');
var locationModel = require('../models/location_model');

function requestTaxi(query) {
    return new Promise(function (resolve, reject) {
        userModel.checkCompleteSession(query['SessionID'],  (err, profile) => {
            if(err)reject(err);
            else {
                if(profile === null) resolve(responseMsg.invalid_session);
                else {
                    query['Profile'] = profile;
                    taxiModel.requestOrder(query).then( result_order => {
                        query['Latitude'] = query['source_lat'];
                        query['Longitude'] = query['source_lon'];
                        query['Limit'] = 100;
                        query['Radius'] = 10000;
                        locationModel.getUserNearby(query, (err, result) => {
                           if(err)reject(err);
                           else {
                               console.log(result.length);
                               var driver = selectDriver(result);
                               var response =
                                   {
                                       success: true,
                                       message: "Berhasil mengirimkan permintaan",
                                       driver: driver,
                                       order: result_order
                                   };

                               resolve(response);
                           }
                        });
                    }).catch(err => {
                        reject(err);
                    })
                }
            }
        });
    });
}


module.exports = {
    requestTaxi:requestTaxi
};

function selectDriver(array) {
    var arr = [];
    array.forEach((index, i) => {
        if(index['ID_role'] === 10) arr.push(index);
    });
    return arr;
}