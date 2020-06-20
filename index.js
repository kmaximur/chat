const PORT = process.env.PORT || 4008

const express = require('express');
const cors = require('cors')
const app = express();
app.use(cors({credentials: true, origin: true}))
const server = app.listen(PORT);
const io = require('socket.io')(server);
const path = require('path')

require('./sequelize/connect')
require('./redis/connect')
require('./socket-io/socket').socket(io)

const bodyParser = require('body-parser')
const authRoutes = require('./routes/auth')

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use('/api/auth', authRoutes)

if(process.env.NODE_ENV === 'production') {
    app.use(express.static('client/dist/client'))
    app.get('*', (req, res) => {
        res.sendFile(
            path.resolve(
                __dirname, 'client', 'dist', 'client', 'index.html'
            )
        )
    })
}