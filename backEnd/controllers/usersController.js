const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Env = require('../.env');

const { User } = require('../models');
const { Nivel } = require('../models');

const waterMail = require('../services/email');
const signinEmail = require('../emails/signin');

/*
 *This router is '/users' , this index menssage, to to confirm the operation of the backend
 */
exports.index = (req, res) => {
    res.status(200).json({
        ServerStatus: 200,
        Body: 'Users Router Running',
        Date: new Date()
    })
}

/*
* This router is '/users/singup', She recives { fullname, email, password, address } hashig
* the password, creates the initial registration parameters and save in users table
*/
exports.signup = (req, res) => {
    const { fullname, email, password, address } = req.body;

    if ((!fullname) || (!email) || (!password) || (!address))
        return res.status(500).json({
            erroCode: 101,
            errorBody: req.body,
            errMessage: "Erro Body"
        })

    acesso = 0; aquisition = 3; isPumpBlocked = 0; isPumpConcerted = 0; isPumpConfigured = 0;
    cxTxt = '5 - FORTLEV 500 Litros'; cxB = 0.58; cxC = 1.24; cxE = 0.95; aMin = 0.3; aMax = 2;

    bcrypt.hash(password, Env.saltRounds, (err, hash) => {
        User.create({
            name: fullname, email, password: hash, address, aquisition, isPumpConfigured,
            isPumpBlocked,isPumpConcerted, acesso, cxTxt, cxB, cxC, cxE, aMax, aMin
        })
            .then(response => {
                waterMail.sendingMail(
                    email,
                    'Obrigado por cadastrar-se',
                    signinEmail.EMAIL_BODY.replace('{0}', fullname).replace('{1}', response.id)
                )

                res.json(response);
            })
            .catch(err => {
                if (err.errors) {
                    if (err.errors[0].type === 'unique violation') {
                        res.status(404).json({
                            erroCode: 101,
                            errorBody: req.body,
                            errMessage: err.errors[0].type
                        });
                    }
                } else {
                    res.status(500).json({ err });
                }
            });
    });
}

/* 
* This router is '/users/signin', She recives {email, password}, search email in users table
* and compare password, if email and password is corresponding sending token for authentication
* in the token body contains the user id
*/
exports.signin = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(500).json({
        erroCode: 101,
        errorBody: req.body,
        errMessage: "Erro Body"
    })
    User.findOne({ where: { email } })
        .then(response => {
            bcrypt.compare(password, response.password, (err, result) => {
                if (result) {
                    let token = jwt.sign({ uid: response.id }, Env.tokenKey, {
                        expiresIn: "30 days"
                    });
                    res.json({
                        type: 'bearer',
                        token
                    });
                }
                else {
                    res.status(404).json([{
                        field: "password",
                        erroCode: 101,
                        errorBody: req.body,
                        errMessage: "Password is Wrong!"
                    }]);
                }
            });
        })
        .catch(err => {
            res.status(404).json([{
                field: "email",
                erroCode: 101,
                errorBody: req.body,
                errMessage: "Cannot find user with provided email"
            }]);
        });
}

/*
* This router is '/users/verifytoken', She don't recives body req, becouse she get authorization header
* and veryfi if exist token, if exist does his authentication, and return the user configuration
*/
exports.verifytoken = (req, res, next) => {
    let token = req.headers.authorization.split(' ')[1]
    if (!token) {
        return res.status(401).json({ errCode: 401, errBody: req.body, errMessage: "No token provided" })
    }
    jwt.verify(token, Env.tokenKey, function (err, response) {
        if (err) return res.status(401).json({
            err: 401,
            errBody: false,
            errMessage: 'Failed to authenticate.'
        });
        User.findOne({ where: { id: response.uid } })
            .then(user => {
                res.json({
                    id: user.id,
                    acesso: user.acesso,
                    fullname:user.name,
                    aquisicao: user.aquisition,
                    aMax: user.aMax,
                    aMin: user.aMin,
                    cxB: user.cxB,
                    cxC: user.cxC,
                    cxE: user.cxE,
                    cxTxt: user.cxTxt,
                    isPumpConfigured: user.isPumpConfigured,
                    isPumpBlocked: user.isPumpBlocked,
                    isPumpConcerted: user.isPumpConcerted
                })

            })
            .catch(err => {
                res.status(401).json({
                    err: 401,
                    errBody: false,
                    errMessage: 'Failed to authenticate.'
                })

            })
    });
}

