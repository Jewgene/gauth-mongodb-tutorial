var http = require('http');
var qs = require('querystring');
var request = require('request');
var express = require('express');
var verifier = require('google-id-token-verifier');
var mongoClient = require("mongodb").MongoClient;
var assert = require("assert");







//INITIALIZING MONGODB
<<<<<<< HEAD
var url = 'mongodb://localhost:27017/gauth-tut';  //this is where the local database will be hosted. 27017 is the default port and gauth-tut will be the name of the database
=======
var url = 'mongodb://localhost:27017/reservationator';  //this is where the local database will be hosted. 27017 is the default port and reservationator will be the name of the database
>>>>>>> 6d8f697c0246c3858343b9a8c04149d03756c5ce

function mongo() {  //quick wrapper for improving usability of database connection.
    return mongoClient.connect(url);
}

//TOKEN VERIFICATION!
// app's client IDs to check with audience in ID Token.
var clientId = '480527435971-nuitcq6p2in3rssd85o2edmo36g0erm7.apps.googleusercontent.com';
function verifyUserToken(token) {       //return a user with basic info
    return new Promise(function(fullfill, reject) {     //using a promise because of async
        request({   //making api call for google authentication
            url : "https://www.googleapis.com/oauth2/v3/tokeninfo?id_token="+token, //sending request to Google's servers to check authentication
            method : "POST",
            async : false
        }, function(error, response, body) {
            var bodyJSON = JSON.parse(body);
            console.log("Verifying token");
            if(!bodyJSON.aud) {
                reject("Something was wrong with the token...");
            } if(bodyJSON.aud == clientId) {
                bodyJSON["verified"] = true;
                fullfill(bodyJSON);
            } else {
                fullfill({verified : false});
            }

        })
    })
}

var app = express();//the app is the server

const PORT = 8080;  //incoming http PORT

//BIG API LISTENER FUNCTION
function listener(request, response) {
    console.log("Request recieved...");
    var body = []
    request.on('data', function(data) {
        body += data;
    });
    request.on('end', function() {
        console.log("Data recieved...");

        var json = JSON.parse(body);        //json > text
        if (json.event == "gapiverify") {       //make sure the request is trying to verify the token
            var resJSON = {verified : false};   //initialize json response object
            verifyUserToken(json.token).then( (user) => {   //verify token with google api
                if (user.verified) {
                    resJSON.success = true;         //it worked so change status to success
                    mongo().then(function(db) {     //create connection with database
                        db.collection("users").find({googleID : user.sub}).toArray(function(err, result) {  //try to get a user with the id# so there is no duplicate
                            if(err) {
                                console.log("Error adding user to database!" + "\nERR: " + err); //give the error
                                resJSON.success = false; //nvm it didn't work
                            }
                            else if (!result.length) {              //if no user was found with that googleID
                                db.collection("users").insertOne(   //add a user with basic info
                                    {
                                        first_name : user.given_name,
                                        last_name : user.family_name,
                                        googleID : user.sub,
                                        groups : []
                                    });
                            }
                            response.end(JSON.stringify(resJSON));
                        });
                    });
                }
            }, (err) => {
                console.log("User token verification failed!!");
                response.end(JSON.stringify(resJson));
            });
        }
    })
}

app.use("/", express.static(__dirname + "/../client")); //serving static
app.post("/rest", listener);                            //serving api




app.listen(PORT, function() {                           //start the server
  console.log("Server listening on " + PORT);
})
