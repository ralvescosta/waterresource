const Env = require('../.env');
const jwt = require('jsonwebtoken');

const { Nivel } = require('../models');
const { User } = require('../models');

/*
 *This router is '/gateway' , this index menssage, to to confirm the operation of the backend
 */
exports.index = (req, res) => {
    res.status(200).json({
        ServerStatus: 200,
        Body: 'Geteway Router Running',
        Date: new Date()
    })
}

/*
 *This router is '/configuration', responsible for sending the sensor the initial configuration
 */
exports.configuration = (req, res) => {
    const { LçGityAbhtppppeWihjAyYy } = req.body

    if (!LçGityAbhtppppeWihjAyYy.WaterResource.userId) {
        return res.status(500).json({
            err: 500,
            errBody: req.body,
            errMessage: err
        })
    }

    let userId = LçGityAbhtppppeWihjAyYy.WaterResource.userId
    User.findOne({ where: { id: userId } })
        .then(user => {
            res.status(200).json({
                aquisition: user.aquisition,
                aMin: user.aMin,
                aMax: user.aMax,
                cxB: user.cxB,
                cxC: user.cxC,
                cxE: user.cxE,
                isPumpConfigured: user.isPumpConfigured,
                isPumpBlocked: user.isPumpBlocked
            });
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
 *This router is '/nivel' , responsible for recive nivel and pump status
 */
exports.nivel = (req, res) => {
    const { LçGityAbhtppppeWihjAyYy } = req.body

    if (!LçGityAbhtppppeWihjAyYy.WaterResource) {
        return res.status(500).json({
            err: 500,
            errBody: req.body,
            errMessage: err
        })
    }

    const { userId, nivel, isPumpBlocked } = LçGityAbhtppppeWihjAyYy.WaterResource

    var att = isPumpBlocked;

    User.findOne({ where: { id: userId } })
        .then(userInfo => {
            //If the isPumpBlocked Db registor is different than isPumpBlocked recive in req.body
            // and isPumpConcerted = 0 (Pump has not been fixed yet) change Db PumpBlocked
            // to information if some problem happened in Pump

            //If isPumpBloked Db registor different than req.body.isPumpBlocked but 
            //isPumpConcerted != 0 , means the user change in User Interface the Bloked state
            //so sneding that for the Gateway
            if ((att === 1) && userInfo.isPumpConcerted === 0) {
                User.update({ isPumpBlocked: att }, { where: { id: userId } })
                    .then(userInfoAtta => {
                        //User isPumpBlocked Att
                        Nivel.create({ userId, nivel })
                            .then(response => {
                                let gatweyResponse = {
                                    aquisition: userInfo.aquisition,
                                    aMin: userInfo.aMin,
                                    aMax: userInfo.aMax,
                                    cxB: userInfo.cxB,
                                    cxC: userInfo.cxC,
                                    cxE: userInfo.cxE,
                                    isPumpConfigured: userInfo.isPumpConfigured,
                                    isPumpBlocked: isPumpBlocked
                                }
                                let webSocketResponse = {
                                    id: response.id,
                                    userId: response.userId,
                                    nivel: response.nivel,
                                    isPumpConfigured: userInfo.isPumpConfigured,
                                    isPumpBlocked: isPumpBlocked,
                                    updatedAt: response.updatedAt,
                                    createdAt: response.createdAt
                                }

                                req.io.emit("gateway", webSocketResponse)
                                res.json(gatweyResponse)
                            })
                            .catch(err => {
                                res.json(err)
                            })
                    })
            }
            else if ((att === 1) && (userInfo.isPumpBlocked === 0) && userInfo.isPumpConcerted === 1) {
                User.update({ isPumpBlocked: 0, isPumpConcerted: 0 }, { where: { id: userId } })
                    .then(userInfoAttb => {
                        //User isPumpBlocked Att
                        Nivel.create({ userId, nivel })
                            .then(nivelTable => {

                                let gatweyResponse = {
                                    aquisition: userInfo.aquisition,
                                    aMin: userInfo.aMin,
                                    aMax: userInfo.aMax,
                                    cxB: userInfo.cxB,
                                    cxC: userInfo.cxC,
                                    cxE: userInfo.cxE,
                                    isPumpConfigured: userInfo.isPumpConfigured,
                                    isPumpBlocked: 0
                                }
                                let webSocketResponse = {
                                    id: nivelTable.id,
                                    userId: nivelTable.userId,
                                    nivel: nivelTable.nivel,
                                    isPumpConfigured: userInfo.isPumpConfigured,
                                    isPumpBlocked: 0,
                                    updatedAt: nivelTable.updatedAt,
                                    createdAt: nivelTable.createdAt
                                }
                                req.io.emit("gateway", webSocketResponse)
                                res.json(gatweyResponse)
                            })
                            .catch(err => {
                                res.json(err)
                            })
                    })
            }
            else {
                Nivel.create({ userId, nivel })
                    .then(nivelTable => {

                        let gatweyResponse = {
                            aquisition: userInfo.aquisition,
                            aMin: userInfo.aMin,
                            aMax: userInfo.aMax,
                            cxB: userInfo.cxB,
                            cxC: userInfo.cxC,
                            cxE: userInfo.cxE,
                            isPumpConfigured: userInfo.isPumpConfigured,
                            isPumpBlocked: att
                        }
                        let webSocketResponse = {
                            id: nivelTable.id,
                            userId: nivelTable.userId,
                            nivel: nivelTable.nivel,
                            isPumpConfigured: userInfo.isPumpConfigured,
                            isPumpBlocked: att,
                            updatedAt: nivelTable.updatedAt,
                            createdAt: nivelTable.createdAt
                        }

                        req.io.emit("gateway", webSocketResponse)
                        res.json(gatweyResponse)
                    })
                    .catch(err => {
                        res.json(err)
                    })
            }
        })

}

/*
 *This router is '/userRegister' , responsible for create first register in the niveltales 
 *at the moment of confirmation of registration
 */
exports.userRegister = (req, res) => {

    const { userId, nivel } = req.body.WaterResource

    Nivel.create({ userId, nivel })
        .then(response => {
            res.status(200).json(true)
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
 *This router is '/allNiveis', responsible for return all nivels in niveltables of user
 */
exports.allNiveis = (req, res) => {
    let token = req.headers.authorization.split(' ')[1]
    if (!token) {
        return res.status(401).json({ errCode: 500, errBody: req.body, errMessage: "No token provided" })
    }

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
                    if (finderUser.dataValues.id == response.uid) {
                        res.status(200).json(finderUser);
                    }
                })
            })
    })
}