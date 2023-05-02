const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const events = require('events');
const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '../.env')});

const emitter = new events.EventEmitter();
const setTelegramRouter = require('./telegramBot.js');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '../public/build')));

PORT = 8080


const setup = async () =>{

    
app.get('/messages', (req, res) => {

    emitter.once('new-message', (message) => {
     res.status(200).send({ message });
    });
   });
   
   app.post('/messages', (req, res) => {
    const message = req.body;
    console.log('message:', message);
     emitter.emit('new-message', message);
    return res.status(200).send();
   });

   app.get('/login', (req,res) =>{

    const {id} = req.query;
    if(!id)
    {
        return res.status(400).send({message : "Parametr id is required"})
    }

    emitter.once(`login-${id}`, (userInfo) =>{
        res.status(200).send(userInfo);
    })
    
   })
   

   await setTelegramRouter(app,emitter);
   app.listen(process.env.PORT, () =>{
    console.log("Server was started on port ", process.env.PORT);
   })
   
}


setup();
