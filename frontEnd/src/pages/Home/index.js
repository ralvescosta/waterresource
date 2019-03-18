import React, { Component } from "react";
import { Button, Navbar, NavbarBrand, NavbarNav, NavItem, NavLink, NavbarToggler, Collapse, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Fa } from "mdbreact";
import { Jumbotron, Form, Modal, ModalHeader, ModalBody, FormGroup, Label, Input, ModalFooter } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import MDSpinner from "react-md-spinner";

import "./style.css";
import 'mdbreact/dist/css/mdb.css';
import 'bootstrap-css-only/css/bootstrap.min.css';

class Home extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            isOpen: false,
            modal: false,
            status: {
                mounted: false,
                signupbtn: false
            }
        };
    }
    toggleCollapse = () => {
        this.setState({ isOpen: !this.state.isOpen });
    }
    printAlgo() {

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
                            <div className="spinner">
                                <MDSpinner size={100} />
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
                                <NavLink className="waves-effect waves-light" to="#!" onClick={this.redirectGitHub} ><Fa icon="github" /></NavLink>
                            </NavItem>

                            <NavItem>
                                <NavLink className="waves-effect waves-light" to="#!" onClick={this.redirecetWhatsApp} >
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

                <div className="responsive-home">
                    <div className="image-text-home">
                        <h3>Tenha menos imprevistos, e mais conforto!</h3>
                    </div>
                </div>


                <Jumbotron className="" style={{ backgroundColor: "#CEA8F4" }}>
                    <h1 id="teste" className="text-center">Apresentamos</h1>
                    <p className="lead text-center">A mais nova e inovadora solução tecológica para o supervisionamento de reservatorios de Água</p>
                    <hr className="my-2" />
                    <p className="text-center">Quer entender melhor como o sistema funciona?</p>
                    <p className="text-center">
                        <Button color="primary" href="/produto">Clique aqui</Button>
                    </p>
                </Jumbotron>



                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    <ModalHeader toggle={this.toggle} > <h3> Contacte-nos</h3> </ModalHeader>
                    <ModalBody>
                        <hr />
                        <div className="text-center text-muted"><FontAwesomeIcon icon="mobile-alt" /> (37) 9 9908 8146</div>
                        <hr />
                        <Form>
                            <FormGroup>
                                <Label for="exampleEmail">Email</Label>
                                <Input type="email" name="email" id="exampleEmail" placeholder="you@email.com" />
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

export default Home