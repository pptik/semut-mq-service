var app = require('../app');
var db = app.db;
var shortID = require('../utils/short_id');

var taxiOrderCollection = db.collection('tb_taxi_order');

function requestOrder(query) {
    return new Promise((resolve, reject) => {
        taxiOrderCollection.insertOne({
            order_date : new Date(),
            user_queue : query['SessionID'],
            source_lat : parseFloat(query['source_lat']),
            source_lon : parseFloat(query['source_lon']),
            destination_lat : parseFloat(query['destination_lat']),
            destination_lon : parseFloat(query['destination_lon']),
            source_address : query['source_address'],
            destination_address : query['destination_address'],
            request_by : query['Profile'],
            status : 1,
            distance : parseFloat(query['distance']),
            biaya: query['biaya']
        }, (err, result) => {
            if(err)reject(err);
            else {
                result = result['ops'][0];
              //  result['_id'] = shortID.short(result['_id']);
                resolve(result);
            }
        });
    });
}


module.exports = {
    requestOrder:requestOrder
};