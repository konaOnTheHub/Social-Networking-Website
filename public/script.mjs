function eraseText(idOfForm) {
    document.getElementById(idOfForm).reset();
}

function clearPostTextArea () {
    document.getElementById("usrPost").value = "";
}

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
    let usrPostJSON = JSON.stringify({postContents : usrPost})
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
async function checkIfLoggedIn() {
    try {
        const response = await fetch("/M00871555/login")

        if (response.ok) {
            let responseData = await response.json();


            if (responseData.userLogged == 0) {
                switchMainPage(0);
            } else if (responseData.userLogged == 1) {
                switchMainPage(1);

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
