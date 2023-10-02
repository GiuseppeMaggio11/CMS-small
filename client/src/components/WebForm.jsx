import { React, useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {Form, Button} from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'dayjs';
import API from '../API';

function WebForm(props){
    const navigate = useNavigate();
    const [name,setName] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        updateName(name,props.setWebName);
        navigate('/')
        
  }
  const updateName = (newName,setWebName) => {
    API.newNameWebPage(newName)
    .then(() => {setWebName(newName)})
}

    return(
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formGroupEmail">
                <Form.Label>{`Actual name: ${props.webName}`}</Form.Label>
                <Form.Control type="text" required={true} placeholder="Enter the new name" value={name} onChange={event => setName(event.target.value)} />
            </Form.Group>
            <Button className="mb-3" variant="success" type="submit">Save</Button>
            &nbsp;
            <Link className="btn btn-danger mb-3" to={'/'}> Cancel </Link>
        </Form>
        
    )
}


export {WebForm}