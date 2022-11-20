const UserCtrl = {};
const UserModel = require('../model/User.model');
const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken');
const EmailModel = require('../model/Email.model');
const EnterpriseModel = require("../model/Enterprise.model")
const BlockchainModel = require("../model/Blockchain.modal")
const Block = require('../src/block');
const SHA256 = require("crypto-js/sha256");






//Para crear un usuario
UserCtrl.createUser = async (req, res) => {
    let { name, lastName, email, ci, password } = req.body




    const emailUser = await UserModel.findOne({ email: email })

    if (emailUser) {
        res.json({
            status: 'El correo ya existe o inválido'
        })
    }
    else {


        try {

            if (name && lastName && email && ci && password) {
                //Encriptar la contraseña y un token para la validacion
                password = await bcrypt.hash(password, 10)


                const NewUser = new UserModel({
                    name,
                    lastName,
                    email,
                    ci,
                    password
                })

                await NewUser.save();

                res.json({
                    status: "Usuario Guardado"
                })
            } else {
                res.json({
                    status: "LLene todos los campos"
                })
            }



        } catch (error) {
            console.log(error)

            res.json({
                status: "Error al guardar usuario"
            })

        }
    }


};

//Actualziar un usuario
UserCtrl.updateUser = async (req, res) => {
    let { name, lastName, email, ci, password } = req.body

    const usuario = await UserModel.findById(req.params.id);

    if (usuario) {
        const email2 = await UserModel.findOne({ email: email });
        if (!email2) {

            try {

                const nuevoUsuario = {
                    name,
                    lastName,
                    email,
                    ci,
                    password
                };


                await UserModel.findByIdAndUpdate(req.params.id, nuevoUsuario, { userFindAndModify: false });
                res.json({
                    status: 'Usuario actualizado'
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

UserCtrl.getEmails = async (req, res) => {

    var id = req.params.id

    var user = await UserModel.findById(id)

    if (user) {

        let emails = await EmailModel.find({ idUsuario: user._id })

        if (emails) {
            res.send(emails)
        } else {
            res.json({
                status: "No Existen Emails"
            })
        }

    } else {
        res.json({
            status: "No existe el usuario"
        })
    }
}

UserCtrl.accepConsent = async (req,res)=>{
    var idEmail = req.params.id

    var email = await EmailModel.findById(idEmail)

    let { machineLearning, envioFacturacion} = req.body

    if (email) {

        if (!email.respondido) {

            const cadena = await BlockchainModel.find();

            let date = new Date();
            let strTime = date.toLocaleString("en-US", { timeZone: "America/Bogota" });


            if (cadena.length === 0) {

                const blockNew = new BlockchainModel({
                    hashMain: null,
                    hashEnterprise: null,
                    previousHashEnterprise: null,
                    previousHashMain: null,
                    heigh: 0,
                    heighEnterprise: 0,
                    body: null,
                    permisos: {
                        envioFacturacion: envioFacturacion,
                        machineLearning: machineLearning,
                    },
                    userId: email.idUsuario,
                    enterpriseId: email.idEmpresa,
                    fechaModificacion: strTime

                })

                const block = new Block({ data: blockNew });
                const hashEnterprise = strTime + email.idEmpresa
                block.hashMain = SHA256(JSON.stringify(block)).toString();
                block.hashEnterprise = SHA256(JSON.stringify(hashEnterprise)).toString();
                block.height = 0
                block.heighEnterprise = 0
                block.permisos.envioFacturacion = envioFacturacion;
                block.permisos.machineLearning = machineLearning
                block.userId = email.idUsuario
                block.enterpriseId = email.idEmpresa
                block.fechaModificacion = strTime


                blockNew.hashMain = block.hashMain
                blockNew.hashEnterprise = block.hashEnterprise
                blockNew.previousHashMain = null
                blockNew.previousHashEnterprise = null
                blockNew.heigh = block.height
                blockNew.heighEnterprise = block.heighEnterprise
                blockNew.body = block.body
                blockNew.permisos.envioFacturacion = block.permisos.envioFacturacion
                blockNew.permisos.machineLearning = block.permisos.machineLearning
                blockNew.userId = email.idUsuario
                blockNew.enterpriseId = email.idEmpresa
                blockNew.fechaModificacion = strTime

                email.respondido = true;

                await email.save()
                await blockNew.save()


                res.json({
                    status: "ok"
                })


            } else {

                const blockNew = new BlockchainModel({
                    hashMain: null,
                    hashEnterprise: null,
                    previousHashEnterprise: null,
                    previousHashMain: null,
                    heigh: cadena.length,
                    body: null,
                    permisos: {
                        envioFacturacion: envioFacturacion,
                        machineLearning: machineLearning,
                    },
                    userId: email.idUsuario,
                    enterpriseId: email.idEmpresa,
                    fechaModificacion: strTime

                })

                const idEmpresa = email.idEmpresa
                const idUsuario = email.idUsuario

                //console.log("empresa y usuario", idEmpresa, idUsuario)

                const bloqueAnterior = await BlockchainModel.findOne({ heigh: cadena.length - 1 })
                const bloqueAnteriorEmpresaArray = await BlockchainModel.find({ enterpriseId: idEmpresa})
                console.log("esta es el array", bloqueAnteriorEmpresaArray)
                let hashEmpresaAnterior;
                let hashMainAnterior;
                let heighEnterprise = 0
                let bloqueAnteriorEmpresa;

                if (bloqueAnteriorEmpresaArray.length > 0) {
                    console.log("entre", bloqueAnteriorEmpresaArray.length)
                    bloqueAnteriorEmpresa = await BlockchainModel.findOne({ heighEnterprise: bloqueAnteriorEmpresaArray.length - 1 })
                    console.log("bloque indivudal", bloqueAnteriorEmpresa)
                    hashEmpresaAnterior = bloqueAnteriorEmpresa.hashEnterprise
                    hashMainAnterior = bloqueAnteriorEmpresa.hashMain
                    heighEnterprise = bloqueAnteriorEmpresaArray.length
                    console.log("hash empresa, hash main", hashMain, hashEnterprise)
                } else {
                    bloqueAnteriorEmpresa = null;
                    hashEmpresaAnterior = null
                    hashMainAnterior = null
                    heighEnterprise = 0
                }


                const block = new Block({ data: blockNew });
                const hashEnterprise = strTime + email.idEmpresa
                block.hashMain = SHA256(JSON.stringify(block)).toString();
                block.hashEnterprise = SHA256(JSON.stringify(hashEnterprise)).toString();
                block.height = cadena.length
                block.heighEnterprise = heighEnterprise
                block.permisos.envioFacturacion = envioFacturacion;
                block.permisos.machineLearning = machineLearning
                block.userId = email.idUsuario
                block.enterpriseId = email.idEmpresa
                block.fechaModificacion = strTime
                block.previousHashEnterprise = hashEmpresaAnterior
                block.previousHashMain = bloqueAnterior.hashMain

                console.log("bloques",block.previousHashEnterprise, block.previousHashMain)


                blockNew.hashMain = block.hashMain
                blockNew.hashEnterprise = block.hashEnterprise
                blockNew.previousHashMain = block.previousHashMain
                blockNew.previousHashEnterprise = block.previousHashEnterprise
                blockNew.heigh = block.height
                blockNew.heighEnterprise = block.heighEnterprise
                blockNew.body = block.body
                blockNew.permisos.envioFacturacion = block.permisos.envioFacturacion
                blockNew.permisos.machineLearning = block.permisos.machineLearning
                blockNew.userId = email.idUsuario
                blockNew.enterpriseId = email.idEmpresa
                blockNew.fechaModificacion = strTime

                email.respondido = true;

                await email.save()

                await blockNew.save()


                res.send({
                    status: "Has aceptado los permisos seleccionados"
                })

            }

        }else{
            res.json({
                status:"El email ya esta respondido"
            })
        }





    } else {
        res.json({
            status: "No existe el email"
        })
    }

}



UserCtrl.acceptAllConsent = async (req, res) => {

    var idEmail = req.params.id

    var email = await EmailModel.findById(idEmail)

    console.log("este es email",email)

    if (email) {

        if (!email.respondido) {

            const cadena = await BlockchainModel.find();

            let date = new Date();
            let strTime = date.toLocaleString("en-US", { timeZone: "America/Bogota" });


            if (cadena.length === 0) {

                const blockNew = new BlockchainModel({
                    hashMain: null,
                    hashEnterprise: null,
                    previousHashEnterprise: null,
                    previousHashMain: null,
                    heigh: 0,
                    heighEnterprise: 0,
                    body: null,
                    permisos: {
                        envioFacturacion: true,
                        machineLearning: true,
                    },
                    userId: email.idUsuario,
                    enterpriseId: email.idEmpresa,
                    fechaModificacion: strTime

                })

                const block = new Block({ data: blockNew });
                const hashEnterprise = strTime + email.idEmpresa
                block.hashMain = SHA256(JSON.stringify(block)).toString();
                block.hashEnterprise = SHA256(JSON.stringify(hashEnterprise)).toString();
                block.height = 0
                block.heighEnterprise = 0
                block.permisos.envioFacturacion = true;
                block.permisos.machineLearning = true
                block.userId = email.idUsuario
                block.enterpriseId = email.idEmpresa
                block.fechaModificacion = strTime


                blockNew.hashMain = block.hashMain
                blockNew.hashEnterprise = block.hashEnterprise
                blockNew.previousHashMain = null
                blockNew.previousHashEnterprise = null
                blockNew.heigh = block.height
                blockNew.heighEnterprise = block.heighEnterprise
                blockNew.body = block.body
                blockNew.permisos.envioFacturacion = true
                blockNew.permisos.machineLearning = true
                blockNew.userId = email.idUsuario
                blockNew.enterpriseId = email.idEmpresa
                blockNew.fechaModificacion = strTime

                email.respondido = true;

                await email.save()
                await blockNew.save()


                res.json({
                    status: "ok"
                })


            } else {

                const blockNew = new BlockchainModel({
                    hashMain: null,
                    hashEnterprise: null,
                    previousHashEnterprise: null,
                    previousHashMain: null,
                    heigh: cadena.length,
                    body: null,
                    permisos: {
                        envioFacturacion: true,
                        machineLearning: true,
                    },
                    userId: email.idUsuario,
                    enterpriseId: email.idEmpresa,
                    fechaModificacion: strTime

                })

                const idEmpresa = email.idEmpresa
                const idUsuario = email.idUsuario

                //console.log("empresa y usuario", idEmpresa, idUsuario)

                const bloqueAnterior = await BlockchainModel.findOne({ heigh: cadena.length - 1 })
                const bloqueAnteriorEmpresaArray = await BlockchainModel.find({ enterpriseId: idEmpresa})
                console.log("esta es el array", bloqueAnteriorEmpresaArray)
                let hashEmpresaAnterior;
                let hashMainAnterior;
                let heighEnterprise = 0
                let bloqueAnteriorEmpresa;

                if (bloqueAnteriorEmpresaArray.length > 0) {
                    console.log("entre", bloqueAnteriorEmpresaArray.length)
                    bloqueAnteriorEmpresa = await BlockchainModel.findOne({ heighEnterprise: bloqueAnteriorEmpresaArray.length - 1 })
                    console.log("bloque indivudal", bloqueAnteriorEmpresa)
                    hashEmpresaAnterior = bloqueAnteriorEmpresa.hashEnterprise
                    hashMainAnterior = bloqueAnteriorEmpresa.hashMain
                    heighEnterprise = bloqueAnteriorEmpresaArray.length
                    console.log("hash empresa, hash main", hashMain, hashEnterprise)
                } else {
                    bloqueAnteriorEmpresa = null;
                    hashEmpresaAnterior = null
                    hashMainAnterior = null
                    heighEnterprise = 0
                }


                const block = new Block({ data: blockNew });
                const hashEnterprise = strTime + email.idEmpresa
                block.hashMain = SHA256(JSON.stringify(block)).toString();
                block.hashEnterprise = SHA256(JSON.stringify(hashEnterprise)).toString();
                block.height = cadena.length
                block.heighEnterprise = heighEnterprise
                block.permisos.envioFacturacion = true;
                block.permisos.machineLearning = true
                block.userId = email.idUsuario
                block.enterpriseId = email.idEmpresa
                block.fechaModificacion = strTime
                block.previousHashEnterprise = hashEmpresaAnterior
                block.previousHashMain = bloqueAnterior.hashMain

                console.log("bloques",block.previousHashEnterprise, block.previousHashMain)


                blockNew.hashMain = block.hashMain
                blockNew.hashEnterprise = block.hashEnterprise
                blockNew.previousHashMain = block.previousHashMain
                blockNew.previousHashEnterprise = block.previousHashEnterprise
                blockNew.heigh = block.height
                blockNew.heighEnterprise = block.heighEnterprise
                blockNew.body = block.body
                blockNew.permisos.envioFacturacion = true
                blockNew.permisos.machineLearning = true
                blockNew.userId = email.idUsuario
                blockNew.enterpriseId = email.idEmpresa
                blockNew.fechaModificacion = strTime

                email.respondido = true;

                await email.save()

                await blockNew.save()


                res.send({
                    status: "Has aceptado todo los permisos"
                })

            }

        }else{
            res.json({
                status:"El email ya esta respondido"
            })
        }





    } else {
        res.json({
            status: "No existe el email"
        })
    }

}

UserCtrl.rejectAllConsent = async (req, res) => {

    var idEmail = req.params.id

    var email = await EmailModel.findById(idEmail)

    if (email) {

        email.respondido = true

        await email.save()

        //console.log(permisos)

        res.json({
            status: "Has rechazado todos los permisos"
        })

    } else {
        res.json({
            status: "No existe el email"
        })
    }

}




module.exports = UserCtrl;



