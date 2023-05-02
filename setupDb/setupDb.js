
const mongoose = require('mongoose');

module.exports =  async (mongoURL) =>{
    await mongoose.connect(mongoURL).then(()=>{
        console.log("Mongo db was connected");
    }).catch(error =>{
        console.log(error);
        console.log('failed to connect db');
    })
}