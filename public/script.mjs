
//Function used to clear the login and reg forms
function eraseText(idOfForm) {
    document.getElementById(idOfForm).reset();
}

//Function used to clear the 'post' modals textbox
function clearPostTextArea() {
    document.getElementById("usrPost").value = "";
}

//on click function that is used to clear the search dropdown menus previous queries
$('html').click(function (e) {
    if (!$(e.target).parents('#searchBar').length > 0) {
        if ($('#searchInput').hasClass("show")) {
            $('#searchInput').val('');
            $('#queryResults').empty();
            $('.dropDownText').show();
        }
    }
})
//Switches between login and registration forms depending on n value
function switchLoginSignup(n) {
    let logObject = document.getElementById("login");
    let regObject = document.getElementById("register");

    let responseAlertReg = document.getElementById("responseAlertReg");

    let responseAlertLog = document.getElementById("responseAlertLog");
    // switch to signup form
    if (n == 0) {
        logObject.style.display = "none";
        regObject.style.display = "unset";
        eraseText("registerForm");
        responseAlertReg.innerHTML = '';
        // switch to login form
    } else if (n == 1) {
        regObject.style.display = "none";
        logObject.style.display = "unset";
        eraseText("loginForm");
        responseAlertLog.innerHTML = '';
    }


};
//Switches between login and the main feed page based on n
function switchMainPage(n) {
    let mainPgObject = document.getElementById("mainPage");
    let logPgObject = document.getElementById("loginPage");

    let logFormObj = document.getElementById("loginForm");
    let responseAlertLog = document.getElementById("responseAlertLog");
    //switch to mainpage from login
    if (n == 1) {
        logPgObject.style.display = "none";
        mainPgObject.style.display = "unset";
        $("div").remove(".post");
    } else if (n == 0) { //switch to login from mainpage
        mainPgObject.style.display = "none";
        logPgObject.style.display = "unset";
        logFormObj.reset();
        responseAlertLog.innerHTML = '';
    }
};
//Function called upon logging in, sends a post request to server
async function login() {
    let emailVal = document.getElementById("logEmail").value;
    let pwdVal = document.getElementById("logPwd").value;

    let responseAlertDiv = document.getElementById("responseAlertLog");
    let loginData = JSON.stringify({ email: emailVal, pwd: pwdVal });

    if (emailVal == "" || pwdVal == "") {
        responseAlertDiv.innerHTML = '<div class="alert alert-danger"><strong>Error</strong> All fields must be filled out</div>'
    } else {
        //TRY posting to /login/ on express
        try {
            const response = await fetch("/M00871555/login", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: loginData //where body is the login data
            });

            if (response.ok) {
                const output = await response.json();
                console.log(output);
                //If response says error throw error on client
                if (output.Login == "Error") {
                    responseAlertDiv.innerHTML = '<div class="alert alert-danger"><strong>Error</strong> ' + output.ErrorMsg + '</div>';
                } else if (output.Login == "Success") { //If login successful
                    checkIfLoggedIn(); //This function determines whether the login or feed page should be displayed

                };
            } else {
                console.log("HTTP Error " + response.status);
            }
        }
        catch (err) {
            console.log("Error: " + err);
        }
    }
};
//Logout function, sends DELETE/login request to server
async function logout() {
    try {
        const response = await fetch("/M00871555/login", {
            method: "DELETE"
        });
        if (response.ok) {
            const output = await response.json();
            if (output.Logout == "Error") {
                console.log("Error with logout request");
            } else if (output.Logout == "Success") { //If logout was successful
                checkIfLoggedIn(); //Call this function that will return user to login screen
            }
        } else {
            console.log("HTTP Error " + response.status);
        }
    }
    catch (err) {
        console.log("Error: " + err);
    }
}

