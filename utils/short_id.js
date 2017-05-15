var ShortId = require('id-shorter');
var mongoDBId = ShortId({
    isFullId: true
});


function short(objectid) {
    return mongoDBId.encode(objectid);
}

module.exports = {
    short:short
};