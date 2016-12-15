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