//Registration function, sends POST/users to server
async function register() {
    let emailVal = document.getElementById("regEmail").value;
    let pwdVal = document.getElementById("regPwd").value;
    let usrnmVal = document.getElementById("regUsername").value;

    let responseAlertDiv = document.getElementById("responseAlertReg");
    let userData = JSON.stringify({ email: emailVal, usrnm: usrnmVal, pwd: pwdVal });
    //If either fields are empty throw error
    if (emailVal == "" || pwdVal == "" || usrnmVal == "") {
        responseAlertDiv.innerHTML = '<div class="alert alert-danger"><strong>Error</strong> All fields must be filled out</div>'
    } else {
        //Try POST/users
        try {
            const response = await fetch("/M00871555/users", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: userData //with registration data in body of message
            });
            if (response.ok) {
                const output = await response.json();
                if (output.Registration == "Error") {
                    //If error throw error to user
                    responseAlertDiv.innerHTML = '<div class="alert alert-danger"><strong>Error</strong> ' + output.ErrorMsg + '</div>';
                } else if (output.Registration == "Success") {
                    //If success throw success message to user
                    responseAlertDiv.innerHTML = '<div class="alert alert-success"><strong>Success</strong> Would you like to <a href="javascript:switchLoginSignup(1)" class="alert-link">Sign In</a>?</div>';
                }
            } else {
                console.log("HTTP Error " + response.status);
            }
        }
        catch (err) {
            console.log("Error: " + err);
        }
    }
}

//Function that is called when the user attempts to post content
async function createPost() {
    responseAlertPost = document.getElementById("responseAlertPost");

    let usrPost = document.getElementById("usrPost").value;
    let usrPostJSON = JSON.stringify({ postContents: usrPost })
    //Try to send POST/contents to server
    try {
        const response = await fetch("/M00871555/contents", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: usrPostJSON //With blog in the body of the message
        });
        if (response.ok) {
            const output = await response.json();
            if (output.Createpost == "Error") {
                console.log("Error: " + output.ErrorMsg);
            } else if (output.Createpost == "Success") { //If post has been successful
                $('#postModal').modal('hide'); //hide the modal
                responseAlertPost.innerHTML = '<div class="alert alert-success"><strong>Post created successfully</strong></div>'; //Send success response to user
                setTimeout(function () { //Function responsible for hiding the alert
                    $(".alert").fadeOut();
                }, 5000)


            }
        } else {
            console.log("HTTP Error " + response.status);
        }

    } catch (err) {
        console.log("Error: " + err);
    }
}
//Function that loads in an array of posts to the feed
async function loadInPosts(posts) {
    let hourInMs = 60 * 60 * 1000
    let dayInMs = 1000 * 60 * 60 * 24
    if (posts.length == 0) { //If there is no posts to load, load in 'Nothing to show yet'
        let postCard = "<div class='card border-primary mb-3 post'><div class='card-body'><p style='text-align: center;' class='card-text'>Nothing to show yet</p></div></div>"
        $("#spacer").append(postCard);
        return
    }
    //For loop that iterates over posts
    for (let i = 0; i < posts.length; i++) {
        let pfp = await fetchPicture(posts[i].author); //Here we fetch the profile picture of the author of the post
        let date = new Date(posts[i].date) //We create a new JS date object from the date obj from mongoDb
        if ((new Date() - date) < hourInMs) { //If the post is less than 60 minutes old
            let minutes = Math.floor(((new Date() - date) / 1000) / 60);
            minutes += "m" //Display the date of post as (x) minutes old...
            let cardDate = minutes
            //postCard is HTML code that contains everything to display a post including username, profile image, follow or unfollow button and the body of the post as well as the date
            let postCard = "<div class='card border-primary mb-3 post'><div class='card-header'><img onclick='showProfile(" + '"' + posts[i].author + '"' + ")' class='profilepost__image' src='" + pfp + "'></img><p onclick='showProfile(" + '"' + posts[i].author + '"' + ")' class='card-text unameP'>" + posts[i].author + "</p><p class='card-text dateP'>" + cardDate + "</p>" + "</div><div class='card-body'><p class='card-text'>" + posts[i].body + "</p></div></div>"
            $("#spacer").append(postCard); //append post to div with id=spacer
        } else if ((new Date() - date) < dayInMs) { //if post is < 24 hrs but more than 1 hrs old
            let hours = Math.floor(((new Date() - date) / 1000) / 60 / 60);
            hours += "h"; //Display the date of post as (x) hour old...
            let cardDate = hours;
            let postCard = "<div class='card border-primary mb-3 post'><div class='card-header'><img onclick='showProfile(" + '"' + posts[i].author + '"' + ")' class='profilepost__image' src='" + pfp + "'></img><p onclick='showProfile(" + '"' + posts[i].author + '"' + ")' class='card-text unameP'>" + posts[i].author + "</p><p class='card-text dateP' '>" + cardDate + "</p>" + "</div><div class='card-body'><p class='card-text'>" + posts[i].body + "</p></div></div>"
            $("#spacer").append(postCard);
        } else { //if post is more than 24 hrs old
            let year = date.getUTCFullYear();
            let month = date.getUTCMonth() + 1;
            let day = date.getUTCDate();
            let cardDate = year + "/" + month + "/" + day; //Display full date of post
            let postCard = "<div class='card border-primary mb-3 post'><div class='card-header'><img onclick='showProfile(" + '"' + posts[i].author + '"' + ")' class='profilepost__image' src='" + pfp + "'></img><p onclick='showProfile(" + '"' + posts[i].author + '"' + ")' class='card-text unameP'>" + posts[i].author + "</p><p class='card-text dateP' '>" + cardDate + "</p>" + "</div><div class='card-body'><p class='card-text'>" + posts[i].body + "</p></div></div>"
            $("#spacer").append(postCard);
        }
    };
}
//This loads in the feed for the 'feed' screen
async function loadFeedFollowing() {
    $(".usrProfile").hide(); //Hide profile card (if exists)
    $("div").remove(".post"); //Remove existing posts (if exists)
    $("#profileBtn").removeClass("active");
    $("#feedBtn").addClass("active");

    //Fetch 'contents' from server
    try {
        const response = await fetch("/M00871555/contents");
        if (response.ok) {
            const output = await response.json();
            followingPosts = output.Posts;
            //Call loadInPosts with response of the server
            loadInPosts(followingPosts);

        } else {
            console.log("HTTP Error: " + response.status);
        }



    } catch (err) {
        console.log("Error: " + err);
    }
}

