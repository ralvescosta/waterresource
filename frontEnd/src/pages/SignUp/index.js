import React, { Component } from "react";
import { Link} from "react-router-dom";


import 'bootstrap/dist/css/bootstrap.min.css';
import "./style.css";

import {Col, Row, Alert, Modal, ModalHeader, ModalBody, ModalFooter, Button, Card, CardHeader, CardBody, CardFooter, FormGroup, Label, Input, FormFeedback, FormText} from 'reactstrap';
import MDSpinner from "react-md-spinner";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import api from "../../services/api";
import { hrefURL } from "../../environment"



class SignUp extends Component {
    constructor(props, context){
        super(props, context);
        this.handleGetInputEmail = this.handleGetInputEmail.bind(this);
        this.handleGetInputPassword = this.handleGetInputPassword.bind(this);
        this.handleGetFullName=this.handleGetFullName.bind(this);
        this.handleGetAddress=this.handleGetAddress.bind(this);
        this.register=this.register.bind(this)
        this.toogleModalErrorRegister = this.toogleModalErrorRegister.bind(this);
        this.toogleModalSucessRegister = this.toogleModalSucessRegister.bind(this);
        this.state = {
            email:{
                valido:false,
                invalido:false,
                email:undefined
            },
            password:{
                valido:false,
                invalido:false,
                password:undefined
            },
            fullname:undefined,
            address:undefined,
            error: {
                menssage:"",
                alertColor:"",
                modalError:false,
            },
            status:{
                mounted: false,
                signupbtn:false
            },
            modalError:false,
            modalSucess:false,
        };
    }//END CONSTRUCTOR
    //Função responsavel por tratar as limitações de entrada de email retornando ao usuario visualmente
    handleGetInputEmail = (e) => {
        let chekemail = e.target.value;
        if(chekemail.indexOf('@')!== -1 && (chekemail.substring(chekemail.length,chekemail.length-4)==='.com' || chekemail.substring(chekemail.length,chekemail.length-7)==='.com.br')){
            if(chekemail.substring(chekemail.indexOf('@')+1,chekemail.indexOf('.')+1)!=='.'){
                this.setState({
                    email:{
                        valido:true,
                        invalido:false,
                        email:chekemail
                    }
                })
            }else{
                this.setState({
                    email:{
                        valido:false,
                        invalido:true,
                        email:undefined
                    }
                })
            }
        }else{
            this.setState({
                email:{
                    valido:false,
                    invalido:true,
                    email:undefined
                }
            })
        }     
    }
    //Função responsavel por tratar as limitações de entrada de password retornando ao usuario visualmente
    handleGetInputPassword = (e) => {
        let passwordnaw = e.target.value
        if(passwordnaw !==""){
            if(passwordnaw.length >= 6){
                this.setState({ 
                    password: {
                        valido:true,
                        invalido:false,
                        password:passwordnaw
                    }
                });
            }else{
                this.setState({ 
                    password: {
                        valido:false,
                        invalido:true,
                        password:undefined
                    }
                });
            }
        }  
    }
    //Função responsavel por pegar os valores digitados em FullName
    handleGetFullName = (e) => {
        this.setState({
            fullname: e.target.value
        })
    }
    //Função responvel por pegar os valores digitados em Address
    handleGetAddress(e){
        this.setState({
            address: e.target.value
        })
    }
    //Função que verifica se todos os campos foram preenchidos e envia o formulario
    //POSSIVELMENTE RENDERIZA UMA TELA DE LOADING
    register= async e => {
        e.preventDefault();
        //TODOS OS CAMPOS FORAM PREENCHIDOS CORRETAMENTE
        if(this.state.email.email!==undefined && this.state.password.password!==undefined && this.state.fullname!==undefined && this.state.address!==undefined){
            let {fullname, address} =this.state
            let email = this.state.email.email
            let password = this.state.password.password
            this.setState({
                status:{
                    mounted: false
                }
            })
            try {
                await api.post("/users/signup", { fullname , address, email , password});
                this.setState({
                    status:{
                        mounted: true
                    }
                })
                this.toogleModalSucessRegister()
            } catch (err) {
                this.setState({
                    status:{
                        mounted: true
                    }
                })
                this.toogleModalErrorRegister()
            }
        //QUANDO O USUARIO INFORMA SENHA OU EMAIL INVALIDO SERA ENVIADO UMA CX DE ALERTA
        //A MESMA É CONFIGURADA NAS CONDIÇOES ABAIXO
        }else{
            if(this.state.email.invalido && this.state.password.valido){//se email invalido e password valido
                this.setState({  
                    error:{
                        menssage: "Email Digitado esta Invalido, Favor Digite um Email Valido!",
                        alertColor:"danger",
                    }  
                })
                
            }
            else if(this.state.email.valido && this.state.password.invalido){//se email valido e password invalido
                this.setState({
                    error:{
                        menssage:"Senha Digitada esta Invalida, Favor Digite uma Senha Valida!",
                        alertColor:"danger",
                    }
                })
            
            }else if(this.state.email.invalido && this.state.password.invalido){
                this.setState({
                    error:{
                        menssage:"Senha e Email Digitados estão Invalidos, Favor Digite novamente!",
                        alertColor:"danger",
                    }
                })
                
            }
            else if(this.state.fullname!==undefined){
                this.setState({
                    error:{
                        menssage:"Preencha o Nome Completo!",
                        alertColor:"danger",
                    }
                })
               
            }
            else if(this.state.address!==undefined){
                this.setState({
                    error:{
                        menssage:"Preencha o Endereço!",
                        alertColor:"danger",
                    }
                })
               
            }else{
                this.setState({
                    error:{
                        menssage:"Preencha todos os campos!",
                        alertColor:"danger"
                    }
                })
              
            }
        }
    }
    toogleModalErrorRegister = () => {
        this.setState({
            modalError: !this.state.modalError
        });
    }
    toogleModalSucessRegister = () => {
        this.setState({
            modalSucess: !this.state.modalSucess
        })
    }
    componentDidMount = () => {
        this.setState({
            status:{
                mounted: true
            }
        })
    }

