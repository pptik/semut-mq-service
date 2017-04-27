app = require('../app');
db = app.db;

var emergencyCollection = db.collection('tb_emergency');


function insertEmergency(query) {
    return new Promise(function (resolve, reject) {
       var q = {
           "UserID" : parseInt(query['UserID']),
           "Name" : query['Name'],
           "Email" : query['Email'],
           "Date" : query['Date'],
           "Latitude" : parseFloat(query['Latitude']),
           "Longitude" : parseFloat(query['Longitude']),
           "PhoneNumber" : query['PhoneNumber'],
           "location" : {
               "type" : "Point",
               "coordinates" : [
                   parseFloat(query['Longitude']),
                   parseFloat(query['Latitude'])
               ]
           },
           "EmergencyID" : parseInt(query['EmergencyID']),
           "EmergencyType" : query['EmergencyType']
       };
       emergencyCollection.insertOne(q, function (err, result) {
          if(err)reject(err);
          else resolve(result['ops'][0]);
       });
    });
}


module.exports = {
    insertEmergency:insertEmergency
};