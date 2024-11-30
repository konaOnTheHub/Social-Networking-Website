function eraseText(idOfForm) {
    document.getElementById(idOfForm).reset();
}

function clearPostTextArea() {
    document.getElementById("usrPost").value = "";
}
    
$('html').click(function(e) {
    if (!$ (e.target).parents('#searchBar').length > 0) {
        if ($('#searchInput').hasClass("show")) {
            $('#queryResults').empty();
            $('.dropDownText').show();
        }
    }
})

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

async function login() {
    let emailVal = document.getElementById("logEmail").value;
    let pwdVal = document.getElementById("logPwd").value;

    let responseAlertDiv = document.getElementById("responseAlertLog");
    let loginData = JSON.stringify({ email: emailVal, pwd: pwdVal });

    if (emailVal == "" || pwdVal == "") {
        responseAlertDiv.innerHTML = '<div class="alert alert-danger"><strong>Error</strong> All fields must be filled out</div>'
    } else {
        try {
            const response = await fetch("/M00871555/login", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: loginData
            });
            if (response.ok) {
                const output = await response.json();
                console.log(output);
                if (output.Login == "Error") {
                    responseAlertDiv.innerHTML = '<div class="alert alert-danger"><strong>Error</strong> ' + output.ErrorMsg + '</div>';
                } else if (output.Login == "Success") {
                    checkIfLoggedIn();

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

async function logout() {
    try {
        const response = await fetch("/M00871555/login", {
            method: "DELETE"
        });
        if (response.ok) {
            const output = await response.json();
            if (output.Logout == "Error") {
                console.log("Error with logout request");
            } else if (output.Logout == "Success") {
                checkIfLoggedIn();
            }
        } else {
            console.log("HTTP Error " + response.status);
        }
    }
    catch (err) {
        console.log("Error: " + err);
    }
}
async function register() {
    let emailVal = document.getElementById("regEmail").value;
    let pwdVal = document.getElementById("regPwd").value;
    let usrnmVal = document.getElementById("regUsername").value;

    let responseAlertDiv = document.getElementById("responseAlertReg");
    let userData = JSON.stringify({ email: emailVal, usrnm: usrnmVal, pwd: pwdVal });

    if (emailVal == "" || pwdVal == "" || usrnmVal == "") {
        responseAlertDiv.innerHTML = '<div class="alert alert-danger"><strong>Error</strong> All fields must be filled out</div>'
    } else {
        try {
            const response = await fetch("/M00871555/users", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: userData
            });
            if (response.ok) {
                const output = await response.json();
                console.log(output);
                if (output.Registration == "Error") {
                    responseAlertDiv.innerHTML = '<div class="alert alert-danger"><strong>Error</strong> ' + output.ErrorMsg + '</div>';
                } else if (output.Registration == "Success") {
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

async function createPost() {
    responseAlertPost = document.getElementById("responseAlertPost");

    let usrPost = document.getElementById("usrPost").value;
    let usrPostJSON = JSON.stringify({ postContents: usrPost })
    try {
        const response = await fetch("/M00871555/contents", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: usrPostJSON
        });
        if (response.ok) {
            const output = await response.json();
            console.log(output);
            if (output.Createpost == "Error") {
                console.log("Error: " + output.ErrorMsg);
            } else if (output.Createpost == "Success") {
                console.log("Post created successfully");
                $('#postModal').modal('hide');
                responseAlertPost.innerHTML = '<div class="alert alert-success"><strong>Post created successfully</strong></div>';
                setTimeout(function () {
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

async function loadFeedFollowing() {
    try {
        const response = await fetch("/M00871555/contents");
        if (response.ok) {
            const output = await response.json();
            followingPosts = output.Posts;
            let hourInMs = 60 * 60 * 1000
            let dayInMs = 1000 * 60 * 60 * 24
            for (let i = 0; i < followingPosts.length; i++) {
                let date = new Date(followingPosts[i].date)
                if ((new Date() - date) < hourInMs) {
                    let minutes = Math.floor(((new Date() - date) / 1000) / 60);
                    minutes += "m"
                    let cardDate = minutes
                    let postCard = "<div class='card border-primary mb-3 post'><div class='card-header'><p id='unameP' class='card-text'>" + followingPosts[i].author + "</p><p class='card-text' id='dateP'>" + cardDate + "</p>" + "</div><div class='card-body'><p class='card-text'>" + followingPosts[i].body + "</p></div></div>"
                    $("#spacer").append(postCard);
                } else if ((new Date() - date) < dayInMs) {
                    let hours = Math.floor(((new Date() - date) / 1000) / 60 / 60);
                    hours += "h";
                    let cardDate = hours;
                    let postCard = "<div class='card border-primary mb-3 post'><div class='card-header'><p id='unameP' class='card-text'>" + followingPosts[i].author + "</p><p class='card-text' id='dateP'>" + cardDate + "</p>" + "</div><div class='card-body'><p class='card-text'>" + followingPosts[i].body + "</p></div></div>"
                    $("#spacer").append(postCard);
                } else {
                    let year = date.getUTCFullYear();
                    let month = date.getUTCMonth() + 1;
                    let day = date.getUTCDate();
                    let cardDate = year + "/" + month + "/" + day;
                    let postCard = "<div class='card border-primary mb-3 post'><div class='card-header'><p id='unameP' class='card-text'>" + followingPosts[i].author + "</p><p class='card-text' id='dateP'>" + cardDate + "</p>" + "</div><div class='card-body'><p class='card-text'>" + followingPosts[i].body + "</p></div></div>"
                    $("#spacer").append(postCard);
                }
            };
        } else {
            console.log("HTTP Error: " + response.status);
        }



    } catch (err) {
        console.log("Error: " + err);
    }
}
async function checkIfLoggedIn() {
    try {
        const response = await fetch("/M00871555/login")

        if (response.ok) {
            let responseData = await response.json();


            if (responseData.userLogged == 0) {
                switchMainPage(0);
            } else if (responseData.userLogged == 1) {
                //GLOBAL VARIABLE
                loggedUsr = responseData.username;
                switchMainPage(1);
                loadFeedFollowing();

            };
            console.log(responseData);

        } else {
            console.log("HTTP Error " + response.status);
        }

    }
    catch (err) {
        console.log("Error:" + err);
    }

};

async function searchUsers() {
    let inputVal = $("#searchInput").val();
    const url = ("/M00871555/users/search?" + new URLSearchParams({ q: inputVal }).toString());
    try {
        const response = await fetch(url)

        if (response.ok) {
            const userFollowing = await getFollowing();
            let responseData = await response.json();
            if (responseData.Search == "Success") {
                $(".dropDownText").hide();
                for (let i = 0; i < responseData.Query.length; i++) {
                    if (userFollowing.includes(responseData.Query[i].usrnm)) {
                        $("#queryResults").append('<div class="queryContainer"><p style="display: inline-block;">' + responseData.Query[i].usrnm + '</p><button type="button" onclick="unfollow(' + "'" + responseData.Query[i].usrnm + "'" + ')" class="btn btn-outline-danger btn-sm" style="float: inline-end; width: 80px;">Unfollow</button></div>')
                    } else if (responseData.Query[i].usrnm == loggedUsr) {
                        $("#queryResults").append('<div class="queryContainer"><p style="display: inline-block;">' + responseData.Query[i].usrnm + '</p></div>')
                    } else {
                        $("#queryResults").append('<div class="queryContainer"><p style="display: inline-block;">' + responseData.Query[i].usrnm + '</p><button type="button" onclick="follow(' + "'" + responseData.Query[i].usrnm + "'" + ')" class="btn btn-outline-primary btn-sm" style="float: inline-end; width: 80px;">Follow</button></div>')
                    }
                }
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

async function follow(user) {
    const requestBody = JSON.stringify({"user" : user})
    try {
        const response = await fetch("/M00871555/follow", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: requestBody
        });
        if (response.ok) {
            const followingRes = await response.json();
            if (followingRes.Follow == "Error") {
                console.log(followingRes.ErrorMsg)
            } else if (followingRes.Follow == "Success") {
                $("#searchInput").dropdown('toggle');
                $('#queryResults').empty();
                $('.dropDownText').show();
                responseAlertPost.innerHTML = '<div class="alert alert-success"><strong>You are now following '+user+'</strong></div>';
                setTimeout(function () {
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

async function unfollow(user) {
    const requestBody = JSON.stringify({"user" : user})
    try {
        const response = await fetch("/M00871555/follow", {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json'
            },
            body: requestBody
        });
        if(response.ok) {
            const unfollRes = await response.json();
            if (unfollRes.Unfollow == "Error") {
                console.log(unfollRes.ErrorMsg)
            } else if (unfollRes.Unfollow == "Success") {
                $("#searchInput").dropdown('toggle');
                $('#queryResults').empty();
                $('.dropDownText').show();
                responseAlertPost.innerHTML = '<div class="alert alert-success"><strong>You have unfollowed '+user+'</strong></div>';
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

async function getFollowing() {
    try {
        const response = await fetch("/M00871555/getFollowing");
        if (response.ok) {
            let responseData = await response.json();
            if (responseData.getFollowing == "Error") {
                return responseData.ErrorMsg
            } else if (responseData.getFollowing == "Success") {
                let following = responseData.Query;
                return following
            }
        } else {
            console.log("HTTP Error: " + response.status);
        }
    } catch (err) {
        console.log("Error: " + err);
    }
}