import dayjs from 'dayjs';

const SERVER_URL = 'http://localhost:3001/api/';

/**
 * This function is used to verify if the user is still logged-in.
 * It returns a JSON object with the user info.
 */
function getJson(httpResponsePromise) {
    // server API always return JSON, in case of error the format is the following { error: <message> } 
    return new Promise((resolve, reject) => {
      httpResponsePromise
        .then((response) => {
          if (response.ok) {
  
           // the server always returns a JSON, even empty {}. Never null or non json, otherwise the method will fail
           response.json()
              .then( json => resolve(json) )
              .catch( err => reject({ error: "Cannot parse server response" }))
  
          } else {
            // analyzing the cause of error
            response.json()
              .then(obj => 
                reject(obj)
                ) // error msg in the response body
              .catch(err => reject({ error: "Cannot parse server response" })) // something else
          }
        })
        .catch(err => 
          reject({ error: "Cannot communicate"  })
        ) // connection error
    });
  }
function getUserInfo ()  {
    return getJson(fetch(SERVER_URL + 'sessions/current', {
      credentials: 'include'
    })
    )
  };
/**
 * This function wants username and password inside a "credentials" object.
 * It executes the log-in.
 */
function logIn(credentials){
    return getJson(fetch(SERVER_URL + 'sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',  // this parameter specifies that authentication cookie must be forwared
      body: JSON.stringify(credentials),
    })
    )
  };

/**
 * This function destroy the current user's session and execute the log-out.
 */
function logOut() {
    return getJson(fetch(SERVER_URL + 'sessions/current', {
      method: 'DELETE',
      credentials: 'include'  // this parameter specifies that authentication cookie must be forwared
    })
    )
  }
/**
 * This function get the name of the web page
 */
function getWebPageName () {
  return getJson(fetch(SERVER_URL + 'webpage/name')
  ).then(element => {
    return element.name
  })
}
/**
 * This function update the name of the web page
 */
function newNameWebPage (name) {
  return getJson(fetch(SERVER_URL + 'webpage/name', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',  // this parameter specifies that authentication cookie must be forwared
    body: JSON.stringify({name}),
  })
  )
}

/**
 * This function get all the published pages.
 */
function getPublishedPages () {
  return getJson(fetch(SERVER_URL + 'pages/published'),{
    method: 'GET'
  }).then(json => {
    return json.map((page)=>{
      const Page = {
        id: page.IDpage,
        title: page.title,
        author: page.name,
        creationDate: page.creationDate,
        publicationDate: dayjs(page.publicationDate)
      }
      return Page
    })
  }) 
}
/**
 * This function get all the pages.
 */
function getPage(id){
  return getJson( fetch(`${SERVER_URL}pages/${id}`)).then(Data => {
    const updatedBlocks = Data.blocks.map(block => block);
    const updatedPage = { ...Data.page, author: Data.page.name};
    const updatedDataPage = { blocks: updatedBlocks, page: updatedPage };
    return updatedDataPage
  }) 
}
function getAllPages(){
  return getJson( fetch(SERVER_URL + 'pages/all',{ credentials: 'include' })).then(json => {
     return json.map((page)=>{
      const Page = {
        id: page.IDpage,
        idAuthor: page.IDauthor,
        title: page.title,
        author: page.name,
        creationDate: page.creationDate,
        publicationDate: page.publicationDate ? dayjs(page.publicationDate) : page.publicationDate
      }
      return Page
    })
  }) 
}

function addPage(pageData){
  return getJson(fetch(SERVER_URL + 'pages/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',  // this parameter specifies that authentication cookie must be forwared
    body: JSON.stringify(pageData),
  })
  )
}
function editPage(id,pageData){
  return getJson(fetch(`${SERVER_URL}pages/edit/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',  // this parameter specifies that authentication cookie must be forwared
    body: JSON.stringify(pageData),
  })
  )
}

function deletePage(IDpage) {
  return getJson(
    fetch(SERVER_URL + "pages/" + IDpage, {
      method: 'DELETE',
      credentials: 'include'
    })
  )
}
const API = {getUserInfo, logIn, logOut, getPublishedPages, getAllPages, getPage, getWebPageName,newNameWebPage,addPage,deletePage, editPage};
export default API;