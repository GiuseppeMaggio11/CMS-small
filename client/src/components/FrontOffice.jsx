import { React, useState, useEffect, useContext } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'dayjs';
import API from '../API';

import { Link } from 'react-router-dom';

import { Table, Form, Button, Container} from 'react-bootstrap/'
import dayjs from 'dayjs';

const FrontOffice = (props) => {
    
    if(props.pages.length===0){
        return(
            <>
                <p>There are no published pages</p>
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
                        props.pages.map((page) => <PageRow key={page.id} pageData={page}></PageRow>)
                    }
                </tbody>
            </Table>
            </>
        )
    }
}



const PageRow = (props) => {
   
    return (
        <tr>
            <td>
                <Link to={`/pages/${props.pageData.id}`}> {props.pageData.title}  </Link>
            </td>
            <td>
                <p>{props.pageData.author}</p>
            </td>
            <td>
                <small>{props.pageData.creationDate}</small>
            </td>
            <td>
                <small>{props.pageData.publicationDate ? props.pageData.publicationDate.format("YYYY-MM-DD") : ""}</small>
            </td>
            <td>
                <p>published</p>
            </td>
        </tr>
    )
}

export {FrontOffice}