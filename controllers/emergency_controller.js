var emergencyModel = require('../models/emergency_model');
var userModel = require('../models/user_model');
var responseMsg = require('../setup/messages.json');


function insertEmergency(query) {
    return new Promise(function (resolve, reject) {
        userModel.checkCompleteSession(query['SessionID'], function (err, profile) {
           if(err)reject(err);
           else {
               if(profile === null) resolve(responseMsg.invalid_session);
               else {
                    query['UserID'] = profile.UserID;
                    query['Email'] = profile.Email;
                    query['Name'] = profile.Name;
                    query['PhoneNumber'] = profile.PhoneNumber;
                    query['Date'] = new Date();
                    emergencyModel.insertEmergency(query).then(function (result) {
                        resolve(result);
                    }).catch(function (err) {
                       reject(err);
                    });
               }
           }
        });
    });
}


module.exports = {
    insertEmergency:insertEmergency
};