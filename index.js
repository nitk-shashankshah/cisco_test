var passport = require('passport');
const dbConnect = require('./dbConnect');
const express = require('express');

const session = require('express-session');
const { ExpressOIDC } = require('@okta/oidc-middleware');

var cors = require('cors');

//OpenIdConnectStrategy = require('passport-openidconnect').Strategy;

const app = express();
app.use(cors());

const bodyParser = require('body-parser');
app.use(bodyParser.json());


// session support is required to use ExpressOIDC

app.use(session({
  secret: 'this should be secure',
  resave: true,
  saveUninitialized: false
}));

const oidc = new ExpressOIDC({
  issuer: 'https://altencalsoftlabscisco.okta.com/oauth2/default',
  client_id: '0oahenukl51pXeGsN4x6',
  client_secret: 'gi1hcirTvuoO7Ed6mqslCDa7-S1HElPg1u1-Nhg5',
  redirect_uri: 'http://localhost:5000/callback',
  scope: 'openid profile'
});

// ExpressOIDC attaches handlers for the /login and /authorization-code/callback routes
app.use(oidc.router);


//app.all('*', oidc.ensureAuthenticated());

app.get('/callback', oidc.ensureAuthenticated(), (req, res) => {
  res.send(JSON.stringify(req.userContext.userinfo));
});
/*
app.get('/login', oidc.ensureAuthenticated(), (req, res) => {
    res.send(JSON.stringify(req.userContext.userinfo));
});
*/


app.get('/error', (req, res) => {
    console.log(req.body);
    res.send(
      `Oops!!! Some error occurred. Please try again....`,
    );
});

// An api endpoint that returns a short list of items
app.use('/api/getAllRouters', ensureLoggedIn,(req,res) => {
   dbConnect.getAllRouters(req,res);    
});
// An api endpoint that returns a short list of items
app.use('/api/insertRouter', ensureLoggedIn,(req,res) => {
    dbConnect.insertRouter(req,res);    
});

app.use('/api/deleteRouter', ensureLoggedIn,(req,res) => {
    dbConnect.deleteRouter(req,res);    
});

app.use('/api/telnetServer', ensureLoggedIn,(req,res) => {
    dbConnect.telnetServer(req,res);    
});

app.use('/api/listFiles', ensureLoggedIn,(req,res) => {
    dbConnect.listFiles(req,res);    
});

app.use('/api/diskUsage',  ensureLoggedIn,(req,res) => {
    dbConnect.diskUsage(req,res);    
});

app.use('/api/inodeUsage',  ensureLoggedIn,(req,res) => {
    dbConnect.diskUsage(req,res);    
});
app.use('/api/sshServer', ensureLoggedIn,(req,res) => {
    dbConnect.sshServer(req,res);    
});

app.use('/api/generate', ensureLoggedIn,(req,res) => {
  dbConnect.generate(req,res);    
});

app.use('/api/copyFiles',ensureLoggedIn,(req,res) => {
    dbConnect.copyFiles(req,res);    
  });

function ensureLoggedIn(req, res, next) {
    //if (req.isAuthenticated()) {
      return next();
    //}
    //res.redirect('/login');
}
const port = 5000;
app.listen(port);

console.log('App is listening on port ' + port);