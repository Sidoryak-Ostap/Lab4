

const {model, Schema} = require('mongoose');


const schema = new Schema({
    userName: String,
    message: String,
    date: Number,
    messageId: String
})


const MessageModel = new model('messages', schema, 'messages');


module.exports = {MessageModel}