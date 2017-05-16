var taxiModel = require('../models/taxi_model');
var userModel = require('../models/user_model');
var responseMsg = require('../setup/messages.json');
var locationModel = require('../models/location_model');

var driver_state = {
    DRIVER_IDLE : 10,
    DRIVER_ON_WAY : 11,
    DRIVER_OFF_LINE : 0
};

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
                               var driver = selectDriver(result);
                               if(driver.length > 0) {
                                   userModel.getSession(driver[0]['ID'], (err, session) => {
                                       if(err)reject(err);
                                       else {
                                           var response =
                                               {
                                                   success: true,
                                                   message: "Berhasil mengirimkan permintaan",
                                                   driver: driver,
                                                   order: result_order,
                                                   driver_queue : session,
                                               };

                                           resolve(response);
                                       }
                                   });
                               }else resolve({success:false, message:"Maff, semua driver sedang sibuk atau tidak dalam jangkauan. Silahkan hubungi call center untuk mendapatkan bantuan"});
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
    if(array.length > 0) {
        var arr = [];
        array.forEach((index, i) => {
            if (index['ID_role'] === 10 && index['Status_online'] === driver_state.DRIVER_IDLE) arr.push(index);
        });
        return arr;
    }else return array;
}