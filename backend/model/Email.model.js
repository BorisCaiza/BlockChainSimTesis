const mongoose = require('mongoose');
const { Schema } = mongoose;


const EmailSchema = new Schema({
    idEmpresa: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' },
    idUsuario: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'enterprise'},
    descripcionConcentimiento: { type: String},
    permisos: { 
        envioFacturacion: {type: Boolean},
        machineLearning: {type: Boolean},
        fechaFin: {type: String, required: true},
     },
     obsevaciones: { type: String},
     respondido:{type: Boolean, default: false}
    
});



module.exports = mongoose.model('email', EmailSchema);