import { React, useContext, useState, useEffect } from 'react';
import { Row, Col, Button, Spinner, Container} from 'react-bootstrap';
import { Link, useParams, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { FrontOffice } from './FrontOffice';
import { BackOffice } from './BackOffice';
import {PageForm} from './PageForm'
import MessageContext from '../messageCtx'

import API from '../API';
import { LoginForm } from './Auth';


function FrontLayout(props) {
  const {loggedIn, switchMod, setSwitchMod, pages, setPages, orderPages} = props;
  const {handleErrors} = useContext(MessageContext);

  useEffect(()=>{
    
    API.getPublishedPages()
      .then(pages => {
        const orderedPages = orderPages(pages)
        setPages(orderedPages)
      })
      .catch(e => {
          handleErrors(e)
      });
  },[])

  return(
    <>
      <h1>FRONT OFFICE</h1> 
      {loggedIn && 
        <Container className='d-flex justify-content-end' style={{ width: '100%', padding: 0 }}>
            <Button className="btn btn-primary" onClick={()=>setSwitchMod("Back")}> Back Office</Button>
        </Container>
      }
    <FrontOffice loggedIn={loggedIn} pages={pages} setPages={setPages} orderPages={orderPages}></FrontOffice>
  </>
  )
}

function BackLayout(props) {
  const {switchMod, setSwitchMod, pages, setPages, orderPages, user, dirty, setDirty} = props;
  const {handleErrors} = useContext(MessageContext)

const deletePage = (id) => {
    API.deletePage(id)
    .then(()=>setDirty(true))
    .catch(e => handleErrors(e))
}
  useEffect(()=>{
    setDirty(true)
  },[switchMod])

  useEffect(()=>{
      if(dirty){
        API.getAllPages()
        .then(pages => {
          const orderedPages = orderPages(pages)
          setPages(orderedPages)
          setDirty(false)
        })
        .catch(e => {
            handleErrors(e); setDirty(false)
        });
      } 
    },[dirty,switchMod])

  return(
    <>
      <h1>BACK OFFICE</h1>
      <Container className='d-flex justify-content-end' style={{ width: '100%', padding: 0 }}>
        <Button className="btn btn-primary" onClick={()=>setSwitchMod("front")}> Front Office</Button>
      </Container>
      <BackOffice deletePage={deletePage} pages={pages} setPages={setPages} user={user} orderPages={orderPages}></BackOffice>
    </>
  )
}

function AddLayout(props){
  const navigate = useNavigate()
  const {user, setDirty} = props
  const {handleErrors} = useContext(MessageContext)

  const addPage = (newPage) =>{
    API.addPage(newPage)
        .then(()=>{props.setDirty(true); navigate('/')})
        .catch(e => {handleErrors(e); navigate('/')})
  }
  return(
    <>
      <PageForm user={user} setDirty={setDirty} addPage={addPage}></PageForm>
    </>
  )
}

function EditLayout(props) {

  const params = useParams();
  const navigate = useNavigate();
  const [pageInfo, setPageInfo] = useState();
  const [blocks,setBlocks] = useState()
  const [loading, setLoading] = useState(true)
  const {handleErrors} = useContext(MessageContext)

 const editPage = (updatePage) =>{
    API.editPage(pageInfo.IDpage,updatePage)
      .then(()=>{props.setDirty(true); navigate('/')})
      .catch(e => {handleErrors(e); navigate('/edit/'+pageInfo.IDpage)})
 }

  useEffect(()=>{
    
    const init = async() => {
        setLoading(true);
        const Data = await API.getPage(params.id);
        setBlocks(Data.blocks.sort((a, b) => a.position - b.position));
        setPageInfo(Data.page);
    }
    init()
    setLoading(false)
},[])
  return (
    <>
            {loading ? <p>We are loading the page..</p> : 
            (pageInfo && blocks.length!==0) ?
                <>
                  <PageForm editPage={editPage}pageInfo={pageInfo} blocks={blocks} user={props.user} setDirty={props.setDirty}></PageForm>
                </>
                : <p>This page does not exist or you are not allowed to modify it</p>
            }
        </>
  )
}

function NotFoundLayout() {
    return(
        <>
          <h2>This is not the route you are looking for!</h2>
          <Link to="/">
            <Button variant="primary">Go Home!</Button>
          </Link>
        </>
    );
  }

/**
 * This layout shuld be rendered while we are waiting a response from the server.
 */
function LoadingLayout(props) {
  return (
    <Row className="vh-100">
      <Col md={4} bg="light" className="below-nav" id="left-sidebar">
      </Col>
      <Col md={8} className="below-nav">
        <h1>Page list is loading ...</h1>
      </Col>
    </Row>
  )
}

export { LoadingLayout, NotFoundLayout, FrontLayout, BackLayout, EditLayout, AddLayout}; 