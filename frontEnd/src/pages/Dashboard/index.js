import React, { Component } from "react";
import { FormGroup, Label, Input, FormFeedback, FormText, Button, Alert, Card, CardBody, CardTitle, CardGroup, CardImg, Modal, ModalHeader, ModalBody, ModalFooter, Row, Col } from 'reactstrap';
import { Line, Bar } from 'react-chartjs-2';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import $ from 'jquery'

import MDSpinner from "react-md-spinner";

import Push from 'push.js'

import "./style.css";
import api from "../../services/api";
import { dashboadURL, socketIO } from "../../environment"

//import { notificationPermission } from '../../services/push-notification';
//import { firebaseAuthKey } from "../../environment"
//import axios from 'axios'

class Dashboard extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            url: dashboadURL,
            userId:'',
            status: {
                mounted: true,
                aux: false,
                aux2: false
            },
            chartData: {
                labels: ["Cheio"],
                datasets: [{
                    label: 'Nível da Caixa Principal',
                    data: [75],
                    backgroundColor: [
                        'rgba(54, 162, 235, 1)',
                    ]
                }]
            },
            chartModal: {
                labels: [],
                datasets: [{
                    label: 'Nível da Caixa Principal',
                    data: [],
                    backgroundColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 230, 200, 1)',
                    ]
                }]
            },
            modalConfig: false,
            modalInformacao: false,
            modalAlertInformacao: false,
            modalAlertConfig: false,
            modalSaveInformacao: false,
            modalSaveConfig: false,
            modalCxConfig: false,
            modalSaveCxConfig: false,
            modalPumpConfig: false,
            modalPumpAlertConfig: false,
            modalPumpSave: false,
            modalHistoryReading: false,
            notifyToken: '',
            UserInfoAlert: {
                message: '',
                color: "success",
                nivel: ''
            },
            configuracao: {
                tempoAquisicao: '',
                aMin: '',
                aMax: '',
            },
            isPumpConfigured: '',
            isPumpBlocked: '',
            isPumpConcerted: '',
            isPumpConfiguredHandle: undefined,
            isPumpBlockedHandle: undefined,
            pumpTxt: '',
            informacao: {
                fullName: '',
                addres: ''
            },
            modalInput: {
                tempoAquisicao: undefined,
                aMin: undefined,
                aMax: undefined,
                name: undefined,
                address: undefined,
                password: undefined
            },
            feedbackInputConfigAquisicao: {
                valid: false
            },
            feedbackInputConfigAmax: {
                valid: false
            },
            feedbackInputConfigAmin: {
                valid: false
            },
            feedbackInputInfoPassword: {
                valid: false,
                invalid: false
            },
            feedbackInputConfigVolume: {
                invalid: false
            },
            feedbackInputConfigBb: {
                invalid: false
            },
            feedbackInputConfigCc: {
                invalid: false
            },
            feedbackInputConfigEe: {
                invalid: false
            },
            verifyWifiError: false,
            reservatorio: {
                case: 0,
                volume: 0,
                Bb: 0,
                Cc: 0,
                Ee: 0,
                txt: '',
                saveDb: false,
                other: {
                    volume: undefined,
                    Bb: undefined,
                    Cc: undefined,
                    Ee: undefined,
                },
                alert: {
                    invalid: false
                }
            }
        }
    }
/****************************************************************************************/
    componentDidMount() {
        //Verify Token Authentication, update graphic and alerts states
        if (localStorage.getItem("WR_IFMG")) {
            try {
                api.post("/users/verifytoken", { key: '' })
                    .then(response => {
                        if (response.data) {
                            if (response.data.acesso === 1) {
                                this.setState({
                                    userId: response.data.id,
                                    configuracao: {
                                        tempoAquisicao: response.data.aquisicao,
                                        aMax: response.data.aMax,
                                        aMin: response.data.aMin
                                    },
                                    reservatorio: {
                                        case: this.state.reservatorio.case,
                                        volume: this.state.reservatorio.volume,
                                        Bb: response.data.cxB,
                                        Cc: response.data.cxC,
                                        Ee: response.data.cxE,
                                        txt: response.data.cxTxt
                                    },
                                    isPumpConfigured: parseInt(response.data.isPumpConfigured),
                                    isPumpBlocked: parseInt(response.data.isPumpBlocked),
                                })
                                this.props.history.push("/dashboard");
                            } else {
                                localStorage.removeItem("WR_IFMG");
                                window.location.href = this.state.url + "/signin"
                            }
                        }
                    })
                    .catch((err) => {
                    })
            } catch (err) {
            }
        }
        ////////////////////Dashboard Atualization
        this.graphicAtt();
        this.startTimer();
        this.WebSocket();
        /////////////////////////////////////
        this.jquery()
    }
/****************************************************************************************/
    startTimer = () => {
        /* 
         * This function sets up a timer, this timer executing in 1h to 1h, when this executin
         * its call timercallback
        */
        setInterval(this.timerCallback, (1000 * 60 * 60 * 2))
    }
/****************************************************************************************/
    timerCallback = () => {
        /*
         *  This function updates graphics and alert dialogs 
        */
        this.graphicAtt();
    }

/****************************************************************************************/
    jquery = () => {
        //$('#sidebar').toggleClass('active');
        $(document).ready(function () {
            $('#sidebarCollapse').on('click', function () {
                $('#sidebar').toggleClass('active');
                $(this).toggleClass('active');
            });
        });

    }

/****************************************************************************************/
    attPumpTxt = () => {
        /*
         * This function update the pump states
        */
        if (this.state.isPumpConfigured === 0) {

            this.setState({
                pumpTxt: 'Bomba não configurada',
            })
        }
        //Se o usuario configurou uma bomba no sistema
        else {
            //Se a bomba estiver bloqueada
            if (this.state.isPumpBlocked === 1) {

                this.setState({
                    pumpTxt: 'Bomba bloqueada, verifique por qual motivo antes de desbloquea-la',
                })
            }
            //Se a bomba estiver funcionando normalmente
            else {
                this.setState({
                    pumpTxt: 'Bomba configurada e em funcionamento normal',
                })
            }
        }
    }

/****************************************************************************************/
    logout = () => {
        /*
         * This Funtion delet the token in the local storage and redrect the user to home page
        */
        localStorage.removeItem("WR_IFMG");
        window.location.href = this.state.url
    }

//////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////// FORMS  INPUTS //////////////////////////////////
    handleAddress = (e) => {
        /*
         * Get Anddress Input
        */
        e.preventDefault();
        this.setState({
            modalInput: {
                address: e.target.value,
                name: this.state.modalInput.name,
                password: this.state.modalInput.password
            }
        })
    }

/****************************************************************************************/
    handleName = (e) => {
        /*
         * Get Name Input
        */
        e.preventDefault();
        this.setState({
            modalInput: {
                address: this.state.modalInput.address,
                name: e.target.value,
                password: this.state.modalInput.password
            }
        })
    }

/****************************************************************************************/
    handlePassword = (e) => {
        /*
         * Get Password Input
        */
        e.preventDefault();
        this.setState({
            modalInput: {
                address: this.state.modalInput.address,
                name: this.state.modalInput.name,
                password: e.target.value

            }
        })
        if (e.target.value.length < 6) {
            this.setState({
                feedbackInputInfoPassword: {
                    valid: false,
                    invalid: true
                },
            })
        } else {
            this.setState({
                feedbackInputInfoPassword: {
                    valid: true,
                    invalid: false
                },
            })
        }
    }

/****************************************************************************************/
    handleTimeAquisition = (e) => {
        /*
         * Get AquisitionTime Input
        */
        e.preventDefault();
        this.setState({
            modalInput: {
                tempoAquisicao: e.target.value,
                aMax: this.state.modalInput.aMax,
                aMin: this.state.modalInput.aMin
            }
        })
    }

