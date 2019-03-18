import React, { Component } from "react";
import MDSpinner from "react-md-spinner";
import "./style.css";

import { Button, Navbar, NavbarBrand, NavbarNav, NavItem, NavLink, NavbarToggler, Collapse, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Fa } from "mdbreact";
import { Card, CardHeader, CardBody, CardText, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class Produto extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            modal: false,
            isOpen: false,
            status: {
                mounted: false,

            }
        }
    }
    toggleCollapse = () => {
        this.setState({ isOpen: !this.state.isOpen });
    }
    toggle = () => {
        this.setState({
            modal: !this.state.modal
        });
    }
    componentDidMount() {
        this.setState({
            status: {
                mounted: true
            }
        })
    }
    redirecetWhatsApp = () => {
        window.location.href = "https://api.whatsapp.com/send?phone=5537999088146&text=Ola!%20Gostaria%20de%20saber%20mais%20sobre%20o%20projeto%20WaterResource.%20;)"
    }

    redirectGitHub = () => {
        window.location.href = "https://github.com/rafaelbodao/waterresource"
    }
    render() {
        if (!this.state.status.mounted) {
            return (
                <div>
                    <div className="container">
                        <div className="row mt-5 justify-content-sm-center">
                            <div className="col-sm-1 col-md-1 mt-5">
                                <MDSpinner color2 size={100} />
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
        return (
            <div>
                <Navbar className="fixed-top" color="bg-dark" dark expand="md" id="nav1">
                    <NavbarBrand>
                        <strong className="white-text">WatherResource</strong>
                    </NavbarBrand>
                    <NavbarToggler onClick={this.toggleCollapse} />
                    <Collapse id="navbarCollapse3" isOpen={this.state.isOpen} navbar>

                        <NavbarNav left>
                            <NavItem>
                                <NavLink className="ml-4" to="/">Home</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className="ml-4" to="/produto" href="#teste">Produto</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className="ml-4" to="#!" onClick={this.redirectGitHub}>Get started</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className="ml-4" to="/dashboard">Dashboard</NavLink>
                            </NavItem>
                        </NavbarNav>

                        <NavbarNav right>
                            <NavItem>

                                <NavLink className="waves-effect waves-light" to="#!" onClick={this.redirectGitHub}><Fa icon="github" /></NavLink>
                            </NavItem>

                            <NavItem>
                                <NavLink className="waves-effect waves-light" to="" onClick={this.redirecetWhatsApp} >
                                    <Fa icon="whatsapp" />
                                </NavLink>
                            </NavItem>

                            <NavItem>
                                <NavLink className="waves-effect waves-light" to="#!" onClick={this.toggle}><Fa icon="envelope" /></NavLink>
                            </NavItem>


                            <NavItem>
                                <Dropdown>
                                    <DropdownToggle nav caret>
                                        <Fa icon="user" />
                                    </DropdownToggle>
                                    <DropdownMenu className="dropdown-default" right>
                                        <DropdownItem href="/signin"><FontAwesomeIcon icon="tachometer-alt" /> Entrar</DropdownItem>
                                        <DropdownItem href="/signup"><FontAwesomeIcon icon="user-plus" />  Cadastrar</DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </NavItem>
                        </NavbarNav>
                    </Collapse>
                </Navbar>

                <div className="responsive-produto">
                    <div className="image-text">
                        <h3>Tecnologia aplicada</h3>
                        <h5>Entenda um pouco mais sobre o nosso sistema</h5>
                    </div>
                </div>

                <Card>
                    <CardHeader tag="h3" className="text-center" style={{ backgroundColor: "#CEA8F4" }}><h3>O que é o sistema Water Resource?</h3></CardHeader>
                    <CardBody>
                        <CardText className="text-justify" >
                            <h5>Water Resource é um projeto open source que tem como intuito apresentar para a comunidade de desenvolvimento um sistema de automação residencial utilizando o conceito de internet das coisas, integrando tecnologias modernas como: NodeJs, WebSocket, ReactJs, React-Native, ESP32 dentre outras. O objetivo da aplicação é apresentar uma forma de monitorar e controlar o nível de um reservatório de água, juntamente com uma interface ao usuário, onde o usuário poderá acompanhar em tempo real o estado do sistema e interagir com o sensor configurando alguns parâmetros de aquisição. O sistema foi projetado para fornecer ao usuário confiabilidade e facilidade de controle.</h5>
                        </CardText>
                    </CardBody>

                </Card>

                <Card className="mt-4">
                    <CardHeader tag="h3" className="text-center" style={{ backgroundColor: "#CEA8F4" }}><h3>Como este sistema funciona?</h3></CardHeader>
                    <CardBody>
                        <CardText className="text-justify">
                            <h5>
                                O monitoramento inicia-se com a aquisição do nível, esta é feita por meio de um sensor de nível automotivo e um ESP32, após a aquisição é enviado as informações para um servidor CRUD / Web Socket desenvolvido em ExpressJs, o servidor ao receber as informações do sensor, salva-as em um banco de dados MySQL e simultaneamente envia para a interface do usuário por meio do protocolo Web Socket. A interface é composta por um Web App desenvolvida em ReactJs que responde ao tamanho da tela em que é disposta. Quando a interface do usuário recebe as informações, é atualizada o virtual DOM com as informações de nível e estado da bomba, fornecendo ao usuário capacidade de saber em tempo real o nível do reservatório.
                        </h5>
                        </CardText>
                    </CardBody>
                </Card>

                <Card className="mt-4">
                    <CardHeader tag="h3" className="text-center" style={{ backgroundColor: "#CEA8F4" }}><h3>O que preciso para poder utilizar este projeto?</h3></CardHeader>
                    <CardBody>
                        <CardText className="text-justify">
                            <h5>
                                Para utilizar todo o potencial do projeto, é necessário ter alguns requisitos mínimos: DevKit ESP32, sensor de nível automotivo, conexão wifi, infraestrutura par hospedar a aplicação web, esta pode ser local ou hospedada em um servidor.
                            </h5>
                            <h5>
                                A infraestrutura de hospedagem requerer no mínimo 1GB de memória RAM e 25GB de armazenamento em um HD, para aplicações onde esta estrutura será apenas local deve-se atentar para o aquecimento do processador do hardware, pois ao colocar-se uma aplicação operando em tempo integral exige um esforço maior do computador. Já em uma estrutura hospedada o servidor de hospedagem garante o funcionamento da virtual machine em tempo integral.
                            </h5>
                            <h5>
                                É necessário que seja seguido criteriosamente todos os requisitos e etapas apresentadas no Get Started para que possa ser replicado a aplicação com seu perfeito funcionamento.

                                Alguns conhecimentos básicos são requeridos para o melhor entendimento da arquitetura do projeto, no que diz respeito a linguagem de programação: C, JavaScript, HTML, CSS. No que diz respeito ao hardware: Eletrônica, microcontrolador.
                            </h5>
                        </CardText>
                    </CardBody>
                </Card>

                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    <ModalHeader toggle={this.toggle} > <h3> Contacte-nos</h3> </ModalHeader>
                    <ModalBody>
                        <hr />
                        <div className="text-center text-muted"><FontAwesomeIcon icon="mobile-alt" /> (37) 9 9908 8146</div>
                        <hr />
                        <Form>
                            <FormGroup>
                                <Label for="exampleEmail">Email</Label>
                                <Input type="email" name="email" id="exampleEmail" placeholder="with a placeholder" />
                            </FormGroup>
                            <FormGroup>
                                <Label for="exampleText">Text Area</Label>
                                <Input type="textarea" name="text" id="exampleText" />
                            </FormGroup>
                        </Form>
                    </ModalBody>
                    <ModalFooter>
                        <Button outline color="warning" onClick={this.toggle}>Cancel</Button>{' '}
                        <Button outline color="success" onClick={this.toggle}>Sending</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

export default Produto