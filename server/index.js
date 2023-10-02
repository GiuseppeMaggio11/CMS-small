'use strict';

/*** Importing modules ***/
const dayjs = require('dayjs');
const express = require('express');
const morgan = require('morgan');                                  // logging middleware
const cors = require('cors');

const { check, validationResult, oneOf } = require('express-validator'); // validation middleware

const cmsDao = require('./dao-cms'); // module for accessing the CMS table in the DB
const userDao = require('./dao-users'); // module for accessing the user table in the DB

/*** init express and set-up the middlewares ***/
const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static('public'));

/** Set up and enable Cross-Origin Resource Sharing (CORS) **/
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

/*** Passport ***/

/** Authentication-related imports **/
const passport = require('passport');                              // authentication middleware
const LocalStrategy = require('passport-local');                   // authentication strategy (username and password)

/** Set up authentication strategy to search in the DB a user with a matching password. **/
passport.use(new LocalStrategy(async function verify(username, password, callback) {
  const user = await userDao.getUser(username, password)
  if(!user)
    return callback(null, false, 'Incorrect username or password'); 
    
  return callback(null, user); 
}));

// Serializing in the session the user object given from LocalStrategy(verify).
passport.serializeUser(function (user, callback) { 
  callback(null, user);
});


passport.deserializeUser(function (user, callback) {
  return callback(null, user); 
});

/** Creating the session */
const session = require('express-session');
const { result } = require('lodash');

app.use(session({
  secret: "sh... it'sasecret!",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));


/** Defining authentication verification middleware **/
const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Not authorized'});
}

/** Defining Admin verification middleware **/
const isAdmin = (req, res, next) => {
  if(req.user.role==="Admin") {
    return next();
  }
  return res.status(401).json({error: 'Not authorized'});
}
/*** Utility Functions ***/

// This function is used to format express-validator errors as strings
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return `${location}[${param}]: ${msg}`;
};

/*** Users APIs ***/

// POST /api/sessions 
// This route is used for performing login.
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => { 
    if (err)
      return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).json({ error: info});
      }
      // success, perform the login and extablish a login session
      req.login(user, (err) => {
        if (err)
          return next(err);
      
        return res.json(req.user);
      });
  })(req, res, next);
});

// GET /api/sessions/current
// This route checks whether the user is logged in or not.
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {
    res.status(200).json(req.user);}
  else
    res.status(401).json({error: 'Not authenticated'});
});

// DELETE /api/session/current
// This route is used for loggin out the current user.
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.status(200).json({});
  });
});

/*** Pages APIs ***/

app.get('/api/pages/published',async (req, res) => {
   try {
    const today = dayjs().format("YYYY-MM-DD")
    const result = await cmsDao.getPublishedPages(today); 
    res.json(result);
  } catch (err) {
    res.status(503).json({ error: `Database error : ${err}` }); 
  }
});

app.get('/api/pages/all',isLoggedIn, async (req, res) => {
  try {
    const result = await cmsDao.getAllPages(); 
    res.json(result);
  } catch (err) {
    res.status(503).json({ error: `Database error : ${err}` }); 
  }
});

app.get('/api/pages/:id',async (req,res) => {
  try{
    const blocksInfo = await cmsDao.getBlocks(req.params.id);
    const pageInfo = await cmsDao.getPageInfo(req.params.id)

    const data = {
        blocks: blocksInfo,
        page: pageInfo 
      }
    res.status(200).json(data);
  } catch (err){
    res.status(503).json({ error: `Database error during getting the page ${req.params.id}` });
  }
})

app.post('/api/pages/add',isLoggedIn,
  check('blocks')
  .custom((blocks) => blocks.some((element)=>element.type === "Header"))
  .withMessage('You must have an Header'),
  check('blocks')
  .custom((blocks) => blocks.some((element)=>(element.type === "Paragraph" || element.type === "Image" )))
  .withMessage('You must have at lease an Image or a Paragraph'),
  check('blocks.*.type').isIn(['Header', 'Paragraph', 'Image']).withMessage('Invalid block'),
  check('blocks.*.content').isLength({min:1}),
  check('blocks').custom((array) => {
    const positions = array.map((item) => item.position);
    for (let i = 0; i < positions.length; i++) {
      if (positions[i] != i+1) {
        throw new Error('The field "position" it is not in the correct order');
      }
    }
    return true;
  }),
  check('pageInfo.title').isLength({min:1,max:160}).withMessage('Insert a title'),
  check('pageInfo.IDauthor').isInt().withMessage('Ivalid Author'),
  check('pageInfo.creationDate').isLength({min: 10, max: 10}).isISO8601({strict: true}),
  check('pageInfo.publicationDate').isLength({min: 10, max: 10}).isISO8601({strict: true}).optional({checkFalsy: true}),
async (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter); // format error message
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array().join(", ") });
  }
  try {



    const pageID = await cmsDao.addPage(req.body.pageInfo); 
    const blocks = await cmsDao.addBlocks(pageID,req.body.blocks);
    const blockInfo = await cmsDao.getBlocks(pageID);
    const pageInfo = await cmsDao.getPageInfo(pageID);
    
    const result = {
      "blocks": blockInfo,
      "pageInfo": pageInfo
    }
    return res.json(result)
  } catch (err) {
    res.status(503).json({ error: `Database error during the creation of the film: ${err}` }); 
  }
})

