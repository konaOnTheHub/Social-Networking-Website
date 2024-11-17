import express from 'express';
import bodyParser from 'body-parser';
import expressSession from 'express-session';

let logStatus = 0;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(
    expressSession({
        secret: "asdf123",
        cookie: {maxAge: 60000},
        resave: false,
        saveUninitialized: true

    })
)

let users = [];


app.post("/M00871555/users", (req, res)=>{
    const data = req.body;
    console.log(data);
    res.send(JSON.stringify({"Registration" : "Data Received"}));
});
//checks login through get
app.get("/M00871555/login", (req, res)=> {
    console.log("get login called")
    if (logStatus == 0) {
        res.send(JSON.stringify({"userLogged" : "0"}))
    } else if (logStatus == 1) {
        res.send(JSON.stringify({"userLogged" : "1"}))
    }

})

app.listen("5555")
console.log("Express listening on port 5555");

