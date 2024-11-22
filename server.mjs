import express from 'express';
import bodyParser from 'body-parser';
import expressSession from 'express-session';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';


const connectionUri = "mongodb://localhost:27017/?retryWrites=true&w=majority";
let logStatus = 0;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(
    expressSession({
        secret: "asdf123",
        cookie: { maxAge: 60000 },
        resave: false,
        saveUninitialized: true

    })
)

const client = new MongoClient(connectionUri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true,
    }
})

const database = client.db("Tweeter");
const collection = database.collection("userdata");

//insert function for mongoDB
async function insertOne(data) {
    const result = await collection.insertOne(data);
   
}

async function findDuplicate(data, type) {
    const query = {[type] : data};
    const result = await collection.find(query).toArray();
    return result;
    
};

async function findUser (email, password) {
    const query = {$and: [{"email" : email}, {"pwd" : password}]};
    const result = await collection.find(query).toArray();
    return result;
};
//register post
app.post("/M00871555/users", (req, res) => {
    const data = req.body;
    let valEmail = data.email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );

    
    (async () => {
        let emailReturn = await findDuplicate(data.email, "email");
        let usernmReturn = await findDuplicate(data.usrnm, "usrnm");

        if (valEmail) {
            if (emailReturn.length == 0) {
                if (usernmReturn.length == 0) {
                    res.send(JSON.stringify({ "Registration": "Success"}));
                    insertOne(data);
                } else {
                    res.send(JSON.stringify({ "Registration": "Error", "ErrorMsg" : "Username already exists" }));
                }
            } else {
                res.send(JSON.stringify({ "Registration": "Error", "ErrorMsg" : "Email already exists" }));
            }
        } else {
            res.send(JSON.stringify({"Registration" : "Error" , "ErrorMsg" : "Email format is invalid"}));
        }
    })();
});
//checks if there is a logged in user through get
app.get("/M00871555/login", (req, res) => {
    console.log("get login called")
    if (logStatus == 0) {
        res.send(JSON.stringify({ "userLogged": "0" }))
    } else if (logStatus == 1) {
        res.send(JSON.stringify({ "userLogged": "1" }))
    }

});
//login post
app.post("/M00871555/login", (req, res) => {
    const data = req.body;
    (async () =>{

        let user = await findUser((data.email), (data.pwd));
        console.log(user);
        if (user.length == 0) {
            res.send(JSON.stringify({"Login" : "Error", "ErrorMsg" : "Wrong email or password"}));
        } else {
            res.send(JSON.stringify({"Login" : "Success"}));
        };
    })();

});

app.listen("5555")
console.log("Express listening on port 5555");