//function called on page load. It sends GET/login to server
async function checkIfLoggedIn() {
    try {
        const response = await fetch("/M00871555/login")

        if (response.ok) {
            let responseData = await response.json();

            //If there's nobody logged in display login page
            if (responseData.userLogged == 0) {
                switchMainPage(0);
                //If there is someone logged in display 'feed' page and call function to display user's feed
            } else if (responseData.userLogged == 1) {
                //GLOBAL VARIABLE - Assign session username to 'loggedUsr'
                loggedUsr = responseData.username;
                switchMainPage(1);
                loadFeedFollowing();

            };
        } else {
            console.log("HTTP Error " + response.status);
        }

    }
    catch (err) {
        console.log("Error:" + err);
    }

};

//Function called upon searching for users
async function searchUsers() {
    let inputVal = $("#searchInput").val();
    //Assign form value to GET request's url search parameter
    const url = ("/M00871555/users/search?" + new URLSearchParams({ q: inputVal }).toString());
    try {
        //GET data from server
        const response = await fetch(url)

        if (response.ok) {
            //Get logged in user's following
            const userFollowing = await getFollowing(loggedUsr);
            let responseData = await response.json();
            //If search was successful
            if (responseData.Search == "Success") {
                $(".dropDownText").hide(); //Hide buttons in dropdown
                //For loop that iterates over queries 
                for (let i = 0; i < responseData.Query.length; i++) {
                    //Retrieve profile picture of user i
                    let pfp = await fetchPicture(responseData.Query[i].usrnm);
                    //If we follow the user in question -- have an unfollow button next to them
                    if (userFollowing.includes(responseData.Query[i].usrnm)) {
                        $("#queryResults").append('<div class="queryContainer card mb-3"><div class="card-header"><img onclick="showProfile(' + "'" + responseData.Query[i].usrnm + "'" + ')" class="profilepost__image" src="' + pfp + '"></img><p class="sUnameP card-text" onclick="showProfile(' + "'" + responseData.Query[i].usrnm + "'" + ')" style="display: inline-block;">' + responseData.Query[i].usrnm + '</p><button type="button" onclick="unfollow(' + "'" + responseData.Query[i].usrnm + "'" + ')" class="btn btn-outline-danger btn-sm" style="float: inline-end; width: 80px;">Unfollow</button></div></div>')
                    } else if (responseData.Query[i].usrnm == loggedUsr) { //If the logged in user is queried -- have no button show up next to them
                        $("#queryResults").append('<div class="queryContainer card mb-3"><div class="card-header"><img onclick="showProfile(' + "'" + responseData.Query[i].usrnm + "'" + ')" class="profilepost__image" src="' + pfp + '"></img><p class="sUnameP card-text" onclick="showProfile(' + "'" + responseData.Query[i].usrnm + "'" + ')" style="display: inline-block;">' + responseData.Query[i].usrnm + '</p></div></div>')
                    } else { //If user doesn't follow user -- have a follow button next to them
                        $("#queryResults").append('<div class="queryContainer card mb-3"><div class="card-header"><img onclick="showProfile(' + "'" + responseData.Query[i].usrnm + "'" + ')" class="profilepost__image" src="' + pfp + '"></img><p class="sUnameP card-text" onclick="showProfile(' + "'" + responseData.Query[i].usrnm + "'" + ')" style="display: inline-block;">' + responseData.Query[i].usrnm + '</p><button type="button" onclick="follow(' + "'" + responseData.Query[i].usrnm + "'" + ')" class="btn btn-outline-primary btn-sm" style="float: inline-end; width: 80px;">Follow</button></div></div>')
                    }
                }
            } else if (responseData.Search == "Fail") { //If no query is present then display no results found to user
                $(".dropDownText").hide();
                $("#queryResults").append('<p style="text-align: center;">No results found</p>')
            }
        } else {
            console.log("HTTP Error " + response.status);
        }
    } catch (err) {
        console.log("Error: " + err)
    }
}