/****************************************************************************************/
    handleaMax = (e) => {
        /*
         * Get aMax Input
        */
        this.setState({
            modalInput: {
                tempoAquisicao: this.state.modalInput.tempoAquisicao,
                aMax: e.target.value,
                aMin: this.state.modalInput.aMin
            }
        })
    }

/****************************************************************************************/
    handleaMin = (e) => {
        /*
         * Get aMin Input
        */
        this.setState({
            modalInput: {
                tempoAquisicao: this.state.modalInput.tempoAquisicao,
                aMax: this.state.modalInput.aMax,
                aMin: e.target.value,
            }
        })
    }

/****************************************************************************************/
    handleReservatorio = (e) => {
        /*
         * Get standard reservoir Input
        */
        switch (e.target.value) {
            case '1 - FORTLEV 100 Litros':
                this.setState({
                    reservatorio: {
                        case: 1,
                        volume: 100,
                        Bb: 0.41,
                        Cc: 0.75,
                        Ee: 0.54,
                        txt: '100 L, B = 0.42 / C = 0.75 / E = 0.54',
                        saveDb: true
                    }
                })
                break;
            case '2 - FORTLEV 150 Litros':
                this.setState({
                    reservatorio: {
                        case: 2,
                        volume: 150,
                        Bb: 0.43,
                        Cc: 0.88,
                        Ee: 0.61,
                        txt: '150 L, B = 0.42 / C = 0.75 / E = 0.54',
                        saveDb: true
                    }
                })
                break;
            case '3 - FORTLEV 250 Litros':
                this.setState({
                    reservatorio: {
                        case: 3,
                        volume: 250,
                        Bb: 0.50,
                        Cc: 1.04,
                        Ee: 0.78,
                        txt: '250 L, B = 0.50 / C = 1.04 / E = 0.78',
                        saveDb: true
                    }
                })
                break;
            case '4 - FORTLEV 310 Litros':
                this.setState({
                    reservatorio: {
                        case: 4,
                        volume: 310,
                        Bb: 0.54,
                        Cc: 1.05,
                        Ee: 0.75,
                        txt: '310 L, B = 0.54 / C = 1.05 / E = 0.75',
                        saveDb: true
                    }
                })
                break;
            case '5 - FORTLEV 500 Litros':
                this.setState({
                    reservatorio: {
                        case: 5,
                        volume: 500,
                        Bb: 0.58,
                        Cc: 1.24,
                        Ee: 0.95,
                        txt: '500 L, B = 0.58 / C = 1.24 / E = 0.95',
                        saveDb: true
                    }
                })
                break;
            case '6 - FORTLEV 750 Litros':
                this.setState({
                    reservatorio: {
                        case: 6,
                        volume: 750,
                        Bb: 0.73,
                        Cc: 1.37,
                        Ee: 1,
                        txt: '750 L, B = 0.73 / C = 1.37 / E = 1',
                        saveDb: true
                    }
                })
                break;
            case '7 - FORTLEV 1000 Litros':
                this.setState({
                    reservatorio: {
                        case: 7,
                        volume: 1000,
                        Bb: 0.76,
                        Cc: 1.52,
                        Ee: 1.16,
                        txt: '1000 L, B = 0.97 / C = 1.52 / E = 1.16',
                        saveDb: true
                    }
                })
                break;
            case '8 - FORTLEV 1500 Litros':
                this.setState({
                    reservatorio: {
                        case: 8,
                        volume: 15000,
                        Bb: 0.83,
                        Cc: 1.77,
                        Ee: 1.43,
                        txt: '1500 L, B = 0.83 / C = 1.77 / E = 1.43',
                        saveDb: true
                    }
                })
                break;
            case '9 - FORTLEV 2000 Litros':
                this.setState({
                    reservatorio: {
                        case: 9,
                        volume: 2000,
                        Bb: 0.90,
                        Cc: 1.89,
                        Ee: 1.55,
                        txt: '2000 L, B = 0.90 / C = 1.89 / E = 1.55',
                        saveDb: true
                    }
                })
                break;
            case '10 - FORTLEV 3000 Litros':
                this.setState({
                    reservatorio: {
                        case: 10,
                        volume: 3000,
                        Bb: 1.21,
                        Cc: 2.28,
                        Ee: 1.72,
                        txt: '3000 L, B = 1.21 / C = 2.28 / E = 1.72',
                        saveDb: true
                    }
                })
                break;
            case '11 - FORTLEV 5000 Litros':
                this.setState({
                    reservatorio: {
                        case: 11,
                        volume: 3000,
                        Bb: 2.03,
                        Cc: 2.95,
                        Ee: 2.41,
                        txt: '5000 L, B = 2.03 / C = 2.95 / E = 2.41',
                        saveDb: true
                    }
                })
                break;
            case '12 - Outros...':
                this.setState({
                    reservatorio: {
                        case: 12,
                        volume: this.state.reservatorio.volume,
                        Bb: this.state.reservatorio.Bb,
                        Cc: this.state.reservatorio.Cc,
                        Ee: this.state.reservatorio.Ee,
                        other: {
                            volume: 0,
                            Bb: 0,
                            Cc: 0,
                            Ee: 0
                        }
                    },
                    modalCxConfig: !this.state.modalCxConfig,
                    modalSaveCxConfig: true,
                    feedbackInputConfigVolume: {
                        invalid: false
                    },
                    feedbackInputConfigBb: {
                        invalid: false
                    },
                    feedbackInputConfigCc: {
                        invalid: false
                    },
                    feedbackInputConfigEe: {
                        invalid: false
                    }
                })
                break;
            default:
                break;
        }
    }

/****************************************************************************************/
    handleTankVolume = (e) => {
        /*
         * Get volume Input 
        */
        this.setState({
            reservatorio: {
                case: 12,
                other: {
                    volume: e.target.value,
                    Bb: this.state.reservatorio.other.Bb,
                    Cc: this.state.reservatorio.other.Cc,
                    Ee: this.state.reservatorio.other.Ee
                }
            }
        })
    }

/****************************************************************************************/
    handleTankB = (e) => {
        /*
         * Get B param Input 
        */
        this.setState({
            reservatorio: {
                case: 12,
                other: {
                    volume: this.state.reservatorio.other.volume,
                    Bb: e.target.value,
                    Cc: this.state.reservatorio.other.Cc,
                    Ee: this.state.reservatorio.other.Ee
                }
            }
        })

    }

/****************************************************************************************/
    handleTankD = (e) => {
        /*
         * Get D param Input 
        */
        this.setState({
            reservatorio: {
                case: 12,
                other: {
                    volume: this.state.reservatorio.other.volume,
                    Bb: this.state.reservatorio.other.Bb,
                    Cc: e.target.value,
                    Ee: this.state.reservatorio.other.Ee
                }
            }
        })
    }

/****************************************************************************************/
    handleTankE = (e) => {
        /*
         * Get E param Input 
        */
        this.setState({
            reservatorio: {
                case: 12,
                other: {
                    volume: this.state.reservatorio.other.volume,
                    Bb: this.state.reservatorio.other.Bb,
                    Cc: this.state.reservatorio.other.Cc,
                    Ee: e.target.value
                }
            }
        })
    }

/****************************************************************************************/
    handlePumpConfig = (e) => {
        /*
         * Get pump state Input 
        */
        switch (e.target.value) {
            case "1 - Habilitar Bomba":
                this.setState({
                    isPumpConfiguredHandle: 1,
                    isPumpConcerted: 0
                })
                break;
            case "1 - Desablitar a Bomba":
                this.setState({
                    isPumpConfiguredHandle: 0,
                    isPumpConcerted: 0
                })
                break;
            case "2 - Desbloquear a Bomba":
                this.setState({
                    isPumpBlockedHandle: 0,
                    isPumpConcerted: 1
                })
                break;
            default:
                break;
        }
    }