app.put('/api/pages/edit/:id',isLoggedIn,
  check('blocks')
  .custom((blocks) => blocks.some((element)=>element.type === "Header"))
  .withMessage('You must have an Header'),
  check('blocks')
  .custom((blocks) => blocks.some((element)=>(element.type === "Paragraph" || element.type === "Image" )))
  .withMessage('You must have at lease an Image or a Paragraph'),
  check('blocks.*.type').isIn(['Header', 'Paragraph', 'Image']).withMessage('Invalid block'),
  check('blocks.*.content').isLength({min:1}),
  check('blocks').custom((array) => {
    const positions = array.map((item) => item.position);
    for (let i = 0; i < positions.length; i++) {
      if (positions[i] != i+1) {
        throw new Error('The field "position" it is not in the correct order');
      }
    }
    return true;
  }),
  check('pageInfo.title').isLength({min:1,max:160}).withMessage('Insert a title'),
  check('pageInfo.IDpage').isInt(),
  oneOf([
    check('pageInfo.IDauthor').notEmpty(),
    check('pageInfo.emailAuthor').notEmpty()
  ]),
  check('pageInfo.creationDate').isLength({min: 10, max: 10}).isISO8601({strict: true}),
  check('pageInfo.publicationDate').isLength({min: 10, max: 10}).isISO8601({strict: true}).optional({checkFalsy: true}),
async (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter); // format error message
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array().join(", ") });
  }
  try {
    let userID = ''
    let newPage = req.body.pageInfo
    if (req.body.pageInfo.IDpage !== Number(req.params.id)) {
      return res.status(422).json({ error: 'URL and body id mismatch' });
    }
    if(req.body.pageInfo.emailAuthor && req.user.role==="Admin"){
      userID = await userDao.getUserByEmail(req.body.pageInfo.emailAuthor)
      if(userID.error){
        return res.status(401).json({error: 'Not user found'})
      }
       newPage = {...newPage, IDauthor:userID.id}
    } 
    const updatePage = await cmsDao.updatePage(req.user.role, newPage); 
    if(updatePage.error){
      return res.status(401).json({error: "This is not your page"})
    }
    const deleteBlocks = await cmsDao.deleteBlocks(req.params.id);
    const blocks = await cmsDao.addBlocks(req.params.id,req.body.blocks);
    const blockInfo = await cmsDao.getBlocks(req.params.id);
    const pageInfo = await cmsDao.getPageInfo(req.params.id);
    
    const result = {
      "blocks": blockInfo,
      "pageInfo": pageInfo
    }
    return res.json(result)
  } catch (err) {
    res.status(503).json({ error: `Database error during the update of the page: ${err}` }); 
  }
})

app.delete('/api/pages/:id',
  isLoggedIn,
  [ check('id').isInt() ],
  async (req, res) => {
    try {
      if(req.user.role==="User"){
        const pageInfo = await cmsDao.getPageInfo(req.params.id);
        if(pageInfo.error){
          return res.status(404).json({ error: 'Page not found'})
        }
        else if(pageInfo.IDauthor !== req.user.id){
           return res.status(401).json({ error: 'Not authorized'})
        }
      }
      const deletedBlocks = await cmsDao.deleteBlocks(req.params.id);
        if (deletedBlocks != null){
          return res.status(404).json(deletedBlocks);
        }
        else{
          const deletedPages = await cmsDao.deletePage(req.params.id);
          if (deletedPages == null)
            res.status(200).json({}); 
          else
            res.status(404).json(deletedPages);
        } 
      } catch (err) {
      res.status(503).json({ error: `Database error during the deletion of pages ${req.params.id}: ${err} ` });
    }
  }
);
/*** Web page API ***/
app.get('/api/webpage/name',async (req, res) => {
  try {
   const result = await cmsDao.getWebPageName(); 
   res.json(result);
 } catch (err) {
   res.status(503).json({ error: `Database error : ${err}` }); 
 }
});

app.put('/api/webpage/name',isLoggedIn,isAdmin,check('name').isLength({min: 1, max:160}),async (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter); // format error message
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors});
  }
  try {
    
   const result = await cmsDao.newNameWebPage(req.body.name); 
   res.json(result);
 } catch (err) {
   res.status(503).json({ error: `Database error : ${err}` }); 
 }
});



// activate the server
const port = 3001;
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});