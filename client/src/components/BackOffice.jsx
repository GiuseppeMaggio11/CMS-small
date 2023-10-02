import { React, useState, useEffect, useContext } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'dayjs';
import API from '../API';
import MessageContext from '../messageCtx'
import { Link } from 'react-router-dom';


import { Table, Form, Button, Container, Row, Col } from 'react-bootstrap/'
import dayjs from 'dayjs';

const BackOffice = (props) => {
    
    const pages = props.pages
    const user = props.user
    
    if(pages.length===0){
        return(
            <>
                <p>There are no published pages</p>
                <Link className="btn btn-success btn-lg fixed-right-bottom me-4" to="/add" state={{nextpage: location.pathname}}> Add </Link>
            </>
        )
    }
    else {
        return (
            <> 
            <Table striped>
                  <thead>
                    <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Creation Date</th>
                        <th>Publication Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        pages.map((page) => <PageRow key={page.id} pageData={page} user={user} deletePage={props.deletePage}></PageRow>)
                    }
                </tbody>
            </Table>
            <Link className="btn btn-success btn-lg fixed-right-bottom me-4" to="/add" state={{nextpage: location.pathname}}> Add </Link>
            { user.role==="Admin" && <Link className="btn btn-success btn-lg fixed-right-bottom" to="/webpage/name" state={{nextpage: location.pathname}}> Edit Web Page </Link>}
            </>
        )
    }
}

const PageRow = (props) => {

    const now = dayjs()
    const statusPage = (date) => {
       return !date ? "draft" : date > now ? "scheduled" : "published"
   }
    return (
        <tr>
            <td>
                <Link to={'/pages/'+props.pageData.id}> {props.pageData.title}  </Link>
            </td>
            <td>
                <p>{props.pageData.author}</p>
            </td>
            <td>
                <small>{props.pageData.creationDate}</small>
            </td>
            <td>
                <small>{props.pageData.publicationDate ? props.pageData.publicationDate.format('YYYY-MM-DD') : ''}</small>
            </td>
            <td>
                <p>{statusPage(props.pageData.publicationDate)}</p>
            </td>
            {
                props.user.role === "Admin" || (props.user.name === props.pageData.author) ? 
                <td>
                    <Link className="btn btn-primary" to={'/edit/' + props.pageData.id}>
                    <i className="bi bi-pencil-square"/>
                    </Link>
                    &nbsp;
                    <Button variant='danger' onClick={() => props.deletePage(props.pageData.id)} >
                    <i className="bi bi-trash"/>
                    </Button>
                </td> :
                 <td></td> 
            }
        </tr>
    )
}



export {BackOffice}