    render() {
        if(!this.state.status.mounted){
            return(
                <div>
                    <div className="container">
                        <div className="row mt-5 justify-content-sm-center">
                            <div className="col-sm-1 col-md-1 mt-5">
                                <MDSpinner size={100}/> 
                            </div>
                        </div> 
                    </div>    
                </div>     
            )        
        }
      return (
        
        <div className="bg">
            <div className="container">
                <div className="row justify-content-sm-center mt-3">
                    <div className="col-sm-6 col-md-8">
                    <Card className="" style={{background: '#EAE5E5'}}>
                        <CardHeader className="text-center"><FontAwesomeIcon icon="user-plus" size="6x"/></CardHeader>
                        <CardBody>
                        <Alert color={this.state.error.alertColor}>
                            {this.state.error.menssage}
                        </Alert>
                        <Row form>
                            <Col sm={6}>
                                <FormGroup>
                                    <Label for="FullName"><FontAwesomeIcon icon="laugh"/> Nome Completo</Label>
                                        <Input onChange={this.handleGetFullName} type="text" name="fullname" id="FullName" placeholder="Nome Completo"/>
                                    <FormText>Digite seu nome completo Ex: Rafael Alves Costa</FormText>
                                </FormGroup>
                            </Col>

                            <Col sm={6}>
                                <FormGroup> 
                                    <Label for="Address"><FontAwesomeIcon icon="map-marked-alt"/> Endereço</Label>
                                        <Input onChange={this.handleGetAddress} type="text" name="address" id="Address" placeholder="Endereço Completo"/>
                                    <FormText>Digite seu enedereço completo Ex: Rua Tal, Bairro Tal, numero Tal, Cidade-UF</FormText>
                                </FormGroup>
                            </Col>
                        </Row>
                        <hr/>
                        <Row form>
                            <Col sm={6}>
                                <FormGroup>
                                    <Label for="Email"><FontAwesomeIcon icon="envelope"/> Email</Label>
                                        <Input valid={this.state.email.valido} invalid={this.state.email.invalido} onChange={this.handleGetInputEmail} type="email" name="email" id="Email" placeholder="Digite um email valido"/>
                                    <FormFeedback valid>Email Valido</FormFeedback>
                                    <FormFeedback invalid>Email Invalido</FormFeedback>
                                    <FormText>Digite seu email Ex: jaomaria@gmail.com</FormText>
                                </FormGroup>
                            </Col>

                            <Col sm={6}>
                                <FormGroup>
                                    <Label for="Password"><FontAwesomeIcon icon="key"/> Senha</Label>
                                        <Input valid={this.state.password.valido} invalid={this.state.password.invalido} onChange={this.handleGetInputPassword} type="password" name="password" id="Password" placeholder="Digite sua senha de acesso"/>
                                    <FormFeedback valid>Senha Valida</FormFeedback>
                                    <FormFeedback invalid>Senha Invalida</FormFeedback>
                                <FormText>A senha deve conter no minimo 6</FormText>
                                </FormGroup>
                            </Col>

                        </Row>
                        
                       
                        
                        <div className="mt-4">
                        <Link className="btn btn-outline-secondary btn-block" to='/signIn'>Você ja é um Usuario Cadastrado? Então Clique Aqui</Link>
                        </div>

                        <div className="mt-4">
                            <Link className="btn btn-outline-secondary btn-block" to='/'>Deseja voltar ao inicio? Então Clique Aqui</Link>
                        </div>
                        </CardBody>
                        <CardFooter className="text-center">
                            <Button className="btn btn-primary btn-lg btn-block" onClick={this.register}>Registrar-se</Button>
                        </CardFooter>
                    </Card>    

                    <Modal isOpen={this.state.modalError} toogle={this.toogleModalErrorRegister} className={this.props.className}>
                    <ModalHeader toogle={this.toogleModalErrorRegister}>Avisos!</ModalHeader>
                    <ModalBody>
                        Usuario já registrado, favor registre um novo email e uma nova uma nova senha ou entre em contato com nossa equipe!
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.toogleModalErrorRegister}>Cancelar</Button>
                    </ModalFooter>
                    </Modal>


                    <Modal isOpen={this.state.modalSucess} toogle={this.toogleModalSucessRegister} className={this.props.className}>
                    <ModalHeader toogle={this.toogleModalSucessRegister}>Registrado</ModalHeader>
                    <ModalBody>
                        Muito Obrigado por registrar-se. Seu Registro foi criado com sucesso, estamos preparando a interface para você, em alguns minutos você receberá um email de confirmação, confirme seu cadastro para poder utilizar todos os recursos da interface.
                    </ModalBody>
                    <ModalFooter>
                        <a className="btn btn-success" onClick={this.toogleModalSucessRegister} href={hrefURL} >Voltar</a>
                    </ModalFooter>
                    </Modal>


                    </div>
                </div>
            </div>
        </div>
      );
    }
  }
  
  export default SignUp;