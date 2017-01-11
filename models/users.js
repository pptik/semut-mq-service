var  app = require('../app');
var jsesc = require('jsesc');
var md5 = require('md5');
var moment 	= require('moment');

exports.login = function (call, callback) {
    var email = call.email;
    var pass = call.password;
    console.log("Request Login : \n"+JSON.stringify(call));
    if(email == null || pass == null){
        var res = {success: false, message: 'Incomplete Parameter'}
        callback(null, {response: res});
    }else {
        // find email
        app.conn.query('SELECT * FROM tb_user WHERE Email = "' + email + '"', function (err, rows, fields) {
            if (err) {
                console.log(err);
            } else {
                if(rows.length > 0) {
                    var data = rows[0];
                    data = JSON.stringify(data);
                    data = JSON.parse(data);
                    // Matching pass
                    if(md5(pass) == data.Password){
                        // get session
                        app.conn.query('SELECT * FROM tb_session WHERE UserID = "' + data.ID + '" AND EndTime = "0000-00-00 00:00:00"', function (err, _rows, fields) {
                            if (err) {
                                console.log(err);
                            }else {
                                // if ok
                                if(_rows.length > 0) {
                                    var sessdata = JSON.stringify(_rows[0]);
                                    sessdata = JSON.parse(sessdata);
                                    // update session
                                    app.conn.query('UPDATE tb_session SET LastTime = "' + moment().format('YYYY-MM-DD HH:mm:ss') + '", EndTime = "' + moment().format('YYYY-MM-DD HH:mm:ss') + '" WHERE ID = "' + sessdata.ID + '"', function (err, __rows, fields) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            //console.log(__rows[0]);
                                        }
                                    });
                                }
                                // insert session
                                app.conn.query('INSERT INTO tb_session (UserID, StartTime, LastTime) VALUES ("'+data.ID+'","' + moment().format('YYYY-MM-DD HH:mm:ss') + '", "' + moment().format('YYYY-MM-DD HH:mm:ss') + '")', function (err, ___rows, fields) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        //console.log(___rows);

                                        // get profile
                                        app.conn.query('SELECT * FROM tb_user WHERE Email="'+email+'"', function (err, _rProfile, fields) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                var profile_ = JSON.stringify(_rProfile[0]);
                                                profile_ = JSON.parse(profile_);
                                                 //   console.log(profile_);
                                                app.conn.query('SELECT * FROM tb_session WHERE UserID = "' + data.ID + '" AND EndTime = "0000-00-00 00:00:00"', function (err, _rSession, fields) {
                                                    if (err) {
                                                        console.log(err);
                                                    } else {
                                                        //console.log(_rSession[0]);
                                                        var session_ = JSON.stringify(_rSession[0]);
                                                        session_ = JSON.parse(session_);
                                                        var res_profile = {
                                                            Name : profile_.Name,
                                                            Email : profile_.Email,
                                                            CountryCode : profile_.CountryCode,
                                                            PhoneNumber : profile_.PhoneNumber,
                                                            Gender : profile_.Gender,
                                                            Birthday : profile_.Birthday,
                                                            Joindate : profile_.Joindate,
                                                            Poin : profile_.Poin,
                                                            Poinlevel : profile_.PoinLevel,
                                                            Visibility : profile_.Visibility,
                                                            Verified : profile_.Verified,
                                                            AvatarID : profile_.AvatarID}
                                                        var res = {
                                                            success: true,
                                                            message: "Berhasil Login!",
                                                            Profile: res_profile,
                                                            sessionID: session_.ID
                                                        };
                                                        callback(null, {response: res});
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }else {
                        var res = {success: false, message: "Username Atau Password tidak cocok!"};
                        callback(null, {response: res});
                    }
                }else {
                    var res = {success: false, message: 'Username Atau Password tidak cocok!'}
                    callback(null, {response: res});
                }
            }
        });
    }
}