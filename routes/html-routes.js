// load dependencies
var path = require('path');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
// load helpers
var lbryApi = require('../helpers/lbryApi.js');
var queueApi = require('../helpers/queueApi.js');

// helper functions
function createPublishObject(req){
	var publishObject = {
		"method":"publish", 
		"params": {
			"name": req.body.name,
			"file_path": req.files.file.path,
			"bid": 0.1,
			"metadata":  {
				"description": req.body.description,
				"title": req.body.title,
				"author": req.body.author,
				"language": req.body.language,
				"license": req.body.license,
				"nsfw": (req.body.nsfw.toLowerCase() === "true")
			}
		}
	};
	return publishObject;
}

// routes to export
module.exports = function(app){
	// route to fetch one free public claim 
	app.get("/favicon.ico", function(req, res){
		console.log(" >> GET request on favicon.ico");
		res.sendFile(path.join(__dirname, '../public', 'favicon.ico'));
	});
	// route to publish a new claim
	app.post("/publish", multipartMiddleware, function(req, res){
		console.log(" >> POST request on /publish");
		// build the data needed to publish the file
		var publishObject = createPublishObject(req);
		console.log("publish", publishObject);
		// post the task to the que
		queueApi.addNewTaskToQueue(JSON.stringify({
			type: 'publish',
			data: publishObject
		}));
		// respond to the client that the task has been queued
		res.status(200).sendFile(path.join(__dirname, '../public', 'publishingClaim.html'));
	});
	// route to fetch one free public claim 
	app.get("/:name/all", function(req, res){
    	var name = req.params.name;
		console.log(">> GET request on /" + name + " (all)");
		lbryApi.serveAllClaims(name, res);
	});
	// route to fetch one free public claim 
	app.get("/:name/:claim_id", function(req, res){
		console.log(">> GET request on /" + req.params.name + "#" + req.params.claim_id);
		res.status(200).sendFile(path.join(__dirname, '../public', 'claim.html'));
	});
	// route to fetch one free public claim 
	app.get("/:name", function(req, res){
    	var name = req.params.name;
		console.log(">> GET request on /" + name)
		// send page (includes a socket to get the file)
		res.status(200).sendFile(path.join(__dirname, '../public', 'claim.html'));
	});
	// route for the home page
	app.get("/", function(req, res){
		res.sendFile(path.join(__dirname, '../public', 'index.html'));
	});

	// a catch-all route if someone visits a page that does not exist
	app.use("*", function(req, res){
		res.sendFile(path.join(__dirname, '../public', 'fourOhfour.html'));
	});
}
