'use strict';

// +------------------------------------------+ //
// |               DEPENDENCIES               | //
// +------------------------------------------+ //

var express    = require('express');
var bodyParser = require('body-parser');
var morgan     = require('morgan');
var app        = express();

// +------------------------------------------+ //
// |                PARAMETERS                | //
// +------------------------------------------+ //

var PORT = process.env.DGUI_PORT || 47219;
var API_STEM = "/api"
var LIGHTS_STEM = "/lux"

// +------------------------------------------+ //
// |                   CODE                   | //
// +------------------------------------------+ //

var api = express.Router();
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));

app.use(function(req,res,next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader("Access-Control-Allow-Headers", 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    res.setHeader("Access-Control-Allow-Headers", 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, X-HTTP-Method-Override');
    res.end()
  } else {
    next();
  }
});

app.use(API_STEM,api)

var lastActive = {}
api.use(function(req,res,next){
  lastActive[req.query.deviceName]= new Date();
  next();
});

// +------------------------------------------+ //
// |                  ROUTES                  | //
// +------------------------------------------+ //

api.get('/', function(req, res){
  res.json({message: 'DGUI API dev'});
});

api.use(LIGHTS_STEM, require('./lux.js'));

app.use(express.static(__dirname+'/www/'));

app.use(function(req,res){
  if (req.originalUrl == '/') {
    res.sendFile(__dirname+'/www/control.html');
  } else {
    res.status(404).json({})
  }
})


app.listen(PORT);
console.log("DGUI up on localhost:"+PORT)
