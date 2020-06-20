const jwt = require('jsonwebtoken')
const keys = require('../config/keys')
const User = require('../sequelize/models/User')
const Admin = require('../sequelize/models/Admin')
const Redis = require('../redis/connect')

async function redisGet(key, fields = ['name', 'sirname', 'active', 'messages']) {
    return new Promise((resolve) => {
        try {
            Redis.hmget(key, fields, function (err, reply) {
                if (err)
                    resolve(null)
                else {
                    const r = {}
                    for (let i = 0; i < fields.length; i++) {
                        if (fields[i] === 'messages')
                            r[fields[i]] = JSON.parse(reply[i])
                        else
                            r[fields[i]] = reply[i]
                    }
                    resolve(r)
                }
            });
        } catch (e) {
            resolve(null)
        }
    })
}

async function redisGetAllSessions() {
    return new Promise(async (resolve) => {
        try {
            Redis.scan(0, async function (err, res) {
                if (err)
                    resolve(null)
                else {
                    if (res && res.length > 1) {
                        const r = []
                        for (const room of res[1]) {
                            const x = await redisGet(room)
                            if (x.name)
                                r.push({
                                    login: room,
                                    name: x.name,
                                    sirname: x.sirname,
                                    active: x.active
                                })
                        }
                        resolve(r)
                    } else
                        resolve(null)
                }
            })
        } catch (e) {
            resolve(null)
        }
    })
}

module.exports.socket = async function (io) {
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.query.token;
            const user = socket.handshake.query.user;
            jwt.verify(token, keys.jwt, async function (err, decoded) {
                if (err && err.name === 'JsonWebTokenError') {
                    next(new Error('invalidToken'));
                } else if (err && err.name === 'TokenExpiredError') {
                    next(new Error('expiredToken'));
                } else if (decoded) {
                    if (user === 'admin') {
                        const candidate = await Admin.findOne({where: {login: decoded.login}})
                        if (candidate)
                            return next();
                        else
                            next(new Error('userNotFound'));
                    } else if (user === 'user') {
                        const candidate = await User.findOne({where: {login: decoded.login}})
                        if (candidate)
                            return next();
                        else
                            next(new Error('userNotFound'));
                    } else {
                        next(new Error('unknownError'));
                    }
                    return next();
                } else {
                    next(new Error('unknownError'));
                }
            });
        } catch (e) {
            console.warn(e)
        }

    });
    io.sockets.on('connection', function (socket) {
        try {
            const token = socket.handshake.query.token;
            const user = socket.handshake.query.user;
            if (user === 'user') {
                jwt.verify(token, keys.jwt, async function (err, decoded) {
                    if (!err && decoded) {
                        socket.emit('connectedLogin', {login: decoded.login})
                        socket.join(decoded.login);
                        if (decoded.name)
                            io.to('admins').emit('updateSessions', {
                                login: decoded.login,
                                name: decoded.name,
                                sirname: decoded.sirname,
                                active: true
                            });
                        const room = await redisGet(decoded.login)
                        if (!room.name) {
                            Redis.hmset(decoded.login, {
                                'name': decoded.name,
                                'sirname': decoded.sirname,
                                'active': 'yes'
                            });
                            Redis.expire(decoded.login, 60 * 60)
                        } else {
                            if (room.messages && room.messages.length > 0)
                                socket.emit('messages', room.messages)
                            Redis.hmset(decoded.login, {
                                'active': 'yes'
                            });
                            Redis.expire(decoded.login, 60 * 60)
                        }
                        socket.on('newMessage', async (mes) => {
                            mes.room = decoded.login
                            io.to(decoded.login).emit('newMessage', mes);
                            const room = await redisGet(decoded.login)
                            if (room.messages)
                                room.messages.push(mes)
                            else
                                room.messages = [mes]
                            Redis.hmset(decoded.login, {
                                'name': decoded.name,
                                'sirname': decoded.sirname,
                                'active': 'yes',
                                'messages': JSON.stringify(room.messages)
                            });
                            Redis.expire(decoded.login, 60 * 60)
                        })
                        socket.on('disconnect', async () => {
                            const room = await redisGet(decoded.login)
                            if (room.name) {
                                Redis.hmset(decoded.login, {
                                    'active': ''
                                });
                            }
                            if (decoded.name)
                                io.to('admins').emit('updateSessions', {
                                    login: decoded.login,
                                    name: decoded.name,
                                    sirname: decoded.sirname,
                                    active: false
                                });
                        })
                        console.log('A client is connected!');
                        console.log('Total connected users: ' + Object.keys(io.engine.clients).length)
                    } else
                        socket.disconnect()
                })
            } else if (user === 'admin') {
                jwt.verify(token, keys.jwt, async function (err, decoded) {
                    if (!err && decoded) {
                        socket.emit('connectedLogin', {login: decoded.login})
                        socket.join('admins');
                        const rooms = await redisGetAllSessions()
                        if (rooms && rooms.length > 0)
                            socket.emit('sessionList', rooms)
                        socket.on('joinToRoom', async (id) => {
                            socket.join(id);
                            const room = await redisGet(id)
                            if (room.messages && room.messages.length > 0)
                                socket.emit('messages', room.messages)
                        })
                        socket.on('exitFromRoom', (id) => {
                            socket.leave(id);
                        })
                        socket.on('newMessage', async (mes) => {
                            io.to(mes.room).emit('newMessage', mes);
                            const room = await redisGet(mes.room)
                            if (room.messages)
                                room.messages.push(mes)
                            else
                                room.messages = [mes]
                            Redis.hmset(mes.room, {
                                'messages': JSON.stringify(room.messages)
                            });
                        })
                    } else
                        socket.disconnect()
                })
            }
        } catch (e) {
            console.warn(e)
        }
    });
}