//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////// CONFIGURATE MODAL ///////////////////////////////
    toggleModalConfig = () => {
        /*
         * Open Modal Configurate, and Get the user configurate to data 
        */
        $('#sidebar').toggleClass('active');
        this.setState({
            modalConfig: !this.state.modalConfig,
            feedbackInputConfigAquisicao: {
                valid: false,
                invalid: false
            },
            feedbackInputConfigAmax: {
                valid: false,
                invalid: false
            },
            feedbackInputConfigAmin: {
                valid: false,
                invalid: false
            },
        });
        if (!this.state.modalConfig) {
            try {
                api.post("/users/userinformation", { sending: { acao: 1 } }).then(response => {
                    if (response.data) {
                        this.setState({
                            modalConfig: true,
                            informacao: {
                                fullName: response.data.fullname,
                                addres: response.data.addres
                            },
                            configuracao: {
                                tempoAquisicao: response.data.aquisicao,
                                aMax: response.data.aMax,
                                aMin: response.data.aMin
                            },
                            reservatorio: {
                                case: this.state.reservatorio.case,
                                volume: 500,
                                Bb: response.data.cxB,
                                Cc: response.data.cxC,
                                Ee: response.data.cxE,
                                txt: response.data.cxTxt,
                            }
                        });
                    } else {
                        alert("Ops, Ocorreu algum erro, tente novamente mais tarde!")
                    }
                }).catch((err) => {
                    alert("Ops, Ocorreu algum erro, tente novamente mais tarde!")
                })
            } catch (err) {
                alert("Ops, Ocorreu algum erro, tente novamente mais tarde!")
            }
        } else {
            this.setState({
                modalConfig: false,
            });
        }
    }

/****************************************************************************************/
    btnModalConfig = () => {
        /*
         * This function treats if the user click in Save Changes in the COnfigurate Modal 
         */
        let modalConfigParans = {
            aquisicao: undefined,
            aMax: undefined,
            aMin: undefined
        }
        //If any information changes, close modal
        if (!this.state.modalInput.tempoAquisicao &&
            !this.state.modalInput.aMax &&
            !this.state.modalInput.aMin &&
            !this.state.reservatorio.saveDb) {
            this.setState({
                modalConfig: !this.state.modalConfig
            });
        }
        else {
            //If some information changes, verify the correct format
            if (this.state.modalInput.tempoAquisicao % 1 === 0 &&
                !isNaN(this.state.modalInput.tempoAquisicao)) {
                //if time of aquisition is interger number
                modalConfigParans.aquisicao = true;
                this.setState({
                    feedbackInputConfigAquisicao: {
                        invalid: false
                    }
                })

            } else {
                //if time of aquisition input is wrong
                if (this.state.modalInput.tempoAquisicao) {
                    modalConfigParans.aquisicao = false;
                    this.setState({
                        feedbackInputConfigAquisicao: {
                            invalid: true
                        },
                        modalInput: {
                            tempoAquisicao: undefined,
                            aMin: this.state.modalInput.aMin,
                            aMax: this.state.modalInput.aMax,
                        }
                    })
                }
            }
            if (this.state.modalInput.aMax % 1 === 0 &&
                !isNaN(this.state.modalInput.aMax)) {
                //if aMax is integer number
                modalConfigParans.aMax = true;
                this.setState({
                    feedbackInputConfigAmax: {
                        invalid: false
                    }
                })
            } else {
                if (this.state.modalInput.aMax) {
                    modalConfigParans.aMax = false;
                    this.setState({
                        feedbackInputConfigAmax: {
                            invalid: true
                        },
                        modalInput: {
                            tempoAquisicao: this.state.modalInput.tempoAquisicao,
                            aMin: this.state.modalInput.aMin,
                            aMax: undefined,
                        }
                    })
                }
            }
            if (this.state.modalInput.aMin < 1 &&
                !isNaN(this.state.modalInput.aMin)) {
                //if aMin is smaller then one
                modalConfigParans.aMin = true;
                this.setState({
                    feedbackInputConfigAmin: {
                        invalid: false
                    }
                })
            } else {
                if (this.state.modalInput.aMin) {
                    modalConfigParans.aMin = false;
                    this.setState({
                        feedbackInputConfigAmin: {
                            invalid: true
                        },
                        modalInput: {
                            tempoAquisicao: this.state.modalInput.tempoAquisicao,
                            aMin: undefined,
                            aMax: this.state.modalInput.aMax,
                        }
                    })
                }
            }
        }
        //If some information inpu is rigth, open othe modal ask "Do you want change this?"
        if (modalConfigParans.aquisicao === true || modalConfigParans.aMax === true || modalConfigParans.aMin === true || this.state.reservatorio.saveDb) {

            if (modalConfigParans.aquisicao === false || modalConfigParans.aMax === false || modalConfigParans.aMin === false) {
                //if any input is wrong, send the error to user
            } else {
                //if all of inputs is right
                this.setState({
                    modalAlertConfig: !this.state.modalAlertConfig
                })
            }
        }
    }

/****************************************************************************************/
    toggleModalAlertConfig = () => {
        /*
         * Modal ask if user realy change your informations 
         */
        this.setState({
            modalAlertConfig: !this.state.modalAlertConfig,
            modalSaveConfig: true,
            modalInput: {
                tempoAquisicao: undefined,
                aMin: undefined,
                aMax: undefined,
            }
        })
    }

/****************************************************************************************/
    toggleSaveConfig = () => {
        /*
         * Save Configurate changes in the data base 
        */
        if (this.state.modalInput.tempoAquisicao < 3) {
            this.setState({
                modalInput: {
                    tempoAquisicao: 3
                },
                modalAlertConfig: !this.state.modalAlertConfig,
                modalSaveConfig: true
            })
        } else {
            this.setState({
                modalAlertConfig: !this.state.modalAlertConfig,
                modalSaveConfig: true
            })
        }

        let sending = {
            acao: 3,
            aquisition: this.state.modalInput.tempoAquisicao,
            aMax: this.state.modalInput.aMax,
            aMin: this.state.modalInput.aMin,
            cxB: this.state.reservatorio.Bb,
            cxC: this.state.reservatorio.Cc,
            cxE: this.state.reservatorio.Ee,
            cxTxt: this.state.reservatorio.txt
        }
        try {
            api.post("/users/userinformation", { sending }).then(response => {
                if (response.data) {
                    alert("Atualização Realizada com Sucesso")
                } else {
                    alert("Ops, ocorreu um erro inesperado, tente novamente mais tarde")
                }
            }).catch((err) => {
                alert("Ops, ocorreu um erro inesperado, tente novamente mais tarde")
            })
        } catch (err) {
            alert("Ops, ocorreu um erro inesperado, tente novamente mais tarde")
        }
    }

/****************************************************************************************/
    toggleCloseCxConfig = () => {
        /*
        * BY SELECTING OTHER TYPES OF RESERVOIRS OPEN THE MODAL TO ENTER WITH * THE CONFIGURATIONS 
        * BY CLICKING THE BOOT BACK IN THE CONFIGURATION MODE OF OTHER CASH *
        * TYPES EXECUTED THIS FUNCTION
        */
        this.setState({
            reservatorio: {
                case: 12,
                volume: this.state.reservatorio.volume,
                Bb: this.state.reservatorio.Bb,
                Cc: this.state.reservatorio.Cc,
                Ee: this.state.reservatorio.Ee,
                txt: 'Preencha todos os campos e precione o botão "Salvar"',
                saveDb: false,
                other: {
                    volume: undefined,
                    B: undefined,
                    C: undefined,
                    E: undefined
                }
            },
            modalCxConfig: false,
            modalSaveCxConfig: false,
        })
    }

