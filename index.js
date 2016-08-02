'use strict';

var cookie = require('cookie'),
    co = require('co');

module.exports = function(store, passport) {
    return function(socket, next) {
        
        if(!socket.handshake.headers.cookie) {
            return next('Didn\'t receive cookies');
        }
        
        let cookies = cookie.parse(socket.handshake.headers.cookie);
        co(function *() {
            var session = yield store.get('koa:sess:' + cookies['koa.sid']);

            passport.deserializeUser(session.passport.user, (error, user) => {

                if (!error && user) {
                    socket.user = user;
                    return next();
                }

                next('Authentication error.');
            });

        })
    }
};
