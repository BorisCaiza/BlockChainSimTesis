const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/tesis');



const objetobd = mongoose.connection

objetobd.on('connected', ()=>{
    console.log("conexión correcta a Mongo db")
})


objetobd.on('error', ()=>{
    console.log("error en la conexión de mongo db")
})

module.exports = mongoose