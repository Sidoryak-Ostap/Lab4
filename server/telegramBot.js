

const {Telegraf} = require('telegraf');
const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '../.env')});

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

module.exports = async(app, emmiter) =>{
    
    const router = await bot.createWebhook({
        domain: process.env.REACT_APP_BASE_URL
    });


    bot.start((ctx) =>{

        ctx.reply('Welcome, use command "/login" to use your auth token\n\nExample: /login 12345-54645-564564...');
    })

    bot.command('login', (ctx) =>{
         const [command, id ] = ctx.message.text.split(' ');
         const eventName = `login-${id}`;
         console.log("Try to login ID - ", id);

         const userInfo = {
             firstName: ctx.from.first_name,
             lastName: ctx.from.last_name || ''
         }

         if(!Object.values(userInfo).find(e=>e.length)){
             userInfo.firstName = ctx.from.username || ctx.from.id;
         }

         emmiter.emit(eventName, userInfo);
    })


    app.use(router);

    
}