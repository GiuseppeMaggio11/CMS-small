import {useState, useContext} from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Row, Col, Container, Modal,Form, Button, Alert } from 'react-bootstrap';
import MessageContext from '../messageCtx'
import 'bootstrap-icons/font/bootstrap-icons.css';
import dayjs from 'dayjs';
import API from '../API';


const PageForm = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {handleErrors} = useContext(MessageContext)
  const nextpage = location.state?.nextpage || '/';
  const [showImage, setShowImage] = useState(false)
  
  const [IDauthor, setIDauthor] = useState(props.pageInfo ? props.pageInfo.IDauthor : props.user.id);
  const [author, setAuthor] = useState(props.pageInfo ? props.pageInfo.author : props.user.name)
  const [title, setTitle] = useState(props.pageInfo ? props.pageInfo.title : '');
  const [emailAuthor,setEmailAuthor] = useState('')
  const [creationDate, setCreationDate] = useState(props.pageInfo ? props.pageInfo.creationDate : dayjs().format('YYYY-MM-DD'));
  const [publicationDate, setPublicationDate] = useState(props.pageInfo ? props.pageInfo.publicationDate : '');
  const [header,setHeader] = useState('');
  const [paragraph, setParagraph] = useState('');
  const [image, setImage] = useState('');
  const [blocks, setBlocks] = useState(props.blocks ? props.blocks : []);
  const [show, setShow] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const addBlock = (blockData) => {
    setBlocks([...blocks,blockData])
  }

  const deleteBlock = (position) => {
    const newBlocks = blocks.filter((element)=>element.position!==position).map((element,index)=>index>=position-1 ? {...element,position: element.position-1} : element)
    setBlocks(newBlocks)
  }

  const moveBlock = (blockToMove,direction) => {
    if(direction==="up"){
      const moveUp = Object.assign({},{...blockToMove, position:blockToMove.position-1})
      const moveDown = Object.assign({},{...blocks.filter((element)=>element.position===blockToMove.position-1)[0],position:blockToMove.position})
      setBlocks(blocks.map((element)=>{
        if(element.position===moveUp.position){
          return moveUp;
        } else if(element.position === moveDown.position){
          return moveDown;
        } else {
          return element
        }
      }))
    } else {
        const moveDown = Object.assign({},{...blockToMove, position:blockToMove.position+1})
        const moveUp = Object.assign({},{...blocks.filter((element)=>element.position===blockToMove.position+1)[0],position:blockToMove.position})
        setBlocks(blocks.map((element)=>{
          if(element.position===moveUp.position){
            return moveUp;
          } else if(element.position === moveDown.position){
            return moveDown;
          } else {
            return element
          }
        }))
    }
  }

  const modifyContent = (position, newContent)=> {
    const copyBlocks = blocks.map(obj => ({ ...obj }));
    const newBlocks = copyBlocks.map(obj => obj.position===position ? {...obj, content: newContent} : obj)
    setBlocks(newBlocks)
  }


  const handleSubmit = (event) => {
    event.preventDefault();
    if(!blocks.some(element => element.type==="Header") || !blocks.some(element => (element.type==="Image" || element.type==="Paragraph")) ){      
      handleErrors("You muste include an Header with at least one paragraph or one image")
    } else {
      const newPage = {"blocks": blocks, "pageInfo": {"title": title, "creationDate": creationDate, "publicationDate":publicationDate}}
      if(props.pageInfo){
        newPage.pageInfo.IDpage = props.pageInfo.IDpage;
        if(props.user.role === "Admin"){
          newPage.pageInfo.emailAuthor = emailAuthor;
        } else {
          newPage.pageInfo.IDauthor = IDauthor
        }
        props.editPage(newPage)
      }
      else {
        newPage.pageInfo.IDauthor = IDauthor
        props.addPage(newPage)
      }
    }
};

    return(
        <>
          <Container>
          <Form  onSubmit={handleSubmit}>
          <Alert
                  dismissible
                  show={show}
                  onClose={() => setShow(false)}
                  variant="danger">
                  {errorMessage}
                </Alert>
                <Row className='mt-3'>
              <Col md className="flex align-self-end">
                <Button className="mx-2 my-2" variant="primary" type="submit">Save</Button>
                <Link className="btn btn-danger mx-2 my-2" to={nextpage}> Cancel </Link>
              </Col>
            </Row> 
            <Row>
              <Col md>
                  <Form.Group>
                      <Form.Label>Author</Form.Label>
                        <Form.Control
                        type="text"
                        value={author}
                        disabled
                        readOnly
                        />
                  </Form.Group>                
              </Col>
              <Col md>
              <Form.Group>
                      <Form.Label>Creation Date</Form.Label>
                        <Form.Control
                        type="date"
                        value={creationDate}
                        disabled
                        readOnly
                        />
                  </Form.Group>
              </Col>
              <Col md>
              <Form.Group>
                      <Form.Label>Publication Date</Form.Label>
                        <Form.Control
                        type="date"
                        value={publicationDate}
                        onChange={event => setPublicationDate(event.target.value) }
                        />
              </Form.Group>
              </Col>
              <Col md>
              <Form.Group>
                      <Form.Label>Title</Form.Label>
                        <Form.Control
                        type="text"
                        value={title}
                        required={true}
                        onChange={event => setTitle(event.target.value) }
                        />
              </Form.Group>
              </Col>
              {props.user.role==='Admin' && 
                <>
                <Col>
                  <Form.Group>
                        <Form.Label>Change author</Form.Label>
                          <Form.Control
                          type="email"
                          placeholder="name@example.com"
                          value={emailAuthor}
                          onChange={event => setEmailAuthor(event.target.value)}
                          />
                  </Form.Group>
                </Col>
                </>}
            </Row>
            <Row className='mt-3'>
              <Col md>
                <Form.Group>
                        <Form.Label>Header text</Form.Label>
                          <Form.Control
                          as="textarea"
                          type="text"
                          value={header}
                          placeholder="Insert the text of the header here"
                          onChange={event => setHeader(event.target.value) }
                          />
                </Form.Group>
                <Button className="mx-2 my-2" variant="primary" disabled={header===''} onClick={()=>{addBlock({type:"Header", content:header, position: blocks.length+1});setHeader('')}}>Add Header</Button>
              </Col>
              <Col md>
                <Form.Group>
                        <Form.Label>Paragraph text</Form.Label>
                          <Form.Control
                          as="textarea"
                          type="text"
                          value={paragraph}
                          placeholder="Insert the text of the paragraph here"
                          onChange={event => setParagraph(event.target.value) }
                          />
                </Form.Group>
                <Button className="mx-2 my-2" variant="primary" disabled={paragraph===''} onClick={()=>{addBlock({type:"Paragraph", content:paragraph, position: blocks.length+1});setParagraph('')}}>Add Paragraph</Button>
              </Col>
              <Col>
               <Row>
                <Col>
                <Form.Label>Image</Form.Label>
                <Form.Select aria-label="Default select example" value={image} onChange={()=>setImage(event.target.value)}>
                  <option>Choose your image</option>
                  <option value="dog">Dog</option>
                  <option value="island">Island</option>
                  <option value="web">Web</option>
                  <option value="beatles">Beatles</option>
                </Form.Select>
                </Col>
                </Row>
                <Row>
                  <Col>
                <Button className="mx-2 my-2 " variant="primary" disabled={image===''} onClick={()=>{addBlock({type:"Image", content:image, position:blocks.length+1});setImage('')}}>Add Image</Button>
                </Col>
                <Col>
                <Button className="mx-2 my-2 " variant="primary" onClick={()=> showImage ? setShowImage(false) : setShowImage(true)}>{showImage ? 'Close' : 'Show Image' }</Button>
                </Col>
                </Row>
              </Col>
              </Row>
              { showImage &&
                <Row> 
                    <Col className='my-2 mx-2'>
                      <p>Dog</p>
                     <img src={`http://localhost:3001/dog.jpeg`}></img> </Col>
                    <Col className='my-2 mx-2'>
                    <p>Web</p>
                     <img src={`http://localhost:3001/web.jpeg`}></img> </Col>
                    <Col className='my-2 mx-2'>
                    <p>Beatles</p>
                   <img src={`http://localhost:3001/beatles.jpeg`}></img> </Col>
                    <Col className='my-2 mx-2'>
                    <p>Island</p>
                    <img src={`http://localhost:3001/island.jpeg`}></img> </Col>
                </Row>
              }
          </Form>
            {blocks.map((block)=><Block key={block.position} block={block} modifyContent={modifyContent} lastPosition={blocks.length} deleteBlock={deleteBlock} moveBlock={moveBlock} setParagraph={setParagraph} setHeader={setHeader}/>) }
          </Container>
        </>
    )
}