/****************************************************************************************/    
    toggleSaveBxConfig = () => {
        /*
         * BY CLICKING THE BOX SAVE IN THE CONFIGURATION MODE OF OTHER CASH TYPES EXECUTED THIS 
         * FUNCTION
        */
        let modalConfigParans = {
            volume: undefined,
            Bb: undefined,
            Cc: undefined,
            Ee: undefined
        }
        if (!this.state.reservatorio.other.volume &&
            !this.state.reservatorio.other.Bb &&
            !this.state.reservatorio.other.Cc &&
            !this.state.reservatorio.other.Ee) {
            //SE NAO FOR INSERIDO NENHUMA INFORMACAO
            this.setState({
                reservatorio: {
                    case: 12,
                    volume: this.state.reservatorio.volume,
                    Bb: this.state.reservatorio.Bb,
                    Cc: this.state.reservatorio.Cc,
                    Ee: this.state.reservatorio.Ee,
                    txt: 'Escolha uma opção',
                    saveDb: false,
                    other: {
                        volume: undefined,
                        Bb: undefined,
                        Cc: undefined,
                        Ee: undefined
                    }
                },
                feedbackInputConfigVolume: {
                    invalid: true
                },
                feedbackInputConfigBb: {
                    invalid: true
                },
                feedbackInputConfigCc: {
                    invalid: true
                },
                feedbackInputConfigEe: {
                    invalid: true
                }
            })
        }
        else {
            if ((!isNaN(this.state.reservatorio.other.volume))) {
                //If the value you enter for the volume is a number
                modalConfigParans.volume = true;

                this.setState({
                    feedbackInputConfigVolume: {
                        invalid: false
                    }
                })

            } else {
                if (this.state.reservatorio.other.volume) {
                    //If it is not a number, check if the initial volume value has changed
                    modalConfigParans.volume = false;

                    this.setState({
                        feedbackInputConfigVolume: {
                            invalid: true
                        },
                        reservatorio: {
                            case: 12,
                            volume: this.state.reservatorio.volume,
                            Bb: this.state.reservatorio.Bb,
                            Cc: this.state.reservatorio.Cc,
                            Ee: this.state.reservatorio.Ee,
                            txt: this.state.reservatorio.txt,
                            saveDb: false,
                            other: {
                                volume: undefined,
                                Bb: this.state.reservatorio.other.Bb,
                                Cc: this.state.reservatorio.other.Cc,
                                Ee: this.state.reservatorio.other.Ee,
                            },
                        }
                    })
                }
            }

            if ((!isNaN(this.state.reservatorio.other.Bb))) {
                modalConfigParans.Bb = true;

                this.setState({
                    feedbackInputConfigBb: {
                        invalid: false
                    }
                })

            } else {
                if (this.state.reservatorio.other.Bb) {
                    modalConfigParans.Bb = false;

                    this.setState({
                        feedbackInputConfigBb: {
                            invalid: true
                        },
                        reservatorio: {
                            case: 12,
                            volume: this.state.reservatorio.volume,
                            Bb: this.state.reservatorio.Bb,
                            Cc: this.state.reservatorio.Cc,
                            Ee: this.state.reservatorio.Ee,
                            txt: this.state.reservatorio.txt,
                            saveDb: false,
                            other: {
                                volume: this.state.reservatorio.other.volume,
                                Bb: undefined,
                                Cc: this.state.reservatorio.other.Cc,
                                Ee: this.state.reservatorio.other.Ee,
                            },
                        }
                    })

                }
            }

            if ((!isNaN(this.state.reservatorio.other.Cc))) {
                modalConfigParans.Cc = true;

                this.setState({
                    feedbackInputConfigCc: {
                        invalid: false
                    }
                })

            } else {
                if (this.state.reservatorio.other.Cc) {
                    modalConfigParans.Cc = false;

                    this.setState({
                        feedbackInputConfigCc: {
                            invalid: true
                        },
                        reservatorio: {
                            case: 12,
                            volume: this.state.reservatorio.volume,
                            Bb: this.state.reservatorio.Bb,
                            Cc: this.state.reservatorio.Cc,
                            Ee: this.state.reservatorio.Ee,
                            txt: this.state.reservatorio.txt,
                            saveDb: false,
                            other: {
                                volume: this.state.reservatorio.other.volume,
                                Bb: this.state.reservatorio.other.Bb,
                                Cc: undefined,
                                Ee: this.state.reservatorio.other.Ee,
                            },
                        }
                    })
                }
            }

            if ((!isNaN(this.state.reservatorio.other.Ee))) {
                modalConfigParans.Ee = true;

                this.setState({
                    feedbackInputConfigEe: {
                        invalid: false
                    }
                })

            } else {
                if (this.state.reservatorio.other.Ee) {
                    modalConfigParans.Ee = false;

                    this.setState({
                        feedbackInputConfigEe: {
                            invalid: true
                        },
                        reservatorio: {
                            case: 12,
                            volume: this.state.reservatorio.volume,
                            Bb: this.state.reservatorio.Bb,
                            Cc: this.state.reservatorio.Cc,
                            Ee: this.state.reservatorio.Ee,
                            txt: this.state.reservatorio.txt,
                            saveDb: false,
                            other: {
                                volume: this.state.reservatorio.other.volume,
                                Bb: this.state.reservatorio.other.Bb,
                                Cc: this.state.reservatorio.other.Cc,
                                Ee: undefined,
                            },
                        }
                    })
                }
            }
        }
        if (modalConfigParans.volume === true && modalConfigParans.Bb === true && modalConfigParans.Cc === true &&
            modalConfigParans.Ee === true) {
            //IF ALL INFORMATION WAS INSERTED
            if (modalConfigParans.volume === false || modalConfigParans.Bb === false || modalConfigParans.Cc === false ||
                modalConfigParans.Ee === false) {
                //IF SOME INFORMATION IS NOT WRONG, IT DOES NOTHING
            } else {
                //IF ALL INFORMATION WAS INSERTED AND ALL ARE WITH THE CORRECT FORMAT
                this.setState({
                    reservatorio: {
                        case: 12,
                        volume: this.state.reservatorio.other.volume,
                        Bb: this.state.reservatorio.other.Bb,
                        Cc: this.state.reservatorio.other.Cc,
                        Ee: this.state.reservatorio.other.Ee,
                        txt: `${this.state.reservatorio.other.volume} L, B = ${this.state.reservatorio.other.Bb}m / C = ${this.state.reservatorio.other.Cc}m / E = ${this.state.reservatorio.other.Ee}m`,
                        saveDb: true,
                        other: {
                            volume: this.state.reservatorio.other.volume,
                            Bb: this.state.reservatorio.other.Bb,
                            Cc: this.state.reservatorio.other.Cc,
                            Ee: this.state.reservatorio.other.Ee,
                        },
                    },
                    modalCxConfig: !this.state.modalCxConfig,
                    modalSaveCxConfig: false
                })
            }
        }
    }

///////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// USER INFORMATION MODAL ////////////////////////////////
    toggleModalInformacao = () => {
        /*
         * Function responsible for opening modal of User Information searching for them in DB 
        */
        $('#sidebar').toggleClass('active');
        this.setState({
            modalInformacao: !this.state.modalInformacao,
            feedbackInputInfoPassword: {
                valid: false,
                invalid: false
            }
        });
        if (!this.state.modalInformacao) {//quando a modal estiver aberta
            try {
                api.post("/users/userinformation", { sending: { acao: 1 } })
                    .then(response => {
                        if (response.data) {
                            this.setState({
                                modalInformacao: true,
                                informacao: {
                                    fullName: response.data.fullname,
                                    addres: response.data.addres
                                },
                                configuracao: {
                                    tempoAquisicao: response.data.aquisicao,
                                    aMax: response.data.aMax,
                                    aMin: response.data.aMin
                                },
                                reservatorio: {
                                    case: this.state.reservatorio.case,
                                    volume: 500,
                                    Bb: response.data.cxB,
                                    Cc: response.data.cxX,
                                    Ee: response.data.cxE,
                                    txt: response.data.cxTxt,
                                }
                            });
                        } else {
                            alert("Ops, Ocorreu algum erro, tente novamente mais tarde!")
                        }
                    })
                    .catch((err) => {
                        alert("Ops, Ocorreu algum erro, tente novamente mais tarde!")
                    })
            } catch (err) {
                alert("Ops, Ocorreu algum erro, tente novamente mais tarde!")
            }
        } else {
            this.setState({
                modalInformacao: false,
            });
        }
    }

