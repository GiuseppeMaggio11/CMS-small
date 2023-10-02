import { Row, Col, Container, Modal } from 'react-bootstrap';
import { useParams, useLocation} from 'react-router-dom';
import { useEffect, useState } from 'react';

import API from '../API';

const SinglePage = (props) => {
    const params = useParams();
    const [pageInfo, setPageInfo] = useState();
    const [blocks,setBlocks] = useState([])
    const [loading, setLoading] = useState(true)
    

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
                    <Container fluid="md">
                        <Row>
                            <Col>{`Author : ${pageInfo.author}`}</Col>
                            <Col>{`Title : ${pageInfo.title}`}</Col>
                            <Col>{`Publication Date : ${pageInfo.publicationDate}`}</Col>
                        </Row>
                        {blocks.map((block) =>  <Block key={block.IDblock} block={block}/>)}
                    </Container>
                </>
                : <p> This page does not exist or you ar not allowed to see it</p>
            }
        </>
       
    )
        
    

}

const Block = (props) =>{
    return (
        <div className="modal show" style={{ display: 'block', position: 'initial' }}>
            <Modal.Dialog>
                <Modal.Header >
                    <Modal.Title>{props.block.type}</Modal.Title>
                </Modal.Header>
        
                <Modal.Body>
                    { props.block.type==="Image" ? <img src={`http://localhost:3001/${props.block.content}.jpeg`}></img> :<p>{props.block.content}</p> }
                </Modal.Body>
                <Modal.Footer>
                    {`position ${props.block.position}`}
                </Modal.Footer>
            </Modal.Dialog>
        </div>
    )
}


export {SinglePage}