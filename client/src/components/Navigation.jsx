import  { React, useState } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { Navbar, Nav, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { LoginButton, LogoutButton } from './Auth';

const Navigation = (props) => {

    return (
        <Navbar bg="primary" expand="sm" variant="dark" fixed="top" className="navbar-padding">
          <Link to="/">
            <Navbar.Brand>
              {props.webName}
            </Navbar.Brand>
          </Link>
          <Nav className="ml-md-auto">
            <Navbar.Text className="mx-2">
              {props.user && props.user.name && `Welcome ${props.user.role}, ${props.user.name}!`}
            </Navbar.Text>
            <Form className="mx-2">
              {props.loggedIn ? <LogoutButton logout={props.logout} /> : <LoginButton />}
            </Form>
          </Nav>
        </Navbar>
      );
}



export {Navigation}