/****************************************************************************************/    
    btnModalInformacao = () => {
        /*
         *  Function executed when clicking on btn of modal of Information 
        */
        if (this.state.modalInput.name !== undefined || this.state.modalInput.address !== undefined || this.state.modalInput.password !== undefined) {
            //IF SOME INFORMATION WAS INSERTED OPEN A SECOND MODAL ASKING IF YOU REALLY WANT TO UPDATE
            if (!this.state.feedbackInputInfoPassword.invalid) {
                //IF THE LENGTH OF THE PASSWORD IS INVALIDED
                this.setState({
                    modalAlertInformacao: !this.state.modalAlertInformacao
                })
            }

        } else {
            //IF NO OPTION WAS FILLED ONLY CLOSE MODAL
            this.setState({
                modalInformacao: !this.state.modalInformacao
            });
        }
    }

/****************************************************************************************/    
    toggleModalAlertInformacao = () => {
        /*
         * SUB MODAL WITH ALERT MESSAGE THAT THE INFORMATION WILL BE CHANGED 
        */
        this.setState({
            modalAlertInformacao: !this.state.modalAlertInformacao,
            modalSaveInformacao: true,
            modalInput: {
                name: undefined,
                address: undefined,
                password: undefined
            }
        })
    }

/****************************************************************************************/    
    toggleSaveInformacoes = () => {
        /*
         * TO PRICE SAVE IN SUBMODAL SEND INFORMATION TO THE DATABASE 
        */
        this.setState({
            modalAlertInformacao: !this.state.modalAlertInformacao,
            modalSaveInformacao: true
        })
        let sending = {
            acao: 2,
            password: this.state.modalInput.password,
            address: this.state.modalInput.address,
            name: this.state.modalInput.name
        }
        try {
            api.post("/users/userinformation", { sending }).then(response => {
                if (response.data) {
                    alert("Atualização Realizada com Sucesso")
                } else {
                    alert("Ops1, ocorreu um erro inesperado, tente novamente mais tarde")
                }
            }).catch((err) => {
                alert("Ops2, ocorreu um erro inesperado, tente novamente mais tarde")
            })
        } catch (err) {
            alert("Ops3, ocorreu um erro inesperado, tente novamente mais tarde")
        }
    }

/****************************************************************************************/    
    compareCurrentTime = (createdAt) => {
        /*
         * This functions compare the current time to the time of last aquisition in data base 
        */
        let dateNow = new Date();
        
        var currentTime = {
            Month: dateNow.getMonth() + 1,
            Day: dateNow.getDate(),
            Hour: dateNow.getHours(),
        }
        var DbTime = {
            Year: createdAt.substring(4, 0),
            Month: createdAt.substring(7, 5),
            Day: createdAt.substring(10, 8),
            Hour: createdAt.substring(13, 11) - 3,
            Minut: createdAt.substring(16, 14)
        }

        if (currentTime.Month === parseInt(DbTime.Month)) {
            if (currentTime.Day === parseInt(DbTime.Day)) {
                if ((currentTime.Hour - DbTime.Hour) <= 1) {

                    this.setState({
                        verifyWifiError: false,
                    })
                    return
                }
            } else {

                if ((DbTime.Hour - currentTime.Hour) >= 21 || ((DbTime.Hour - currentTime.Hour) <= -21)) {

                    this.setState({
                        verifyWifiError: false,
                    })
                    return
                }
            }
        }
        this.setState({ verifyWifiError: true })
    }

/****************************************************************************************/    
    barGraphic = (response) => {
        /*
         * This functions show for user system informations: Level, Alerts Messagens, Chart ...
        */
        this.compareCurrentTime(response.createdAt)
        this.attPumpTxt();

        if (!this.state.verifyWifiError) {
            //SYSTEM OPERAING IN NORMAL CONDITIONS                  
            if (response.nivel >= 60) {
                this.setState({
                    //Configure the Graphic
                    chartData: {
                        datasets: [{
                            label: 'Nível da Caixa Principal',
                            data: [response.nivel],
                            backgroundColor: [
                                'rgba(54, 162, 235, 1)',
                            ]
                        }]
                    },
                    //User Alert configuration
                    UserInfoAlert: {
                        message: "O Sistema esta em funcionamento normal!",
                        color: "success",
                        nivel: response.nivel
                    },
                    status: {
                        mounted: true,
                    }
                })
            }
            //CONCERNING LEVEL AS THE SYSTEM IS NOT STILL CRITICAL
            else if (response.nivel < 60 && response.nivel >= 50) {
                this.setState({
                    //Configure the Graphic
                    chartData: {
                        datasets: [{
                            label: 'Nível da Caixa Principal',
                            data: [response.nivel],
                            backgroundColor: [
                                'rgba(54, 162, 235, 1)',
                            ]
                        }]
                    },
                    //User Alert configuration
                    UserInfoAlert: {
                        message: "O nivel esta abaixando. Fique atento e economize!",
                        color: "warning",
                        nivel: response.nivel
                    },
                    status: {
                        mounted: true,
                        aux2: !this.state.status.aux2
                    }
                })
            }
            //SYSTEM IN CRITICAL STATE
            else {
                this.setState({
                    //Configure the Graphic
                    chartData: {
                        datasets: [{
                            label: 'Nível da Caixa Principal',
                            data: [response.nivel],
                            backgroundColor: [
                                'rgba(54, 162, 235, 1)',
                            ]
                        }]
                    },
                    //User Alert configuration
                    UserInfoAlert: {
                        message: "ESTADO CRÍTICO, FAVOR ECONOMIZE O MÁXIMO POSSÍVEL",
                        color: "danger",
                        nivel: response.nivel
                    },
                    status: {
                        mounted: true,
                    }
                })
                this.sendNotificate(`Nível em ${this.state.UserInfoAlert.nivel}%, acesse a Dashbord e monitore seu sistema. Fique Atento!`);
            }
        }//End IF Time
        else {
            //IF THE SYSTEM IS MORE THAN 2HS WITHOUT RECEIVING INFORMATION
            ////////////////////////////////////////////////////////////
            if (response.nivel > 60) {
                this.setState({
                    chartData: {
                        datasets: [{
                            label: 'Nível da Caixa Principal',
                            data: [response.nivel],
                            backgroundColor: [
                                'rgba(54, 162, 235, 1)',
                            ]
                        }]
                    },
                    UserInfoAlert: {
                        message: "ATENÇÃO! Ultima Leitura Recebida á Mais De 2Hs, Verifique a Rede Wifi",
                        color: "warning",
                        nivel: response.nivel
                    },
                    status: {
                        mounted: true,
                    }
                })
            }
            else if (response.nivel < 60 && response.nivel >= 50) {
                this.setState({
                    chartData: {
                        datasets: [{
                            label: 'Nível da Caixa Principal',
                            data: [response.nivel],
                            backgroundColor: [
                                'rgba(54, 162, 235, 1)',
                            ]
                        }]
                    },
                    UserInfoAlert: {
                        message: "ATENÇÃO! Ultima Leitura Recebida á Mais De 2Hs, Verifique a Rede Wifi",
                        color: "warning",
                        nivel: response.nivel
                    },
                    status: {
                        mounted: true,
                    }
                })
            }
            else {
                this.setState({
                    chartData: {
                        datasets: [{
                            label: 'Nível da Caixa Principal',
                            data: [response.nivel],
                            backgroundColor: [
                                'rgba(54, 162, 235, 1)',
                            ]
                        }]
                    },
                    UserInfoAlert: {
                        message: "ATENÇÃO! Ultima Leitura Recebida á Mais De 2Hs, Verifique a Rede Wifi",
                        color: "danger",
                        nivel: response.nivel
                    },
                    status: {
                        mounted: true,
                    }
                })
                this.sendNotificate(`Nível em ${this.state.UserInfoAlert.nivel}%. Possivel falha na conexão WiFi. Acesse a Dashbord e monitore seu sistema. Fique Atento!`);
            }
        }//End Else
    }