const Block = (props) =>{
  const block = props.block
  return (
      <div className="modal show" style={{ display: 'block', position: 'initial' }}>
          <Modal.Dialog>
              <Modal.Header >
                  <Modal.Title>{block.type}</Modal.Title>
              </Modal.Header>
      
              <Modal.Body>
                  { block.type==="Image" ? <img src={`http://localhost:3001/${block.content}.jpeg`}></img> :   
                  
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Control as="textarea" value={props.block.content} onChange={(e)=>{props.modifyContent(block.position, e.target.value)}}/>
                    </Form.Group>
                  </Form>
                  //<p>{props.block.content}  </p> 
                  
                  
                  }
              </Modal.Body>
              <Modal.Footer className='justify-content-between'>
                 {`position ${block.position}`}
                  <Button className="mx-2 my-2" variant="danger" onClick={()=>props.deleteBlock(block.position)}>Delete</Button>
                  <Row>
                    <Col>
                      { block.position!==props.lastPosition && <Button className='mx-1' variant='light' onClick={()=>props.moveBlock(block,"down")}> <i className="bi bi-arrow-down"></i> </Button>}
                      { block.position!==1 && <Button className='mx-1'variant='light' onClick={()=>props.moveBlock(block,"up")} > <i className="bi bi-arrow-up"></i> </Button>}
                  </Col>
                  </Row>
              </Modal.Footer>
          </Modal.Dialog>
      </div>
  )
}

export {PageForm}