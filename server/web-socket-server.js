const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const bodyParser = require('body-parser');
const cors = require('cors');
const events = require('events');
const TelegramBot = require('./telegramBot.js');
const WebSocket= require('./websocket.js');
const connectMongo = require('../setupDb/setupDb.js');
const { MessageModel } = require('../models/message.js');



const app = express();

const emitter = new events.EventEmitter();
WebSocket.main(emitter);


app.use(cors());
app.use(bodyParser.json());
TelegramBot(app, emitter);



app.use(express.static(path.join(__dirname, '../public/build')));

const start = async () => {
    await connectMongo(process.env.MONGO_DB_URL);

    app.get('/login', (req, res) => {

        const { id } = req.query;
        if (!id) {
            return res.status(400).send({ message: "Parametr id is required" })
        }

        emitter.once(`login-${id}`, (userInfo) => {
            res.status(200).send(userInfo);
        })
    })

    app.get('/messages', async (req, res) => {
        const messages = await MessageModel.find().sort({date: -1}).limit(10);
        res.status(200).send(messages);
    })


    app.get('/users', async (req, res) => {

        const responseArray = [];
        const new_usersObj = {};

        console.log(WebSocket.users);
        const usersKeys = Object.keys(WebSocket.users);
        const usersValue  = Object.values(WebSocket.users);

        for (let i = 0; i < usersKeys.length; i++) {
            new_usersObj.userName = usersKeys[i]
            new_usersObj.status = usersValue[i];
            console.log(new_usersObj);
            responseArray.push(new_usersObj);
            
        }


       res.status(200).send(responseArray)

    })




    app.listen(process.env.PORT, () => {
        console.log("Server was started on port ", process.env.PORT);
    })
}
start();


