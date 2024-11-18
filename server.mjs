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

let users = [];

//instert function
async function insertOne(data) {
    const result = await collection.insertOne(data);
    console.log(result);
}

//insertOne();

//register post
app.post("/M00871555/users", (req, res) => {
    const data = req.body;
    insertOne(data);
    
    res.send(JSON.stringify({ "Registration": "Data Received" }));
});
//checks login through get
app.get("/M00871555/login", (req, res) => {
    console.log("get login called")
    if (logStatus == 0) {
        res.send(JSON.stringify({ "userLogged": "0" }))
    } else if (logStatus == 1) {
        res.send(JSON.stringify({ "userLogged": "1" }))
    }

})

app.listen("5555")
console.log("Express listening on port 5555");

