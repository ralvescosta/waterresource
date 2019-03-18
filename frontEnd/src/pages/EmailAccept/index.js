import React, { Component } from "react";
import MDSpinner from "react-md-spinner";
import "./style.css";

import { Button, Navbar, NavbarBrand, NavbarNav, NavItem, NavLink, NavbarToggler, Collapse, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Fa } from "mdbreact";
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Alert } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import api from '../../services/api';

class Produto extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            modal: false,
            isOpen: false,
            status: {
                mounted: false,

            },
            feedback: undefined
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
        let url = new URL(window.location.href)
        let user_id = url.searchParams.get("rock");

        const LçGityAbhtppppeWihjAyYy = {
            WaterResource: {
                userId: user_id,
                nivel: 77,
                isPumpBlocked: 0
            }
        }
        api.post('/users/verifyacesso', { id: user_id })
            .then(response => {
                if (response.data.acesso === 0) {
                    api.post(`/users/email/${user_id}`)
                        .then(response => {

                            this.setState({
                                status: {
                                    mounted: true
                                },
                                feedback: true
                            })

                            api.post('/gateway/userregister', LçGityAbhtppppeWihjAyYy)
                                .then(niveltable => {
                                    //Ok
                                })
                        })
                }
                else{
                    this.setState({
                        status: {
                            mounted: true
                        }
                    })
                }
            })
            .catch(err => {

                this.setState({
                    status: {
                        mounted: true
                    },
                    feedback: false
                })
            })
    }
    redirecetWhatsApp = () => {
        window.location.href = "https://api.whatsapp.com/send?phone=5537999088146&text=Ola!%20Gostaria%20de%20saber%20mais%20sobre%20o%20projeto%20WaterResource.%20;)"
    }

    userFeedback = () => {

    }
    userInformation = () => {
        if (this.state.feedback) {
            return (
                <Alert color="success">
                    <h1 className="text-center">Seu cadastro foi confirmado com sucesso!</h1>
                    <h5 className="text-center">Você ja pode acessar todos os recursos da Interface Web e Mobile</h5>
                    <h6 className="text-center">*OBS: No ato da confirmação do email, para melhorar a experiencia do usuario com a interface, é gerado altomaticamente um registro de aquisição de nivel</h6>
                </Alert>
            );
        }
        return (
            <Alert color="warning">
                <h1 className="text-center">Ocorreu algum problema inesperado!</h1>
                <h5 className="text-center">Favor tente novamento mais tarde!</h5>
            </Alert>
        );

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
                                <NavLink className="ml-4" to="/produto">Produto</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className="ml-4" to="/manual">Manual</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className="ml-4" to="/dashboard">Dashboard</NavLink>
                            </NavItem>
                        </NavbarNav>
                        <NavbarNav right>
                            <NavItem>
                                <NavLink className="waves-effect waves-light" to="#!" onClick={this.toggle}><Fa icon="envelope" /></NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className="waves-effect waves-light" to="#!"><Fa icon="facebook" /></NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className="waves-effect waves-light" to="" onClick={this.redirecetWhatsApp} >
                                    <Fa icon="whatsapp" />
                                </NavLink>
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

                <div className="responsive-box">
                    <div className="content">
                        {this.userInformation()}
                    </div>
                </div>



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