/****************************************************************************************/    
    WebSocket = () => {
        /*
         * This function connect the UI with WebSocket server 
        */
        socketIO.on("gateway", response => {
            if(this.state.userId === response.userId){
                this.barGraphic(response);

                this.setState({
                    isPumpConfigured: response.isPumpConfigured,
                    isPumpBlocked: response.isPumpBlocked
                })
            }

        })

    }
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// UPGRADING ALERT GRAPHICS AND MESSAGES ///////////////////
    graphicAtt = () => {
        /*
         * This function called barGraphic afther making a request, and pass the request response to,
         * barGraphic, its necessary becouse barGraphic atualization occurs in  two type of requisitions
         */
        try {
            api.post('/users/request', { acao: 1 })
                .then(response => {
                    this.barGraphic(response.data)
                })
                .catch(function (error) {
                })
        } catch (err) {
            alert("Ops, Ocorreu algum erro, tente novamente mais tarde!")
        }
    }

/****************************************************************************************/    
    voidFunction = () => { }

/////////////////////////////////////////// PUMP CONFIGURATE ////////////////////////////
    pumpConfiguration = () => {
        /*
         * This function render button and change your colocar in the some cases
         */
        if (this.state.isPumpConfigured === 0 || this.state.isPumpBlocked === 1) {
            return (
                <Row>
                    <Col className="text-right" md={11}>
                        <Button onClick={this.togglePumpConfigModal} outline color="warning">
                            ?
                        </Button>
                    </Col>
                </Row>
            )
        }
        else {
            return (
                <Row>
                    <Col className="text-right" md={11}>
                        <Button onClick={this.togglePumpConfigModal} outline color="success">
                            ?
                        </Button>
                    </Col>
                </Row>
            )
        }
    }

/****************************************************************************************/    
    pumpSituation = () => {
        /*
         * This function load Pump options to the user configurate system 
         */
        //If there is no pump configured by the user in the system
        if (this.state.isPumpConfigured === 0) {
            return (
                <div>
                    <FormGroup>
                        <Label for="exampleSelect">Configurações habilitadas</Label>
                        <Input onChange={this.handlePumpConfig} type="select" name="select" id="exampleSelect">
                            <option>...</option>
                            <option>1 - Habilitar Bomba</option>
                        </Input>
                    </FormGroup>
                </div>
            );
        }
        //if the user has configured a pump in the system
        else {
            //se a bomba estiver bloqueada
            if (this.state.isPumpBlocked === 1) {
                return (
                    <div>
                        <FormGroup>
                            <Label for="exampleSelect">Configurações habilitadas</Label>
                            <Input onChange={this.handlePumpConfig} type="select" name="select" id="exampleSelect">
                                <option>...</option>
                                <option>1 - Desablitar a Bomba</option>
                                <option>2 - Desbloquear a Bomba</option>
                            </Input>
                        </FormGroup>
                    </div>
                );
            }
            //if the pump is running normally
            else {
                return (
                    <div>
                        <FormGroup>
                            <Label for="exampleSelect">Configurações habilitadas</Label>
                            <Input onChange={this.handlePumpConfig} type="select" name="select" id="exampleSelect">
                                <option>...</option>
                                <option>1 - Desablitar a Bomba</option>
                            </Input>
                        </FormGroup>
                    </div>
                );
            }
        }

    }

/****************************************************************************************/    
    togglePumpConfigModal = () => {
        /*
         * Open modal configure Pump states 
         */
        //If the user did not configure a pump in the system
        if (this.state.isPumpConfigured === 0) {
            this.setState({
                modalPumpConfig: !this.state.modalPumpConfig,
                pumpTxt: 'Bomba não configurada'
            })
        }
        //If the user has configured a pump in the system
        else {
            //If the pump is blocked
            if (this.state.isPumpBlocked === 1) {
                this.setState({
                    modalPumpConfig: !this.state.modalPumpConfig,
                    pumpTxt: 'Bomba bloqueada, verifique por qual motivo antes de desbloquea-la'
                })
            }
            //If the pump is operating normally
            else {
                this.setState({
                    modalPumpConfig: !this.state.modalPumpConfig,
                    pumpTxt: 'Bomba configurada e em funcionamento normal'
                })
            }
        }

    }

/****************************************************************************************/    
    togglePumpAlertConfig = () => {
        /*
         * Open modal asking to user  if realy do this change.
         */
        if (this.state.isPumpBlockedHandle === undefined && this.state.isPumpConfiguredHandle === undefined) {
            this.setState({
                modalPumpConfig: !this.state.modalPumpConfig
            })
        }
        else {
            this.setState({
                modalPumpAlertConfig: !this.state.modalPumpAlertConfig,
                modalSaveConfig: true
            })
        }
    }

/****************************************************************************************/    
    togglePumpAlertConfigSaveBtn = () => {
        /*
         * Function send database the Pump configuration 
         */
        try {
            let sending = {
                acao: 3,
                isPumpConfigured: parseInt(this.state.isPumpConfiguredHandle),
                isPumpBlocked: parseInt(this.state.isPumpBlockedHandle),
                isPumpConcerted: this.state.isPumpConcerted
            }
            api.post("/users/userinformation", { sending }).then(response => {
                if (response.data) {
                    if (this.state.isPumpConfiguredHandle === 0) {
                        this.setState({
                            pumpTxt: 'Bomba não configurada'
                        })
                    }
                    //If the user has configured a pump in the system
                    else {
                        //If the pump is blocked
                        if (this.state.isPumpBlockedHandle === 1) {
                            this.setState({
                                pumpTxt: 'Bomba bloqueada, verifique por qual motivo antes de desbloquea-la'
                            })
                        }
                        //If the pump is operating normally
                        else {
                            this.setState({
                                pumpTxt: 'Bomba configurada e em funcionamento normal'
                            })
                        }
                    }
                    this.setState({
                        modalPumpAlertConfig: !this.state.modalPumpAlertConfig,
                        modalSaveConfig: false,
                        modalPumpConfig: !this.state.modalPumpConfig,
                        isPumpBlocked: parseInt(this.stateisPumpBlockedHandle),
                        isPumpConfigured: parseInt(this.state.isPumpConfiguredHandle),
                    })
                    alert('Configurações da bomba salvas!');
                } else {
                    alert("Ops1, ocorreu um erro inesperado, tente novamente mais tarde")
                }
            }).catch((err) => {
                alert("Ops2, ocorreu um erro inesperado, tente novamente mais tarde")
            })
        } catch (err) {
        }
    }

/////////////////////////////////////////// HISTORY LEVELS //////////////////////////////
    toggleHistoryReading = () => {
        $('#sidebar').toggleClass('active');
        this.setState({
            modalHistoryReading: !this.state.modalHistoryReading
        })
        this.graphicAllNiveis();
    }

