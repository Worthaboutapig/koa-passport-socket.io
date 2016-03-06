# koa-passport-socket.io
use koa-passport authentication on socket.io
based on the solution from this question:
http://stackoverflow.com/a/27674362/1102783

# how to use
    var koaPassportSocket = require('koa-passport-socket.io');
    var passport = require('koa-passport');

    // store is the session store such as koa-redis
    io.use(koaPassportSocket(store, passport));


    io.on('connection', (socket) => {
         console.log(socket.user.firstName + " connected");
    });