//Function called when user decides to search for content
async function searchContent() {
    let inputVal = $("#searchInput").val();
    //Assign form value to URL search parameter
    const url = ("/M00871555/contents/search?" + new URLSearchParams({ q: inputVal }).toString());
    try {
        //Fetch data from server
        const response = await fetch(url);
        if (response.ok) {
            //Get logged in user's following
            const userFollowing = await getFollowing(loggedUsr);
            let responseData = await response.json();
            if (responseData.Search == "Success") {
                $(".dropDownText").hide(); //Hide buttons from dropdown
                //For loop that iterates over all the queried posts
                for (let i = 0; i < responseData.Query.length; i++) {
                    //Get profile picture of author of post
                    let pfp = await fetchPicture(responseData.Query[i].author);
                    if (userFollowing.includes(responseData.Query[i].author)) { //If already following -- have unfollow button next to them
                        $("#queryResults").append('<div class="queryContainer card border-primary mb-3"><div class="card-header"><img onclick="showProfile(' + "'" + responseData.Query[i].author + "'" + ')" class="profilepost__image" src="' + pfp + '"></img><p class="sUnameP card-text" onclick="showProfile(' + "'" + responseData.Query[i].author + "'" + ')" style="display: inline-block;">' + responseData.Query[i].author + '</p><button type="button" onclick="unfollow(' + "'" + responseData.Query[i].author + "'" + ')" class="btn btn-outline-danger btn-sm" style="float: inline-end; width: 80px;">Unfollow</button></div><div class="card-body"><p class="card-text">' + responseData.Query[i].body + '</p></div></div>')
                    } else if (responseData.Query[i].author == loggedUsr) { //If post is by logged in user -- have no button next to them
                        $("#queryResults").append('<div class="queryContainer card border-primary mb-3"><div class="card-header"><img onclick="showProfile(' + "'" + responseData.Query[i].author + "'" + ')" class="profilepost__image" src="' + pfp + '"></img><p class="sUnameP card-text" onclick="showProfile(' + "'" + responseData.Query[i].author + "'" + ')" style="display: inline-block;">' + responseData.Query[i].author + '</p></div><div class="card-body"><p class="card-text">' + responseData.Query[i].body + '</p></div></div>')
                    } else { //If user doesn't follow post's author -- have a follow button next to them
                        $("#queryResults").append('<div class="queryContainer card border-primary mb-3"><div class="card-header"><img onclick="showProfile(' + "'" + responseData.Query[i].author + "'" + ')" class="profilepost__image" src="' + pfp + '"></img><p class="sUnameP card-text" onclick="showProfile(' + "'" + responseData.Query[i].author + "'" + ')" style="display: inline-block;">' + responseData.Query[i].author + '</p><button type="button" onclick="follow(' + "'" + responseData.Query[i].author + "'" + ')" class="btn btn-outline-primary btn-sm" style="float: inline-end; width: 80px;">Follow</button></div><div class="card-body"><p class="card-text">' + responseData.Query[i].body + '</p></div></div>')
                    }
                }
                //If no query -- display no results found to user
            } else if (responseData.Search == "Fail") {
                $(".dropDownText").hide();
                $("#queryResults").append('<p style="text-align: center;">No results found</p>')
            }

        } else {
            console.log("HTTP Error " + response.status);
        }

    } catch (err) {
        console.log("Error: " + err)
    }
}

