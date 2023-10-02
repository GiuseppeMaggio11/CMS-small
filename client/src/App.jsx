import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import dayjs from 'dayjs';
import { React, useState, useEffect, useContext } from 'react';
import { Container, Toast, ToastContainer } from 'react-bootstrap/'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

import { Navigation } from './components/Navigation';
import { LoginLayout } from './components/Auth';
import { PageForm } from './components/PageForm';
import { WebForm } from './components/WebForm';
import { LoadingLayout, NotFoundLayout, FrontLayout, BackLayout, EditLayout, AddLayout} from './components/Layout';
import { SinglePage } from './components/SinglePage';
import MessageContext from './messageCtx'
import API from './API';


function App() {
  
    // This state keeps track if the user is currently logged-in.
    const [loggedIn, setLoggedIn] = useState(false);
    // This state contains the user's info.
    const [user, setUser] = useState(null);
    const [pages,setPages] = useState([]);

    const [webName, setWebName] = useState();
    const [switchMod, setSwitchMod] = useState('Front')
    const [loading, setLoading] = useState(false);

    const [message, setMessage] = useState('');
    const [dirty,setDirty] = useState(true)
    // If an error occurs, the error message will be shown in a toast.
    const handleErrors = (err) => {
      let msg = '';
      if (err.error) msg = err.error;
      else if (typeof(err) === 'string') msg = String(err);
      else msg = 'Unknown Error';
      setMessage(msg); // WARN: a more complex application requires a queue of messages. In this example only last error is shown.
    }
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const user = await API.getUserInfo();  // here you have the user info, if already logged in
        setUser(user);
        setLoggedIn(true); setLoading(false); setSwitchMod('Back');
      } catch (err) {
        setUser(null);
        setLoggedIn(false); setLoading(false); setSwitchMod("Front");
      }
    };
    init();
  }, []);  

  useEffect(() => {
      API.getWebPageName()
      .then((name) => setWebName(name))
  },[webName])


  /**
   * This function handles the login process.
   * It requires a username and a password inside a "credentials" object.
   */
  const orderPages = (pages) => {
    const order = pages.sort((a,b) => {
      if(a.publicationDate && b.publicationDate){
          return a.publicationDate.isAfter(b.publicationDate) ? 1 : -1;
      }
      else if(!b.publicationDate)
          return -1;  
      else{
          return 1; 
      }
    })
    return order
  }
  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setUser(user);
      setLoggedIn(true);
      setSwitchMod("Back");
    } catch (err) {
      // error is handled and visualized in the login form, do not manage error, throw it
      throw err;
    }
  };

  /**
   * This function handles the logout process.
   */ 
  const handleLogout = async () => {
    await API.logOut();
    setLoggedIn(false);
    // clean up everything
    setUser(null);
    setSwitchMod("Front");
  };
  return (
    <>
    <BrowserRouter>
      <MessageContext.Provider value={{ handleErrors }}>
        <Container fluid className='App'>
          <ToastContainer className='below-nav' position='top-center'>
          <Toast  show={message !== ''} onClose={() => setMessage('')} delay={4000} autohide={true} bg='danger'>
            <Toast.Body >{message}</Toast.Body>
          </Toast>
          </ToastContainer>
          <Routes>
              <Route path='/' element={
                <>
                <Navigation loggedIn={loggedIn} logout={handleLogout} user={user} webName={webName}/>
                  <Container fluid className='mt-3 below-nav'>
                    {loading ? <LoadingLayout /> :<Outlet/>}
                  </Container>
                </>
              }>
              <Route index element={ 
                (!loggedIn || (loggedIn && switchMod==='front'))  ? <FrontLayout setSwitchMod={setSwitchMod} loggedIn={loggedIn} pages={pages} setPages={setPages} orderPages={orderPages}/> : <BackLayout dirty={dirty} setDirty={setDirty} switchMod={switchMod} setSwitchMod={setSwitchMod} pages={pages} setPages={setPages} user={user} orderPages={orderPages}/>
              }/>
              <Route path='/add' element={loggedIn ? <AddLayout user={user} setDirty={setDirty}/>  : <Navigate replace to='/login'/>} />
              <Route path='/edit/:id'  element={loggedIn ? <EditLayout user={user} setDirty={setDirty} /> : <Navigate replace to='/login'/> } />
              <Route path='/webpage/name' element={loggedIn && user.role==='Admin' ? <WebForm setWebName={setWebName} webName={webName}/> : <Navigate replace to='/login'/>} />
              <Route path='/login' element={!loggedIn ? <LoginLayout login={handleLogin} /> : <Navigate replace to='/' />} />
              <Route path='/pages/:id' element={<SinglePage pages={pages}></SinglePage>}/>
              <Route path='*' element={<NotFoundLayout />} />
            </Route>       
          </Routes>   
          
        </Container>
      </MessageContext.Provider>
    </BrowserRouter>
      
    </>
  )
}

export default App
