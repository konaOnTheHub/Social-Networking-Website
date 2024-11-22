
function switchLoginSignup(n) {
    let logObject = document.getElementById("login");
    let regObject = document.getElementById("register");
    let regFormObj = document.getElementById("registerForm");
    let responseAlertReg = document.getElementById("responseAlertReg");
    // switch to signup form
    if (n == 0) {
        logObject.style.display = "none";
        regObject.style.display = "unset";
        regFormObj.reset();
        responseAlertReg.innerHTML = ''
        // switch to login form
    } else if (n == 1) {
        regObject.style.display = "none";
        logObject.style.display = "unset";
    }


};

function switchMainPage(n) {
    let mainPgObject = document.getElementById("mainPage");
    let logPgObject = document.getElementById("loginPage");
    //switch to mainpage from login
    if (n == 1) {
        logPgObject.style.display = "none";
        mainPgObject.style.display = "unset";
    } else if (n == 0) { //switch to login from mainpage
        mainPgObject.style.display = "none";
        logPgObject.style.display = "unset";
    }
};

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
            const output = await response.json();
            console.log(output);
            if (output.Registration == "Error") {
                responseAlertDiv.innerHTML = '<div class="alert alert-danger"><strong>Error</strong> ' + output.ErrorMsg + '</div>';
            } else if (output.Registration == "Success") {
                responseAlertDiv.innerHTML = '<div class="alert alert-success"><strong>Success</strong> Would you like to <a href="javascript:switchLoginSignup(1)" class="alert-link">Sign In</a>?</div>';
            }
        }
        catch (err) {
            console.log("Error: " + err);
        }
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
            console.log("HTTP Error " + response.status)
        }

    }
    catch (err) {
        console.log("Error")
    }

};
