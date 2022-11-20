const EnterpriseCtrl = {};
const EnterpriseModel = require('../model/Enterprise.model');
const EmailModel = require('../model/Email.model')
const UserModal = require("../model/User.model")
const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken');




//Obtener Usuar


//Para crear una empresa
EnterpriseCtrl.createEnterprise = async (req, res) => {
    let { name, email, ruc, password } = req.body

    const emailUser = await EnterpriseModel.findOne({ email: email })

    if (emailUser) {
        res.json({
            status: 'El correo ya existe o inválido'
        })
    }
    else {


        try {

            if (name && email && ruc && password) {
                //Encriptar la contraseña y un token para la validacion
                password = await bcrypt.hash(password, 10)


                const NewEnterprise = new EnterpriseModel({
                    name,
                    email,
                    ruc,
                    password
                })

                await NewEnterprise.save();

                res.json({
                    status: "Empresa Guardada"
                })

            } else {
                res.json({
                    status: "Llene todos los campos"
                })
            }

        } catch (error) {
            console.log(error)

            res.json({
                status: "Error al guardar al empresa"
            })

        }
    }


};

//Actualizar una empresa
EnterpriseCtrl.updateEnterprise = async (req, res) => {
    let { name, email, ruc, password } = req.body

    const empresa = await EnterpriseModel.findById(req.params.id);

    if (empresa) {
        const email2 = await EnterpriseModel.findOne({ email: email });
        if (!email2) {

            try {



                const nuevoEmpresa = {
                    name,
                    email,
                    ruc,
                    password
                };


                await EnterpriseModel.findByIdAndUpdate(req.params.id, nuevoEmpresa, { userFindAndModify: false });
                res.json({
                    status: 'Empresa Actualizada'
                });






            } catch (error) {
                console.log(error)

                res.json({
                    status: 'Error al actualizar el usuario'
                });

            }



        } else {
            res.json({
                status: "El email ya existe"
            })
        }

    }
};

//Enviar email a un usuario
EnterpriseCtrl.sendEmail = async (req, res) => {

    let { email, descripcionConsentimeinto, envioFacturacion, machineLearning, fechaFin, observaciones } = req.body;

    var idEmpresa = req.params.id

    let empresa = await EnterpriseModel.findById(idEmpresa)

    if (empresa) {
        let usuario = await UserModal.findOne({ email: email })


        if (usuario) {

            try {

                let idUsuario = usuario._id

                const NewEmail = new EmailModel({

                    idEmpresa: idEmpresa,
                    idUsuario: idUsuario,
                    descripcionConcentimiento: descripcionConsentimeinto,
                    permisos: {
                        envioFacturacion: envioFacturacion,
                        machineLearning: machineLearning,
                        fechaFin: fechaFin,
                    },

                  
                    obsevaciones: observaciones



                })

                await NewEmail.save()

                res.json({
                    status:"Email Enviado"
                })

            } catch (error) {
                console.log(error)

                res.json({
                    status:"Error al envíar correo"
                })

            }




        } else {
            res.json({
                status: "No existe el usuario"
            })
        }

    } else {
        res.json({
            status: "No existe la empresa"
        })
    }
}






module.exports = EnterpriseCtrl;