/****************************************************************************************/    
    graphicAllNiveis = () => {
        /*
         * Request the Database All levels register relaassociated with the user
         */
        var createdAt = [];
        var nivels = [];
        try {
            api.post('/gateway/allniveis', { "": "" })
                .then(response => {
                    response.data.niveltables.map(nivel => {
                        createdAt.push(nivel.createdAt.substring(10, 8) + "/" + nivel.createdAt.substring(7, 5) + "-" + nivel.createdAt.substring(13, 11) + ":" + nivel.createdAt.substring(16, 14))
                        nivels.push(nivel.nivel)
                    })
                    this.setState({
                        chartModal: {
                            labels: createdAt,
                            datasets: [{
                                label: 'Nível da Reservatório Principal',
                                data: nivels,
                                backgroundColor: [
                                    'rgba(54, 162, 235, 1)',
                                ]
                            }]
                        }
                    })

                })
        }
        catch (err) {

        }
    }

/////////////////////////////////////////// PUSH NOTIFICATION /////////////////////////////
    sendNotificate = (body) => {
        /* 
        *Push Notificantion With Firebase, is dont work becouse google chrome stoped server worker
        *in mobile version
        */
       /*
        notificationPermission().then(token => {
            axios({
                method: 'POST',
                url: 'https://fcm.googleapis.com/fcm/send',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: "key="+firebaseAuthKey
                },
                data: {
                    notification: {
                        title: "Nível Alerta!",
                        body: body,
                        'click_action': dashboadURL+"/dashboard/",
                        icon: dashboadURL+"/icon.png"
                    },
                    to: token
                }
            })
        })
        */
        Push.create("Nível Alerta!", {
            body: body,
            icon: '/icon.png',
            onClick: function () {
                window.location.href = dashboadURL+"/dashboard/";
                this.close();
            }
        });
    }
    
