import React, { Component } from "react";

import { Link  } from "react-router-dom";
import {Button, Alert , Card, CardHeader, CardBody, CardFooter, FormGroup, Label, Input, FormFeedback, FormText} from 'reactstrap';
import MDSpinner from "react-md-spinner";

import "./style.css";
import 'bootstrap/dist/css/bootstrap.min.css';

import api from "../../services/api";
import { login } from "../../services/auth";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
class SignIn extends Component {
    constructor(props, context){
        super(props, context);

        this.sigIn=this.sigIn.bind(this)
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
            error: {
                menssage:"",
                alertColor:"",
            },
            status:{
                mounted: false,
                signupbtn:false
            }
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
    //Função que verifica se todos os campos foram preenchidos e envia o formulario
    //POSSIVELMENTE RENDERIZA UMA TELA DE LOADING
    sigIn= async e => {
        e.preventDefault();
        let email = this.state.email.email
        let password = this.state.password.password
        //QUANDO AS INFORMAÇOES ENVIADAS ESTÃO CORRETAS
        if(this.state.email.email!==undefined && this.state.password.password!==undefined){
            this.setState({
                status:{
                    mounted: false
                }
            })
            try {
                const response = await api.post("/users/signin", { email, password });
                login(response.data.token);
                this.props.history.push("/dashboard");
            } catch (err) {
                this.setState({
                    error: {
                        menssage:"Houve um problema com o login, verifique suas credenciais",
                        alertColor:"danger",
                    },
                    status:{
                        mounted: true
                    },
                    password: {
                        valido:false,
                        invalido:false,
                        password:undefined
                    },
                    email:{
                        valido:false,
                        invalido:false,
                        email:undefined
                    }
                });
            }

        //QUANDO O USUARIO INFORMA SENHA OU EMAIL INVALIDO SERA ENVIADO UMA CX DE ALERTA
        //A MESMA É CONFIGURADA NAS CONDIÇOES ABAIXO
        }else{
            if(this.state.email.invalido && this.state.password.valido){//se email invalido e password valido
                this.setState({
                    
                    error:{
                        menssage: "Email Digitado esta Invalido, Favor Digite um Email Valido!",
                        alertColor:"danger"
                    }  
                })
            }
            else if(this.state.email.valido && this.state.password.invalido){//se email valido e password invalido
                this.setState({
                    error:{
                        menssage:"Senha Digitada esta Invalida, Favor Digite uma Senha Valida!",
                        alertColor:"danger"
                    }
                })
            }else{
                this.setState({
                    error:{
                        menssage:"Senha e Email Digitados estão Invalidos, Favor Digite novamente!",
                        alertColor:"danger"
                    }
                })
            }
        }
    }
    componentDidMount(){
        this.setState({
            status:{
                mounted: true
            }
        })
        if(localStorage.getItem("WR_IFMG")){
            localStorage.removeItem("WR_IFMG");
        }
    }

    render() {
        if(!this.state.status.mounted){
            return(
                <div>
                    <div className="container">
                        <div className="row mt-5 justify-content-sm-center">
                            <div className="spinner">
                                <MDSpinner size={100}/> 
                            </div>
                        </div> 
                    </div>    
                </div>     
            )        
        }
      return (
        <div>
            <div className="container">
                <div className="row mt-2 justify-content-sm-center">
                    <div className="col-sm-6 col-md-6">
                    <Card style={{background: '#EAE5E5'}}>
                        <CardHeader className="text-center"><FontAwesomeIcon icon="users" size="6x"/></CardHeader>
                        <CardBody>
                        <FormGroup>
                            <Alert color={this.state.error.alertColor}>
                                {this.state.error.menssage}
                            </Alert>
                            <Label for="Email"><FontAwesomeIcon icon="envelope"/> Email</Label>
                            <Input valid={this.state.email.valido} invalid={this.state.email.invalido} onChange={this.handleGetInputEmail} type="email" name="email" id="Email" placeholder="Digite um email valido"/>
                            <FormFeedback valid>Email Valido</FormFeedback>
                            <FormFeedback invalid>Email Invalido</FormFeedback>
                            <FormText>Digite seu email Ex: jaomaria@gmail.com</FormText>
                        </FormGroup>
                        <FormGroup>
                            <Label for="Password"><FontAwesomeIcon icon="key"/> Senha</Label>
                            <Input valid={this.state.password.valido} invalid={this.state.password.invalido} onChange={this.handleGetInputPassword} type="password" name="password" id="Password" placeholder="Digite sua senha de acesso"/>
                            <FormFeedback valid>Senha Valida</FormFeedback>
                            <FormFeedback invalid>Senha Invalida</FormFeedback>
                            <FormText>A senha deve conter no minimo 6</FormText>
                        </FormGroup>
                        <div className="mt-4">
                            <Link className="btn btn-outline-secondary btn-block" to='/signup'>Deseja realizar seu cadastro? Então Clique Aqui</Link>
                        </div>
                        <div className="mt-4">
                            <Link className="btn btn-outline-secondary btn-block" to='/'>Deseja voltar ao inicio? Então Clique Aqui</Link>
                        </div>
                        </CardBody>
                        <CardFooter className="text-center">
                            <Button className="btn btn-primary btn-lg btn-block" onClick={this.sigIn}>Entrar</Button>
                        </CardFooter>
                    </Card>
                    </div>
                </div>
            </div>
            {
                this.loadres
            }
        </div>
      );
    }
  }
  
  export default SignIn;