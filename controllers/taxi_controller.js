var taxiModel = require('../models/taxi_model');
var userModel = require('../models/user_model');
var responseMsg = require('../setup/messages.json');

function requestTaxi(query) {
    return new Promise(function (resolve, reject) {
        userModel.checkCompleteSession(query['SessionID'],  (err, profile) => {
            if(err)reject(err);
            else {
                if(profile === null) resolve(responseMsg.invalid_session);
                else {
                    query['Profile'] = profile;
                    taxiModel.requestOrder(query).then( result => {
                        result = {success: true, message: "Berhasil mengirimkan permintaan", data: result};
                        resolve(result);
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