/* 
* This router is '/users/userinformation', She is responsible for returning user information in 
* question (case 1), updating user information (case 2) and updating system configuration information 
* (case 3) 
*/
exports.userinformation = (req, res, next) => {

    let token = req.headers.authorization.split(' ')[1]
    if (!token) {
        return res.status(401).json({ errCode: 500, errBody: req.body, errMessage: "No token provided" })
    }
    const { sending } = req.body;

    if (!sending.acao) return res.status(500).json({
        erroCode: 500,
        errorBody: req.body,
        errMessage: "Erro Body"
    })

    var atualizacao = {};
    jwt.verify(token, Env.tokenKey, function (err, response) {
        if (err) return res.status(401).json({
            auth: false,
            message: 'Failed to authenticate token.'
        });

        switch (sending.acao) {
            case 1:
                User.findOne({ where: { id: response.uid } })
                    .then(user => {
                        res.json({
                            fullname: user.name,
                            addres: user.address,
                            aquisicao: user.aquisition,
                            aMax: user.aMax,
                            aMin: user.aMin,
                            cxB: user.cxB,
                            cxC: user.cxC,
                            cxE: user.cxE,
                            cxTxt: user.cxTxt,
                            isPumpConfigured: user.isPumpConfigured,
                            isPumpBlocked: user.isPumpBlocked,
                            isPumpConcerted: user.isPumpConcerted
                        })
                    })
                    .catch(err => {
                        res.status(401).json({
                            err: 401,
                            errBody: false,
                            errMessage: 'Failed to authenticate.'
                        })
                    })
                break;

            case 2:
                User.findOne({ where: { id: response.uid } })
                    .then(user => {
                        if (sending.name) {
                            atualizacao.name = sending.name;
                        }
                        if (sending.address) {
                            atualizacao.address = sending.address;
                        }
                        if (sending.pasword) {
                            atualizacao.password = sending.pasword;
                        }
                        user.update(atualizacao, { where: { id: response.uid } })
                            .then(response => {
                                atualizacao = {};
                                res.send(true);
                            })
                            .catch(err => {
                                res.status(500).json({
                                    err: 500,
                                    errBody: req.body,
                                    errMessage: err
                                })
                            })
                    })
                    .catch(err => {
                        res.status(500).json({
                            err: 500,
                            errBody: req.body,
                            errMessage: err
                        })
                    })
                break;

            case 3:
                User.findOne({ where: { id: response.uid } })
                    .then(user => {
                        if (sending.aquisition) {
                            if (sending.aquisition < 3) {
                                atualizacao.aquisition = 3;
                            }
                            else {
                                atualizacao.aquisition = sending.aquisition;
                            }
                        }
                        if (sending.aMax) {
                            atualizacao.aMax = sending.aMax;
                        }
                        if (sending.aMin) {
                            atualizacao.aMin = sending.aMin;
                        }
                        if (sending.cxB) {
                            atualizacao.cxB = sending.cxB;
                            atualizacao.cxC = sending.cxC;
                            atualizacao.cxE = sending.cxE;
                            atualizacao.cxTxt = sending.cxTxt;
                        }
                        if (sending.isPumpConfigured === 0 || sending.isPumpConfigured === 1) {
                            atualizacao.isPumpConfigured = sending.isPumpConfigured
                        }

                        if (sending.isPumpBlocked === 0 || sending.isPumpBlocked === 1) {
                            atualizacao.isPumpBlocked = sending.isPumpBlocked
                        }

                        if (sending.isPumpConcerted === 0 || sending.isPumpConcerted === 1) {
                            atualizacao.isPumpConcerted = sending.isPumpConcerted
                        }
                        User.update(atualizacao, { where: { id: response.uid } })
                            .then(response => {
                                res.send(true);
                            })
                            .catch(err => {
                                res.status(500).json({
                                    err: 500,
                                    errBody: req.body,
                                    errMessage: err
                                })
                            })
                    })
                    .catch(err => {
                        res.status(500).json({
                            err: 500,
                            errBody: req.body,
                            errMessage: err
                        })
                    })
                break;
        }//End Switch
    })//End verify token
}

/* 
* This router is '/users/request', She is responsible for get the nivels informations in niveltable
* and return the last nivel related to the id of the login user
*/
exports.request = (req, res, next) => {
    let token = req.headers.authorization.split(' ')[1]
    if (!token) {
        return res.status(401).json({ errCode: 500, errBody: req.body, errMessage: "No token provided" })
    }
    const { acao } = req.body;

    if (!acao) return res.status(500).json({
        erroCode: 500,
        errorBody: req.body,
        errMessage: "Erro Body"
    })

    this.lastNivel;

    if (acao == 1) {
        jwt.verify(token, Env.tokenKey, function (err, response) {
            if (err) return res.status(401).json({
                auth: false,
                message: 'Failed to authenticate token.'
            });
            User.findAll({
                include: [{
                    model: Nivel
                }]
            })
                .then(finder => {
                    finder.map(finderUser => {
                        if (finderUser.dataValues.id == response.uid)

                            var lastFinder = finderUser.dataValues.niveltables
                            [finderUser.dataValues.niveltables.length - 1].dataValues;

                        if (lastFinder)
                            this.lastNivel = lastFinder;
                        return
                    })
                    res.json(lastNivel);
                })
                .catch(err => {
                    res.status(500).json({
                        erroCode: 500,
                        errorBody: req.body,
                        errMessage: err
                    })
                })
        })
    }
}

/* 
* This router is '/users/emailaccept', She is responsible for confirm user access by registered email
* this set acesso colum in the database with 1
*/
exports.emailaccept = (req, res, next) => {
    const id = req.params.user_id

    if (!id) {
        return res.status(401).json({ errCode: 500, errBody: req.body, errMessage: "No token provided" })
    }

    User.update({ acesso: 1 }, { where: { id } })
        .then(response => {
            res.send(true);
        })
        .catch(err => {
            res.status(500).json({
                err: 500,
                errBody: req.body,
                errMessage: err
            })
        })
}

/* 
* This router is '/users/verifyacesso', She is responsible for verify if this user already confirmed
*/
exports.verifyacesso = (req, res) => {

    User.findOne({where: { id: req.body.id }})
        .then(response => {
            res.status(200).json({
                user_id: response.id,
                acesso: response.acesso
            })
        })
        .catch(err => {
            res.status(500).json({
                err: 500,
                errBody: req.body,
                errMessage: err
            })
        })
}