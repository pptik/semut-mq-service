var  app = require('../app');
var jsesc = require('jsesc');
var md5 = require('md5');
var moment 	= require('moment');
var appconfig = require('../setup/configs.json');

exports.login = function (call, callback) {
    var email = call.email;
    var pass = call.password;
    console.log("Request Login : \n"+JSON.stringify(call));
    if(email == null || pass == null){
        var res = {success: false, message: 'Incomplete Parameter'}
        callback(null, {response: res});
    }else {
        // find email
        app.pool.getConnection(function(err, connection) {
            // Use the connection
            if(err){
                console.log(err);
                callback(err, null);
            }
            else {
                connection.query('SELECT * FROM tb_user WHERE Email = "' + email + '"', function (err, rows, fields) {
                    if (err) {
                        console.log(err);
                        callback(err, null);
                    } else {
                        if (rows.length > 0) {
                            var data = rows[0];
                            data = JSON.stringify(data);
                            data = JSON.parse(data);
                            // Matching pass
                            if (md5(pass) == data.Password) {
                                // get session
                                connection.query('SELECT * FROM tb_session WHERE UserID = "' + data.ID + '" AND EndTime = "0000-00-00 00:00:00"', function (err, _rows, fields) {
                                    if (err) {
                                        console.log(err);
                                        callback(err, null);
                                    } else {
                                        // if ok
                                        if (_rows.length > 0) {
                                            var sessdata = JSON.stringify(_rows[0]);
                                            sessdata = JSON.parse(sessdata);
                                            // update session
                                            connection.query('UPDATE tb_session SET LastTime = "' + moment().format('YYYY-MM-DD HH:mm:ss') + '", EndTime = "' + moment().format('YYYY-MM-DD HH:mm:ss') + '" WHERE ID = "' + sessdata.ID + '"', function (err, __rows, fields) {
                                                if (err) {
                                                    console.log(err);
                                                    callback(err, null);
                                                } else {
                                                    //console.log(__rows[0]);
                                                }
                                            });
                                        }
                                        // insert session
                                        connection.query('INSERT INTO tb_session (UserID, StartTime, LastTime) VALUES ("' + data.ID + '","' + moment().format('YYYY-MM-DD HH:mm:ss') + '", "' + moment().format('YYYY-MM-DD HH:mm:ss') + '")', function (err, ___rows, fields) {
                                            if (err) {
                                                console.log(err);
                                                callback(err, null);
                                            } else {
                                                //console.log(___rows);

                                                // get profile
                                                connection.query('SELECT * FROM tb_user WHERE Email="' + email + '"', function (err, _rProfile, fields) {
                                                    if (err) {
                                                        console.log(err);
                                                        callback(err, null);
                                                    } else {
                                                        var profile_ = JSON.stringify(_rProfile[0]);
                                                        profile_ = JSON.parse(profile_);
                                                        //   console.log(profile_);
                                                        connection.query('SELECT * FROM tb_session WHERE UserID = "' + data.ID + '" AND EndTime = "0000-00-00 00:00:00"', function (err, _rSession, fields) {
                                                            if (err) {
                                                                console.log(err);
                                                                callback(err, null);
                                                            } else {
                                                                //console.log(_rSession[0]);
                                                                var session_ = JSON.stringify(_rSession[0]);
                                                                session_ = JSON.parse(session_);
                                                                var res_profile = {
                                                                    Name: profile_.Name,
                                                                    Email: profile_.Email,
                                                                    CountryCode: profile_.CountryCode,
                                                                    PhoneNumber: profile_.PhoneNumber,
                                                                    Gender: profile_.Gender,
                                                                    Birthday: profile_.Birthday,
                                                                    Joindate: profile_.Joindate,
                                                                    Poin: profile_.Poin,
                                                                    Poinlevel: profile_.PoinLevel,
                                                                    Visibility: profile_.Visibility,
                                                                    Verified: profile_.Verified,
                                                                    AvatarID: profile_.AvatarID,
                                                                    UserID : profile_.ID
                                                                }
                                                                var res = {
                                                                    success: true,
                                                                    message: "Berhasil Login!",
                                                                    Profile: res_profile,
                                                                    sessionID: session_.ID
                                                                };
                                                                callback(null, {response: res});
                                                                connection.release();
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            } else {
                                var res = {success: false, message: "Username Atau Password tidak cocok!"};
                                callback(null, {response: res});
                                connection.release();
                            }
                        } else {
                            var res = {success: false, message: 'Username Atau Password tidak cocok!'}
                            callback(null, {response: res});
                            connection.release();
                        }
                    }
                });
            }
        });
    }
}



exports.register = function (call, callback) {
    var email = call.email;
    var phonenumber = call.phonenumber;
    var gender = call.gender;
    var birthday = call.birthday;
    var password = call.password;
    var name = call.name;
    app.pool.getConnection(function(err, connection) {
        connection.query('SELECT * FROM tb_user WHERE Email="'+email+'"', function (err, rows, fields) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                if(rows.length > 0) {
                    var res = {success: false, message: "Email sudah digunakan!"};
                    callback(null, {response: res});
                }else {
                    app.pool.query('INSERT INTO tb_user (Name, Email, CountryCode, PhoneNumber, Gender, Birthday, Password, Poin, PoinLevel, AvatarID, Joindate, deposit) VALUES ("'
                        +name+'","'
                        + email+ '", "'
                        + 62+ '", "'
                        + phonenumber+ '", "'
                        + gender+ '", "'
                        + birthday+ '", "'
                        + md5(password)+ '", "'
                        + 100+ '", "'
                        + 100+ '", "'
                        + gender+ '", "'
                        + moment().format('YYYY-MM-DD HH:mm:ss')+ '", "'
                        + 0 + '")', function (err, rows, fields) {
                        if(err){
                            console.log("error : "+err)
                        }else {
                            console.log(rows);
                            var res = {success: true, message: 'Sukses Membuat Akun, silahkan login!'}
                            callback(null, {response: res});
                            connection.release();
                        }
                    });
                }
            }
        });
    });
}


exports.getProfile = function (call, callback) {
    var sessionId = call.sessionID;
    app.pool.getConnection(function(err, connection) {
        checkSession(sessionId, connection, function (err, result) {
            if(err){
                console.log(err);
                callback(err, null);
            }else {
                if(result.id){
                    getProfileById(result.id, connection, function (err, result) {
                        if (err) {
                            callback(err, null);
                        } else {
                            var res = {
                                success: true,
                                message: "Sukses memuat permintaan",
                                Profile: result
                            };
                            callback(null, {response: res});
                            connection.release();
                        }
                    });
                }else {
                    callback(null, result);
                    connection.release();
                }
            }
        })
    });
}


exports.getProfileById = function (call, callback) {
    var sessionId = call.sessionID;
    var userId = call.userID;
    app.pool.getConnection(function(err, connection) {
        checkSession(sessionId, connection, function (err, result) {
            if(err){
                console.log(err);
                callback(err, null);
            }else {
                if(result.id){
                    getProfileById(userId, connection, function (err, pResult) {
                        if (err) {
                            callback(err, null);
                        } else {
                            var res = {
                                success: true,
                                message: "Sukses memuat permintaan",
                                Profile: pResult
                            };
                            getRelationStatus(result.id, userId, connection, function (err, rResult) {
                                if (err) {
                                    console.log(err);
                                    callback(err, null);
                                    connection.release();
                                } else {
                                    if(rResult == false){
                                        res.Friend = false;
                                        callback(null, {response: res});
                                        connection.release();
                                    }else {
                                        res.Friend = true;
                                        res.RelationInfo = rResult;
                                        callback(null, {response: res});
                                        connection.release();
                                    }
                                }
                            });
                        }
                    });
                }else {
                    callback(null, result);
                    connection.release();
                }
            }
        })
    });

}


//----------------------------------- function ---------------------------------------------//

function getProfileById(iduser, conn, callback) {
    conn.query('SELECT * FROM tb_user WHERE ID="'+iduser+'"', function (err, rows, fields) {
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            //console.log(rows[0]);
            if(rows[0]) {
                var data = rows[0];
                delete data['Password'];
                delete data['flag'];
                delete data['foto'];
                delete data['PushID'];
                delete data['Path_foto'];
                delete data['Nama_foto'];
                delete data['Path_ktp'];
                delete data['Nama_ktp'];
                delete data['facebookID'];
                delete data['ID_role'];
                delete data['ID_ktp'];
                delete data['Plat_motor'];
                delete data['VerifiedNumber'];
                delete data['Barcode'];
                delete data['Status_online'];
                callback(null, data);
            }else {
                callback(null, appconfig.messages.user_not_found);
            }
        }
    });
}


function checkSession(sessid, conn, callback) {
    conn.query('SELECT * FROM tb_session WHERE ID="'+sessid+'" AND EndTime = "0000-00-00 00:00:00"', function (err, rows, fields) {
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            console.log(rows);
            if(rows[0]) {
                callback(null, {id: rows[0].UserID});
            }else {
                callback(null, {response: appconfig.messages.session_id_null});
            }
        }
    });
}

function getRelationStatus(id1, id2,conn, callback) {
    conn.query('SELECT * FROM tb_relation WHERE ID_REQUEST="'+id1+'" AND ID_RESPONSE ="' + id2 + '" OR ID_REQUEST="'+id2+'" AND ID_RESPONSE ="' + id1 + '"', function (err, rows, fields) {
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            if(rows[0]) {
                var friend = {};
                friend['RelationID'] = rows[0].ID;
                friend['IsRequest'] = false;
                if(rows[0].ID_REQUEST == id2){
                    friend['IsRequest'] = true;
                }
                if(rows[0].State == 1) friend['Status'] = "Pending"; else friend['Status'] = "Confirmed"
                callback(null, friend);
            }else {
                callback(null, false);
            }
        }
    });
}