const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
var express = require('express');
var app = express();

const path = require('path');
//const bodyParser = require('body-parser');
//const  port = process.env.PORT || 5000;
const sessionId = uuid.v4();
require("dotenv").config();



const privateKey = process.env.DIALOGFLOW_PRIVATE_KEY.replace(/\\n/g, '\n');
const email = process.env.DIALOGFLOW_EMAIL;
let config = {
	credentials: {
		private_key:privateKey,
	        client_email:email
	} 
	
}

// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;

// set the view engine to ejs
//app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true})); 

// make express look in the public directory for assets (css/js/img)
app.use(express.static(__dirname + '/bot-ui-master'));

// set the home page route
app.get('/', function(req, res) {

	// ejs render automatically looks in the views folder
	res.sendFile(__dirname, 'bot-ui-master', 'index.html');
});

app.listen(port, function() {
	console.log('Our app is running on http://localhost:' + port);
});



app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
  
    // Pass to next layer of middleware
    next();
  });

app.post('/send-msg', (req, res)=> {
    
    runSample(req.body.MSG).then(data=>{
        res.send({Reply:data})
    })
});



/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
 async function runSample(msg, projectId = 'menu-automation-hindi-uoki') {
	// A unique identifier for the given session
	
  
	// Create a new session
	const sessionClient = new dialogflow.SessionsClient(config);
	const sessionPath = sessionClient.projectAgentSessionPath(
	  projectId,
	  sessionId
	);
  
	// The text query request.
	const request = {
	  session: sessionPath,
	  queryInput: {
		text: {
		  // The query to send to the dialogflow agent
		  text: msg,
		  // The language used by the client (en-US)
		  languageCode: 'hi',
		},
	  },
	};
  
	// Send request and log result
	const responses = await sessionClient.detectIntent(request);
	console.log('Detected intent');
	const result = responses[0].queryResult;
	console.log(`  Query: ${result.queryText}`);
	console.log(`  Response: ${result.fulfillmentText}`);
	if (result.intent) {
	  console.log(`  Intent: ${result.intent.displayName}`);
	} else {
	  console.log('  No intent matched.');
	}
	return result.fulfillmentText ;
  }
  
