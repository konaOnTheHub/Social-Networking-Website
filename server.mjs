import express from 'express';
import bodyParser from 'body-parser';
import expressSession from 'express-session';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';


const connectionUri = "mongodb://localhost:27017/?retryWrites=true&w=majority";


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(
    expressSession({
        secret: "asdf123",
        cookie: { maxAge: 600000000 },
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
const postCollection = database.collection("posts");

//insert function for mongoDB
async function insertOne(data) {
    const result = await collection.insertOne(data);

}

async function findDuplicate(data, type) {
    const query = { [type]: data };
    const result = await collection.find(query).toArray();
    return result;

};

async function findUser(email, password) {
    const query = { $and: [{ "email": email }, { "pwd": password }] };
    const result = await collection.find(query).toArray();
    return result;
};

async function insertPost(postContents, author) {
    const postData = {
        author: author,
        body: postContents,
        date: new Date()
    };
    const result = await postCollection.insertOne(postData);
    console.log(result);
}

async function findDuplicateFollowing(loggedUsr, usrToBeFollowed) {
    const query = { $and: [{ "usrnm": loggedUsr }, { "following": usrToBeFollowed }] }
    const result = await collection.find(query).toArray();
    return result;
};

async function pushToFollowing(loggedUsr, usrnmOfFollowing) {
    const result = await collection.updateOne(
        { usrnm: loggedUsr },
        { $push: { following: usrnmOfFollowing } }
    );
    console.log(result);
}

async function findPosts(following) {
    const query = { author: { $in: following } };
    const projection = { _id: 0, author: 1, body: 1 };
    const sort = { date: -1 };
    const result = await postCollection.find(query).sort(sort).project(projection).toArray();
    console.log("findPosts result: " + JSON.stringify(result));
    return result;
};
async function findFollowing(loggedUser) {
    const query = { usrnm: loggedUser };
    const projection = { _id: 0, following: 1 };
    const result = await collection.find(query).project(projection).toArray();
    console.log("findFollowing result: " + JSON.stringify(result));
    return result;

}
//register post
app.post("/M00871555/users", (req, res) => {
    const data = req.body;
    data.following = [];
    let valEmail = data.email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );


    (async () => {
        let emailReturn = await findDuplicate(data.email, "email");
        let usernmReturn = await findDuplicate(data.usrnm, "usrnm");

        if (valEmail) {
            if (emailReturn.length == 0) {
                if (usernmReturn.length == 0) {
                    res.send(JSON.stringify({ "Registration": "Success" }));
                    insertOne(data);
                } else {
                    res.send(JSON.stringify({ "Registration": "Error", "ErrorMsg": "Username already exists" }));
                }
            } else {
                res.send(JSON.stringify({ "Registration": "Error", "ErrorMsg": "Email already exists" }));
            }
        } else {
            res.send(JSON.stringify({ "Registration": "Error", "ErrorMsg": "Email format is invalid" }));
        }
    })();
});
//checks if there is a logged in user through get
app.get("/M00871555/login", (req, res) => {
    if (!("username" in req.session)) {
        res.send(JSON.stringify({ userLogged: "0" }));
    } else {
        res.send(JSON.stringify({ userLogged: "1", "username": req.session.username }));
    };

});
//login post
app.post("/M00871555/login", (req, res) => {
    const data = req.body;
    (async () => {
        let user = await findUser((data.email), (data.pwd));
        if (user.length == 0) {
            res.send(JSON.stringify({ "Login": "Error", "ErrorMsg": "Wrong email or password" }));
        } else {
            req.session.username = user[0].usrnm;
            res.send(JSON.stringify({ "Login": "Success" }));
        };
    })();

});
//Logout delete
app.delete("/M00871555/login", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            res.send(JSON.stringify({ "Logout": "Error" }));
        } else {
            res.send(JSON.stringify({ "Logout": "Success" }));
        };
    });
});
//Post POST request
app.post("/M00871555/contents", (req, res) => {
    const data = req.body;
    if (!("username" in req.session)) {
        res.send(JSON.stringify({ "Createpost": "Error", "ErrorMsg": "Not logged in" }))
    } else {
        insertPost(data.postContents, req.session.username);
        res.send(JSON.stringify({ "Createpost": "Success" }))
    }
});
//post GET
app.get("/M00871555/contents", (req, res) => {
    const data = req.body;
    if (!("username" in req.session)) {
        res.send(JSON.stringify({ "RetrievePost": "Error", "ErrorMsg": "Not logged in" }))
    } else {
        if (data.queryFor == "Self") {
            (async () => {
                let selfArray = [];
                selfArray.push(req.session.username);
                const posts = await findPosts(selfArray);
                res.send(JSON.stringify({ "RetrievePost": "Success", "Posts": posts }));
            })();
        } else if (data.queryFor == "Following") {
            (async () => {
                const following = await findFollowing(req.session.username);
                const posts = await findPosts(following[0].following);
                res.send(JSON.stringify({ "RetrievePost": "Success", "Posts": posts }));
            })();

        } else {
            res.send(JSON.stringify({ "RetrievePost": "Error", "ErrorMsg": "Invalid query" }));
        }
    }
});
//follow POST
app.post("/M00871555/follow", (req, res) => {
    const data = req.body;
    if (!("username" in req.session)) {
        res.send(JSON.stringify({ "Follow": "Error", "ErrorMsg": "Not logged in" }))
    } else {
        if (data.user == req.session.username) {
            res.send(JSON.stringify({ "Follow": "Error", "ErrorMsg": "Cannot follow yourself" }))
        } else {
            (async () => {
                let loggedUser = await findDuplicate(req.session.username, "usrnm")
                let toFollowUsr = await findDuplicate(data.user, "usrnm")
                let duplicateFollow = await findDuplicateFollowing(req.session.username, data.user);
                if (toFollowUsr.length == 0) {
                    res.send(JSON.stringify({ "Follow": "Error", "ErrorMsg": "The user you're trying to follow no longer exists" }))
                } else {
                    if (duplicateFollow.length > 0) {
                        res.send(JSON.stringify({ "Follow": "Error", "ErrorMsg": "You already follow " + data.user }));
                    } else {
                        await pushToFollowing(req.session.username, data.user);
                        res.send(JSON.stringify({ "Follow": "Success" }))
                    }
                }

            })();
        }
    }
})

app.listen("5555")
console.log("Express listening on port 5555");

