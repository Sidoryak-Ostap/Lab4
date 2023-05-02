const ngrok = require('ngrok');
require('dotenv').config();

const bootstrap = async () => {
 await ngrok.authtoken(process.env.NGROK_BOT_URL);
 const base_url = await ngrok.connect({
  addr: process.env.PORT
 });
 const socket_base_url = await ngrok.connect({ proto: 'tcp', addr: process.env.SOCKET_PORT });
 console.log(`port: ${process.env.PORT}base_url: ${base_url}`);
 console.log(`port: ${process.env.SOCKET_PORT} socket_base_url: ${socket_base_url}`);
};

bootstrap();