//////////////////////////////////////////// RENDER METHOD ////////////////////////////////
    render() {
        if (!this.state.status.mounted) {
            return (
                <div>
                    <div className="container">
                        <div className="row mt-5 justify-content-sm-center">
                            <div className="col-sm-1 col-md-1 mt-5">
                                <div className="spinner">
                                    <MDSpinner color2 size={100} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
        return (

            <div>
                <div className="wrapper">
                    <nav id="sidebar">
                        <div className="sidebar-header">
                            <h3>Water Resource</h3>
                        </div>
                        <ul className="list-unstyled components">
                            <hr />
                            <li>
                                <a href="/dashboard" >Dashboard</a>
                            </li>

                            <hr />

                            <li>
                                <a href="#/" onClick={this.toggleModalConfig}>Configurações</a>
                            </li>

                            <hr />

                            <li>
                                <a href="#/" onClick={this.toggleModalInformacao}>Minhas informações</a>
                            </li>

                            <hr />

                            <li>
                                <a href="#/" onClick={this.toggleHistoryReading}>Histório de Leituras</a>
                            </li>
                        </ul>
                    </nav>


                    <div className="col-12">
                        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                            <div className="container-fluid">

                                <button type="button" id="sidebarCollapse" className="btn">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </button>
                                <button className="btn btn-dark d-inline-block d-lg-none ml-auto" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                                    <FontAwesomeIcon icon="bars" />
                                </button>

                                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                                    <ul className="nav navbar-nav ml-auto">
                                        <li className="active mr-3">
                                            <a className="nav-link" href="/">Home</a>
                                        </li>
                                        <li className="active">
                                            <a href="#/" className="nav-link" onClick={this.logout}>Sair</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </nav>
                        {this.pumpConfiguration()}
                        <h2 className="text-center">Sistema de Controle</h2>
                        <hr />

                        <div>
                            <Alert className="text-center text-bg" color={this.state.UserInfoAlert.color}>
                                <h2> Nível atual do reservatorio principal é de: {this.state.UserInfoAlert.nivel}%</h2>
                                <p>{this.state.UserInfoAlert.message}</p>
                                <p>Situação da Bomba: {this.state.pumpTxt}</p>
                            </Alert>
                        </div>

                        <div className="container">
                            <div className="row">
                                <div className="col-lg-12">
                                    <CardGroup>
                                        <div className="ml-lg-5 mr-lg-5 col-sm-6 col-md-6 col-lg-5 " sm="5">
                                            <Card style={{ paddingBottom: 5 }}>
                                                <CardBody>
                                                    <CardTitle className="text-center"><h3>Nível reservatorio principal</h3></CardTitle>
                                                    <Bar
                                                        width={54}
                                                        height={49}
                                                        data={this.state.chartData}
                                                        options={{
                                                            title: {
                                                                display: true
                                                            }
                                                        }}
                                                    />
                                                </CardBody>
                                            </Card>
                                        </div>

                                        <div className="ml-lg-5 col-sm-6 col-md-6 col-lg-5 " sm="5">
                                            <Card>
                                                <CardBody>
                                                    <CardTitle className="text-center"><h3>Previsão do tempo</h3></CardTitle>
                                                    <div className="text-center">

                                                        <iframe title="This is a unique title" allowtransparency="true" marginWidth="0" marginHeight="0" hspace="0" vspace="0" frameBorder="0" scrolling="no" src="https://www.cptec.inpe.br/widget/widget.php?p=2034&w=v&c=748ccc&f=ffffff" height="352" width="192"></iframe><noscript><a href="http://www.cptec.inpe.br/cidades/tempo/2034">Formiga/MG</a> oferecido por <a href="http://www.cptec.inpe.br">CPTEC/INPE</a></noscript>

                                                    </div>
                                                </CardBody>
                                            </Card>
                                        </div>
                                    </CardGroup>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>



                <div >
                    <Modal isOpen={this.state.modalConfig} toggle={this.toggleModalConfig} >
                        <ModalHeader toggle={this.toggleModalConfig}>
                            Configurações do Sistema
                        </ModalHeader>
                        <ModalBody >
                            <FormGroup>
                                <Label for="tempoAquisicao">Intervalo entre as Aquisições [minutos]</Label>
                                <Input onChange={this.handleTimeAquisition} invalid={this.state.feedbackInputConfigAquisicao.invalid} placeholder={`Atual: ${this.state.configuracao.tempoAquisicao} min`} />
                                <FormFeedback invalid>Formato Invalido</FormFeedback>
                                <FormText>Insira apenas numero inteiro</FormText>
                            </FormGroup>


                            <Row >
                                <Col md={6}>
                                    <FormGroup>
                                        <Label for='aMaxima'>Amortização Maxima</Label>
                                        <Input onChange={this.handleaMax} invalid={this.state.feedbackInputConfigAmax.invalid} type='text' name='amortizacaoMax' id='aMaxima' placeholder={`Atual: ${this.state.configuracao.aMax}`} />
                                        <FormFeedback invalid>Formato Invalido</FormFeedback>
                                        <FormText>Insira apenas numero inteiro</FormText>
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label for='aMinima'>Amortização Minima</Label>
                                        <Input onChange={this.handleaMin} invalid={this.state.feedbackInputConfigAmin.invalid} type='text' name='amortizacaoMin' id='aMinima' placeholder={`Atual: ${this.state.configuracao.aMin}`} />
                                        <FormFeedback invalid>Formato Invalido</FormFeedback>
                                        <FormText>Insira apenas numero {'<'} 1 </FormText>
                                    </FormGroup>
                                </Col>
                            </Row>

                            <FormGroup>
                                <Alert color='secondary' >
                                    <p>Dimensão configurada do reservatorio:</p>
                                    <p>{`${this.state.reservatorio.txt}`}</p>
                                </Alert>
                                <Label for='reservatorios'>Atualizar volume do Reservatorio</Label>
                                <Input onChange={this.handleReservatorio} type='select' name='select' id='reservatorios'>
                                    <option>1 - FORTLEV 100 Litros</option>
                                    <option>2 - FORTLEV 150 Litros</option>
                                    <option>3 - FORTLEV 250 Litros</option>
                                    <option>4 - FORTLEV 310 Litros</option>
                                    <option>5 - FORTLEV 500 Litros</option>
                                    <option>6 - FORTLEV 750 Litros</option>
                                    <option>7 - FORTLEV 1000 Litros</option>
                                    <option>8 - FORTLEV 1500 Litros</option>
                                    <option>9 - FORTLEV 2000 Litros</option>
                                    <option>10 - FORTLEV 3000 Litros</option>
                                    <option>11 - FORTLEV 5000 Litros</option>
                                    <option>12 - Outros...</option>
                                </Input>
                            </FormGroup>

                            <Modal isOpen={this.state.modalCxConfig} toggle={this.toggleCloseCxConfig} onClosed={this.state.modalSaveCxConfig ? this.toggleModalCxConfig : this.voidFunction}>
                                <ModalHeader>Configure as dimensoes do Reservatorio</ModalHeader>
                                <ModalBody>
                                    <FormGroup>
                                        <Label for='volume'>Volume [L]</Label>
                                        <Input onChange={this.handleTankVolume} invalid={this.state.feedbackInputConfigVolume.invalid} type='text' name='Volume' id='volume'></Input>
                                        <FormFeedback invalid>Formato Invalido - Para salvar preencha todos os campos</FormFeedback>
                                        <FormText>Insira apenas numero Ex: 2, 1.03</FormText>
                                    </FormGroup>

                                    <FormGroup>
                                        <Label for='B'>B [m]</Label>
                                        <Input onChange={this.handleTankB} invalid={this.state.feedbackInputConfigBb.invalid} type='text' name='writeB' id='B'></Input>
                                        <FormFeedback invalid>Formato Invalido - Para salvar preencha todos os campos</FormFeedback>
                                        <FormText>Insira apenas numero Ex: 2, 1.03</FormText>
                                    </FormGroup>

                                    <FormGroup>
                                        <Label for='D'>D [m]</Label>
                                        <Input onChange={this.handleTankD} invalid={this.state.feedbackInputConfigCc.invalid} type='text' name='writeC' id='D'></Input>
                                        <FormFeedback invalid>Formato Invalido - Para salvar preencha todos os campos</FormFeedback>
                                        <FormText>Insira apenas numero Ex: 2, 1.03</FormText>
                                    </FormGroup>

                                    <FormGroup>
                                        <Label for='E'>E [m]</Label>
                                        <Input onChange={this.handleTankE} invalid={this.state.feedbackInputConfigEe.invalid} type='text' name='writeE' id='E'></Input>
                                        <FormFeedback invalid>Formato Invalido - Para salvar preencha todos os campos</FormFeedback>
                                        <FormText>Insira apenas numero Ex: 2, 1.03</FormText>
                                    </FormGroup>
                                    <CardImg className="mt-5 ml-2" src={require('../../images/caixa.jpg')} />
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="primary" onClick={this.toggleCloseCxConfig}>Voltar</Button>{' '}
                                    <Button color="secondary" onClick={this.toggleSaveBxConfig}>Salvar</Button>
                                </ModalFooter>
                            </Modal>

                            <Modal isOpen={this.state.modalAlertConfig} toggle={this.toggleModalAlertConfig} onClosed={this.state.modalSaveConfig ? this.toggleModalConfig : this.voidFunction}>
                                <ModalHeader>Alerta!</ModalHeader>
                                <ModalBody>Deseja Salvar as alterações?</ModalBody>
                                <ModalFooter>
                                    <Button color="primary" onClick={this.toggleModalAlertConfig}>Voltar</Button>{' '}
                                    <Button color="secondary" onClick={this.toggleSaveConfig}>Salvar</Button>
                                </ModalFooter>
                            </Modal>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="secondary" onClick={this.btnModalConfig}>Salvar Alterações</Button>
                        </ModalFooter>
                    </Modal>
                </div>

                <div>
                    <Modal isOpen={this.state.modalInformacao} toggle={this.toggleModalInformacao} className={this.props.className}>
                        <ModalHeader toggle={this.toggleModalInformacao} className="text-center">Informações Pessoais</ModalHeader>
                        <ModalBody>

                            <Modal isOpen={this.state.modalAlertInformacao} toggle={this.toggleModalAlertInformacao} onClosed={this.state.modalSaveInformacao ? this.toggleModalInformacao : this.voidFunction}>
                                <ModalHeader>Alerta!</ModalHeader>
                                <ModalBody>Deseja Salvar as alterações?</ModalBody>
                                <ModalFooter>
                                    <Button color="primary" onClick={this.toggleModalAlertInformacao}>Voltar</Button>{' '}
                                    <Button color="secondary" onClick={this.toggleSaveInformacoes}>Salvar</Button>
                                </ModalFooter>
                            </Modal>

                            <FormGroup>
                                <Label for="FullName">Nome Registrado</Label>
                                <Input ref="nome" onChange={this.handleName} type="text" name="fullname" id="FullName" placeholder={`${this.state.informacao.fullName}`} />
                                <FormText></FormText>
                            </FormGroup>

                            <FormGroup>
                                <Label for="Address">Endereço Registrado</Label>
                                <Input ref="endereco" onChange={this.handleAddress} type="text" name="address" id="Address" placeholder={`${this.state.informacao.addres}`} />
                                <FormText></FormText>
                            </FormGroup>

                            <FormGroup>
                                <Label for="Password">Senha</Label>
                                <Input ref="senha" onChange={this.handlePassword} valid={this.state.feedbackInputInfoPassword.valid} invalid={this.state.feedbackInputInfoPassword.invalid} type="text" name="password" id="Password" placeholder={`**************`} />
                                <FormFeedback invalid>A nova senha deve conter no minimo 6 caracters</FormFeedback>
                                <FormText></FormText>
                            </FormGroup>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="secondary" onClick={this.btnModalInformacao}>Salvar Alterações</Button>
                        </ModalFooter>
                    </Modal>
                </div>

                <div>
                    <Modal isOpen={this.state.modalPumpConfig} toggle={this.togglePumpConfigModal} className={this.props.className}>
                        <ModalHeader toggle={this.togglePumpConfigModal}>Configuração da Bomba</ModalHeader>
                        <ModalBody>
                            <Alert color='secondary'>
                                <h3>Situação da Bomba:</h3>
                                <p>{this.state.pumpTxt}</p>
                            </Alert>
                            {this.pumpSituation()}
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onClick={this.togglePumpConfigModal}>
                                Cancelar
                                </Button>
                            <Button color="secondary" onClick={this.togglePumpAlertConfig}>
                                Salvar
                                </Button>

                            <Modal isOpen={this.state.modalPumpAlertConfig} toggle={this.togglePumpAlertConfig} onClosed={this.state.modalPumpSave ? this.togglePumpConfigModal : this.voidFunction}>
                                <ModalHeader>Alerta!</ModalHeader>
                                <ModalBody>Deseja Salvar as alterações?</ModalBody>
                                <ModalFooter>
                                    <Button color="primary" onClick={this.togglePumpAlertConfig}>Voltar</Button>{' '}
                                    <Button color="secondary" onClick={this.togglePumpAlertConfigSaveBtn}>Salvar</Button>
                                </ModalFooter>
                            </Modal>

                        </ModalFooter>
                    </Modal>
                </div>

                <div>
                    <Modal isOpen={this.state.modalHistoryReading} toggle={this.toggleHistoryReading}>
                        <ModalHeader toggle={this.toggleHistoryReading}>
                            Histórico de Leituras
                        </ModalHeader>
                        <ModalBody>
                            <CardTitle className="text-center"><h3>Nível reservatório principal</h3></CardTitle>
                            <Line
                                width={100}
                                height={100}
                                data={this.state.chartModal}
                                options={{
                                    title: {
                                        display: true
                                    }
                                }}
                            />
                        </ModalBody>
                    </Modal>
                </div>

            </div>
        );
    }
}

export default Dashboard