//Function called upon a follow button being pressed
async function follow(user) {
    const requestBody = JSON.stringify({ "user": user })
    try {
        //Send post/follow request to server
        const response = await fetch("/M00871555/follow", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: requestBody //With user being followed in request body
        });
        if (response.ok) {
            const followingRes = await response.json();
            if (followingRes.Follow == "Error") {
                console.log(followingRes.ErrorMsg)
            } else if (followingRes.Follow == "Success") { //If follow was success
                if ($("#searchInput").hasClass("show")) { //If follow was made from dropdown menu then hide it
                    $("#searchInput").dropdown('hide');
                    $('#queryResults').empty();
                    $('.dropDownText').show();
                } else { //Otherwise show the profile of the user again so that their follower count gets updated
                    showProfile(user);
                }
                //Display success alert to user
                responseAlertPost.innerHTML = '<div class="alert alert-success"><strong>You are now following ' + user + '</strong></div>';
                setTimeout(function () { //Hide alert after 5 seconds
                    $(".alert").fadeOut();
                }, 5000)
            }
        } else {
            console.log("HTTP Error: " + response.status)
        }

    } catch (err) {
        console.log("Error: " + err)
    }
}
//Function that unfollows a user
async function unfollow(user) {
    const requestBody = JSON.stringify({ "user": user })
    //Use ajax to send DELETE/follow request to server
    try {
        const response = await fetch("/M00871555/follow", {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json'
            },
            body: requestBody
        });
        //If response is fine
        if (response.ok) {
            const unfollRes = await response.json();
            //Throw error if error
            if (unfollRes.Unfollow == "Error") {
                console.log(unfollRes.ErrorMsg)
                //If success
            } else if (unfollRes.Unfollow == "Success") {
                //If follow was done from the search bar hide it
                if ($("#searchInput").hasClass("show")) {
                    $("#searchInput").dropdown('hide');
                    $('#queryResults').empty();
                    $('.dropDownText').show();
                } else {
                    //Otherwiserefresh the profile of the user so their follower count gets updates
                    showProfile(user);
                }
                //Throw success message to user
                responseAlertPost.innerHTML = '<div class="alert alert-success"><strong>You have unfollowed ' + user + '</strong></div>';
                setTimeout(function () {
                    $(".alert").fadeOut();
                }, 5000)
            }
        } else {
            console.log("HTTP Error: " + response.status);
        }
    } catch (err) {
        console.log("Error: " + err);
    }
}
//Function that retrieves following of a user, calls GET/getFollowing
async function getFollowing(user) {
    //Try to GET/getFollowing from server with username in query parameter
    try {
        const response = await fetch("/M00871555/getFollowing?" + new URLSearchParams({ user: user }).toString());
        if (response.ok) {
            let responseData = await response.json();
            if (responseData.getFollowing == "Error") {
                return responseData.ErrorMsg
            } else if (responseData.getFollowing == "Success") {
                let following = responseData.Query;
                //If successful return the list of following
                return following
            }
        } else {
            console.log("HTTP Error: " + response.status);
        }
    } catch (err) {
        console.log("Error: " + err);
    }
}
//Function that retrieves followers of a user, calls GET/getFollowers
async function getFollowers(user) {
    //Try to GET/getFollowers from server with username in query parameter
    try {
        const response = await fetch("/M00871555/getFollowers?" + new URLSearchParams({ user: user }).toString());
        if (response.ok) {
            let responseData = await response.json();
            if (responseData.getFollowers == "Error") {
                return
            } else if (responseData.getFollowers == "Success") {
                let followers = responseData.Query;
                //If successful return list of users
                return followers;
            }
        } else {
            console.log("HTTP Error: " + response.status);
        }
    } catch (err) {
        console.log("Error: " + err)
    }
}

