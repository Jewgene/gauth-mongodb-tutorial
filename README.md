# gauth-mongodb-tutorial
A tutorial created to demonstrate development of a simple login page implementing Google API for authentication and MongoDB for user storage.

## Creating a Simple User Login & Authentication service using MongoDB and Google API

**Creating a Simple User Login & Authentication service using MongoDB and Google API**

Alright. If you’re wondering how to create a system for users to login to a service and then store persistent user data, this is the tutorial for you!

I’m going to break this into three main parts.

1. Authenticating the user with Google
2. Making the NodeJS server
3. Creating the MongoDB server

I’ll break these up a bit more as we work through them.

Keep in mind that I’m assuming you have a basic knowledge of html/css/javascript so if I drop down code that you don’t understand, please go and figure out what it means before you continue. It will make this easier for both of us in the long run.

## Authenticating the user with Google

### Creating API Key

First, you’re going to need to login with your (or your organization's) Google account and create a new project. [Link to console...](https://console.developers.google.com/apis/library) Give it a name, and make sure to note the project ID (it may have some alphanumeric parts depending on your project’s name.)

![alt text](https://github.com/NathanJewell/gauth-mongodb-tutorial/tree/master/tutorial/images/screencap1.png)

Once you’ve made the project, you need to generate a for authenticating the authentication of your users with Google’s servers. Go to the credentials tab then the “OAuth consent screen” tab - you will have to enter a “Product name shown to users” before creating the key.  Then go back to the “Credentials” tab and click Create credentials -> OAuth Client ID.

![alt text](https://github.com/NathanJewell/gauth-mongodb-tutorial/tree/master/tutorial/images/screencap2.png)

You should be prompted with a screen. Fill in the options as shown to the left. It is important to specify the javascript origin and redirect url so that our NodeJS server will be authorized to communicate with the project.  If you run your server on a different host, make sure this matches the domain you are using.

### Login Screen

Now onto some coding! 


For our purposes, all we need is the Google login box and perhaps a popup to let them know they successfully logged in. In a real-world application, you may want more embellishments, but for our purposes, this will do just fine.

#### HTML
The full code is in the /client/login.html file in the github repo, but I’ll just go over the most important sections here. I’ll list some code then put some explanations and clarifications.

```html
<head>
    <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet" type="text/css">
    <link rel="stylesheet" type="text/css" href="login.css">
    <meta name="google-signin-client_id" content="480527435971-nuitcq6p2in3rssd85o2edmo36g0erm7.apps.googleusercontent.com">
    <title>GAuth Tutorial</title>
  </head>
```
I’m including the “Roboto” font, a font provided and commonly used by Google services, to display any text I may want.


I then reference the stylesheet.  I won’t talk about mine in this tutorial (it’s minimal to say the least) but feel free to look at the code on github if you want somewhere to start from.


The <meta> tag is where all the magic happens. “name” should always be “google-signin-client_id” so Google’s code can properly identify the key. 


The “content”, however, will be different for your application than it is for mine. The content is the OAuth ClientID key that you generated before and is found in the Google API Console. Copy and paste that into the content section so your users can login.

![alt text](https://github.com/NathanJewell/gauth-mongodb-tutorial/tree/master/tutorial/images/screencap3.png)

Now we write a bit of code to create the login button. Keep in mind, Google has specific guidelines about how their button should look, so make sure to follow those if you want to modify the size/border/etc.. [Branding Guidelines](https://developers.google.com/identity/branding-guidelines)

```html
<body> 
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js"></script>

    <h1 id="title">GAuth Tutorial</h1>
    <div id="myg-signin2"></div>
    <script>
          function onFailure(error) {
            console.log(error);
          }
          function onSignIn(){}
          function renderButton() {
            gapi.signin2.render('myg-signin2', {
              'scope': 'profile email',
              'width': 240,
              'height': 50,
              'longtitle': true,
              'theme': 'dark',
              'onsuccess': onSignIn,
              'onfailure': onFailure
            });
          }
    </script>
    
    <script src="https://apis.google.com/js/platform.js?onload=renderButton" async defer></script>
    <script src="login.js"></script>
</body>
```
I create a “myg-signin2” div to put the signing button in.


Then, in the script tag, I declare a failure function in case there’s an error and predeclare the onSignIn() method which will later be defined in the .js file.


Then I define the renderButton() function method which will be called once the Google login platform script loads and create the button. 


We then load the Google platform using the async and defer keywords to ensure it doesn’t load until the html has been parsed but can be downloaded simultaneously.


Finally, we link the the login.js script so we can send data to the server and define the onSignIn() method.

#### Javascript

```javascript
function request(json, successCallback, errorCallback) {    //function to make ajax request to NodeJS server
    $.ajax({
        url: "http://localhost:8080/rest",  //this is where the NodeJS Server is listening for requests
        type: "POST",
        data: JSON.stringify(json),         //stringifying the JSON object to send as data
        async: true,                        //make sure to be async so we don't stall any other page functionality
        success: successCallback,           //setting callbacks .....
        error: errorCallback
    })
}
```
This is just a quick and dirty wrapper for an AJAX json POST request.

```javascript
function onSignIn(googleUser) {                 //once a user login is detected
    var auth2 = gapi.auth2.getAuthInstance();   //getting an instance of the authenticator.
    if(auth2.isSignedIn.get()) {                //check that the user actually signed in again
        var id_token = googleUser.getAuthResponse().id_token;   //access basic user profil information and find the token for verification
        var tokenJson = {event : "gapiverify", token : id_token};   //creating request to node server to authenticate token
        //we only send the token so an intercepted packet would be difficult to gain useful information from


        request(tokenJson, function(data) {     //making request
            var dataJSON = JSON.parse(data);    //parsing returned data
            if(dataJSON.success) {              //if the server successfully authenticated the token and added user to db let em know
                alert("Added to online list of users!!");
            } else {                            //otherwise.... :(
                alert("Malfunction when adding user!!!");
            }
        }, function(err) {
            console.log(err);   //if for some reason the server returns improper information then let someone know
        })
    }
    auth2.isSignedIn.listen(signinChanged); //setup a listener to check status of current user
    auth2.currentUser.listen(userChange);   //listen for a new user logging in
}


function userChange() {
    //pretending like this doesn't matter for simplicities sake
}
function signinChanged() {
    //pretending like this also doesn't matter for simplicities sake
}
```
You’re gonna have to read the comments here. They should be pretty telling :)


In summary .... 
We’re waiting until the user logs in, getting an instance of Google authorization. Double checking the login status and then giving the server the token to do some processing and give the user a result. Finally, we set up listeners (that don’t do anything yet) for possible changes in user signin status.


This covers the basic login functionality but we need to do some more work to make sure the user is really who they say they are.


###### *Enter* **NodeJS**.

## Making the NodeJS Server

The reasons for having a server are threefold.

1. Google cannot create a signin button without the webpage being hosted for security reasons.
2. Easy libraries exist to authenticate token from server
3. Communicating directly with database from client is a bad idea

Install node from the NodeJS website or as a Linux package. Make sure you can run it from command line. 

### npm packages

First make a package.json file for node package manager (npm) to find and install packages from.

```json
{
    "name" : "guath-tutorial-server",
    "description" : "Server for this tutorial demonstrating GAuth Login/Authentication and user storage.",
    "version" : "1.0.0",
    "url" : "https://github.com/NathanJewell/gauth-mongodb-tutorial",
    "author" : {"name" : "Nathan Jewell"},
    "license" : "MIT",
    "dependencies" :
    {
        "http" : "latest",
        "querystring" : "latest",
        "request" : "latest",
        "express" : "latest",
        "googleapis" : "latest",
        "google-id-token-verifier": "latest",
        "mongodb" : "latest"
    }
}
```

Mine looks like this, but you may want to change some of the optional items like “url” and “author” to something a little more applicable to yourself. You probably aren’t me.
Then create the server.js file. This is the most complicated code we’re gonna be working with so buckle up buckaroo. 

### MongoDB Wrapper

```javascript
var url = 'mongodb://localhost:27017/gauth-tut';  //this is where the local database will be hosted. 27017 is the default port and gauth-tut will be the name of the database


function mongo() {  //quick wrapper for improving usability of database connection.
    return mongoClient.connect(url);
}


This is pretty simple. It hardcoded the url for the database and gives a utility function.

### Google token authentication 

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
```

This function sends a request to Google’s servers with the token and client ID (same thing from the CLIENT). If everything is in order, it will return an object with all of the basic profile info. 

### Basic server functionality
```javascript
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
	.....verification function ---- see next code block
    }
}
app.use("/", express.static(__dirname + "/../client")); //serving static
app.post("/rest", listener);                            //serving api


app.listen(PORT, function() {                           //start the server
  console.log("Server listening on " + PORT);
})
```

I use the express library to setup a quick static server and define the port. 
The listener function waits until it sees a request and then reads the data into a string.
The string can then be parsed to json and used to authenticate. 
The “app.use” line uses express library to quickly setup static html hosting that mirrors directory setup.
“App.post” tells the server to listen on /rest for incoming post requests

### Listener Function
```javascript
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
```

This first verifies the token, which we explained before. Assuming that works, a connection to the database is established. We check for users with the same ID as the user who is currently signing in. If they don’t exist, we add the user to the database.


A lot of complications arise from the asynchronous nature of Node. So when modifying code, keep that in mind.


Remember to run “npm install” in the directory with your server.js and package.json before running your node server.

## Running the MongoDB Server

This too will be locally hosted server.


Download MongoDB and install it. Make sure you can run it from the command line.


If you have not worked with it before, essentially, MongoDB stores data in a json-like format. Data can be queried to pull specific entries from the table. We are using only a very small portion of the capability in Mongo for the purpose of this tutorial.


Create a database/data/db folder in your project. Run the MongoDB server using the mongod --dbpath database/data/db command (this will point it to save the database to the folder you just made.) 


Once the server is running, you can start the node server, navigate to localhost:8080 and test your function login solution.


Happy programming, and let me know if something doesn’t work or is confusing. I will try my best to get back to you.