//Function that retrieves the bio of a specific user, calls GET/getBio from server
async function getBio(user) {
    //TRY GET
    try {
        const response = await fetch("/M00871555/getBio?" + new URLSearchParams({ user: user }).toString());
        if (response.ok) {
            let responseData = await response.json();
            if (responseData.getBio == "Error") {
                console.log(responseData.ErrorMsg);
            } else if (responseData.getBio == "Success") {
                let bio = responseData.bio;
                //If successful return their bio
                return bio;
            }
        } else {
            console.log("HTTP Error: " + response.status);
        }
    } catch (err) {
        console.log("Error: " + err);
    }
}
//Function that sets the bio of a user, calls POST/setBio to server, with new bio in req body
async function setBio(bio) {
    const toSend = JSON.stringify({ "bio": bio })
    try {
        const response = await fetch("/M00871555/setBio", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: toSend
        });
        if (response.ok) {
            let responseData = await response.json()
            if (responseData.setBio == "Error") {
                return responseData.ErrorMsg;
            } else if (responseData.setBio == "Success") {
                return "Success"
            }
        } else {
            console.log("HTTP Error: " + response.status)
        }
    } catch (err) {
        console.log("Error: " + err);
    }
}
//Function that inserts user info into their profile 'card' when viewing their profile
async function populateProfileCard(posts, user) {
    $("#profileButtonContainer").empty();
    let userFollowing = await getFollowing(loggedUsr);
    //If user already follows user, insert unfollow button
    if ((userFollowing.includes(user)) && (loggedUsr != user)) {
        $("#profileButtonContainer").append('<button type="button" onclick="unfollow(' + "'" + user + "'" + ')" class="btn btn-outline-danger">Unfollow</button>');
    } else if ((!(userFollowing.includes(user))) && (loggedUsr != user)) {
        //If user doesn't follow user then insert a follow button 
        $("#profileButtonContainer").append('<button type="button" onclick="follow(' + "'" + user + "'" + ')" class="btn btn-primary">Follow</button>');
    }
    //Set username
    $("#profileUname").text(user);
    let bio = await getBio(user);
    //Set Bio
    $("#profileBio").text(bio);
    let amountFollowing = (await getFollowing(user)).length
    //Set following count
    $("#profileFollNum").text(amountFollowing);
    let amountPosts = posts.length
    //Set post count
    $("#profilePostNum").text(amountPosts);
    let amountFollowers = (await getFollowers(user)).length
    //Set follower count
    $("#profileFollowerNum").text(amountFollowers);
    //Set profile picture
    let pfp = await fetchPicture(user);
    $("#profileCardImg").attr("src", pfp);
}
//Function called upon visiting a users profile
async function showProfile(user) {
    //Remove all loaded posts
    $("div").remove(".post");
    //If viewing own profile
    if (user == loggedUsr) {
        $("#feedBtn").removeClass("active");
        $("#profileBtn").addClass("active");
        //Include an edit profile button
        $("#editProfBut").show();
        $(".profilepic__content").show();
    } else {
        //If user is not viewing their own profile
        $("#feedBtn").removeClass("active");
        $("#profileBtn").removeClass("active");
        //Hide edit profile button
        $("#editProfBut").hide();
        $(".profilepic__content").hide();
    }

    //Use AJAX to retrieve posts made by the user in question from server
    try {
        const response = await fetch("/M00871555/contents/user?" + new URLSearchParams({ user: user }).toString());
        if (response.ok) {
            const output = await response.json();
            posts = output.Posts;
            //Call load in posts function with their posts
            loadInPosts(posts);
            //Call populate profile card function with their info
            populateProfileCard(posts, user);
            $(".usrProfile").show();

        } else {
            console.log("HTTP Error: " + response.status);
        }



    } catch (err) {
        console.log("Error: " + err);
    }

}
//Edit profile function called when user saves their changes
async function editProfile() {
    currBio = await getBio(loggedUsr);
    //Let their  uploaded file equal myFile
    let myFile = $('#formFile').prop('files');
    //If the bio has changed change their bio
    if (currBio !== $("#bio").val()) {
        let setBioRes = await setBio($("#bio").val())
        if (setBioRes == "Success") {
            responseAlertPost.innerHTML = '<div class="alert alert-success"><strong>Changes saved successfully</strong></div>';
            setTimeout(function () {
                $(".alert").fadeOut();
            }, 5000)
        } else {
            responseAlertPost.innerHTML = '<div class="alert alert-danger"><strong>Error</strong> ' + setBioRes + '</div>';
            setTimeout(function () {
                $(".alert").fadeOut();
            }, 5000)
            return
        }
    }
    //If they uploaded a file
    if (myFile.length == 1) {
        const formData = new FormData();
        formData.append('myFile', myFile[0]);
        formData.append('user', loggedUsr);
        //Use AJAX to send it to server with POST/upload
        try {
            const response = await fetch("/M00871555/upload", {
                method: "POST",
                body: formData
            })
            if (response.ok) {
                const output = await response.json();
                if (output.upload == "Success") {
                    responseAlertPost.innerHTML = '<div class="alert alert-success"><strong>Changes saved successfully</strong></div>';
                    setTimeout(function () {
                        $(".alert").fadeOut();
                    }, 5000)
                } else if (output.upload == "Error") {
                    responseAlertPost.innerHTML = '<div class="alert alert-danger"><strong>Error</strong> ' + output.ErrorMsg + '</div>';
                    setTimeout(function () {
                        $(".alert").fadeOut();
                    }, 5000)
                }
            } else {
                console.log("HTTP Error: " + response.status)
            }
        } catch (err) {
            console.log("Error: " + err);
        }
    }
    //Refresh their profile page so that updates are applied
    showProfile(loggedUsr);
    $('#editProfile').modal('hide');
}
//Function that retrieves a users's profile picture from user
async function fetchPicture(user) {
    const url = ("/M00871555/getProfilePic?" + new URLSearchParams({ user: user }).toString())
    //TRY to GET/getProfilePic with username in url query parameters
    try {
        const response = await fetch(url);
        if (response.ok) {
            const imgBlob = await response.blob();
            //Create imgBase64 URL to image
            const imgBase64 = URL.createObjectURL(imgBlob);
            //return it
            return imgBase64;
        } else {
            console.log("HTTP Error: " + response.status);
        }


    } catch (err) {
        console.log("Error: " + err)
    }
}

async function changeBioInputVal() {
    $("#bio").val(await (getBio(loggedUsr)));
}