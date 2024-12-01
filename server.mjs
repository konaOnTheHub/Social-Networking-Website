import express from 'express';
import bodyParser from 'body-parser';
import expressSession from 'express-session';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import fileUpload from 'express-fileupload';
import easyimg from 'easyimage';
import path from 'path';
import fs from 'fs';


//Initialize express and body parser
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(express.static('public'));
//Initialize express session tracking module
app.use(
    expressSession({
        secret: "asdf123",
        cookie: { maxAge: 600000000 },
        resave: false,
        saveUninitialized: true

    })
)
//Initialize mongoDb connection
const connectionUri = "mongodb://localhost:27017/?retryWrites=true&w=majority";
const client = new MongoClient(connectionUri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true,
    }
})
//We will use these variables to read and write to mongoDb
const database = client.db("Tweeter");
const collection = database.collection("userdata");
const postCollection = database.collection("posts");

//insert function for mongoDB
async function insertOne(data) {
    const result = await collection.insertOne(data);

}
//mongoDb query used later to find already existing usernames/email addresses
async function findDuplicate(data, type) {
    const query = { [type]: data };
    const result = await collection.find(query).toArray();
    return result;

};
//mongoDb query to verify login email and password
async function findUser(email, password) {
    const query = { $and: [{ "email": email }, { "pwd": password }] };
    const result = await collection.find(query).toArray();
    return result;
};
//mongoDb function that inserts a post into the 'posts' collection
async function insertPost(postContents, author) {
    const postData = {
        author: author,
        body: postContents,
        date: new Date()
    };
    const result = await postCollection.insertOne(postData);
}
//mongoDb query to make sure that the logged in user doesn't follow the same person twice
async function findDuplicateFollowing(loggedUsr, usrToBeFollowed) {
    const query = { $and: [{ "usrnm": loggedUsr }, { "following": usrToBeFollowed }] }
    const result = await collection.find(query).toArray();
    return result;
};
//Appends a new follower to user/following in mongoDb
async function pushToFollowing(loggedUsr, usrnmOfFollowing) {
    const result = await collection.updateOne(
        { usrnm: loggedUsr },
        { $push: { following: usrnmOfFollowing } }
    );
}
//function that queries posts from people in [following] from mongoDB
async function findPosts(following) {
    const query = { author: { $in: following } };
    //Returns every field besides the object id
    const projection = { _id: 0, author: 1, body: 1, date: 1 };
    //Sorts by descending date
    const sort = { date: -1 };
    const result = await postCollection.find(query).sort(sort).project(projection).toArray();
    return result;
};

//mongoDB query for a users following
async function findFollowing(loggedUser) {
    const query = { usrnm: loggedUser };
    const projection = { _id: 0, following: 1 };
    const result = await collection.find(query).project(projection).toArray();
    return result;

}

async function findFollowers(user) {
    const query = {following : user};
    const projection = {_id : 0, usrnm : 1};
    const result = await collection.find(query).project(projection).toArray();
    return result;
}

async function userSearch(search) {
    const query = { "usrnm": { $regex: search } }
    const projection = { _id: 0, usrnm: 1 }
    const result = await collection.find(query).project(projection).toArray();
    return result;
}

async function removeFollow(user, userRm) {
    const filter = { usrnm: user };
    const remove = { $pull: { following: userRm } };
    await collection.updateOne(filter, remove);
}


async function searchFile(dir, fileName) {
  // read the contents of the directory
  const files = fs.readdirSync(dir);

  // search through the files
  for (const file of files) {
    // build the full path of the file
    const filePath = path.join(dir, file);

    if (file.endsWith(fileName)) {
      // if the file is a match, print it
      return filePath;
    }
  }
  return "uploads/default.jpg";
}

//register POST
app.post("/M00871555/users", (req, res) => {
    const data = req.body;
    data.following = [];
    //email validation regex must follow x@x.x pattern
    let valEmail = data.email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );


    (async () => {
        //Query for username and email provided in the req body
        let emailReturn = await findDuplicate(data.email, "email");
        let usernmReturn = await findDuplicate(data.usrnm, "usrnm");
        //If the email is valid:
        if (valEmail) {
            //Check if email is duplicate
            if (emailReturn.length == 0) {
                //If not check if username is duplicate
                if (usernmReturn.length == 0) {
                    //If not send 'Success' response
                    res.send(JSON.stringify({ "Registration": "Success" }));
                    //Insert data provided in request to mongoDb
                    insertOne(data);
                } else {
                    //If username exists send error response
                    res.send(JSON.stringify({ "Registration": "Error", "ErrorMsg": "Username already exists" }));
                }
                //if email exists send error response
            } else {
                res.send(JSON.stringify({ "Registration": "Error", "ErrorMsg": "Email already exists" }));
            }
        } else {
            //if email is invalid send error response
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
        //query for user where email and password match
        let user = await findUser((data.email), (data.pwd));
        //if not query send error response
        if (user.length == 0) {
            res.send(JSON.stringify({ "Login": "Error", "ErrorMsg": "Wrong email or password" }));
        } else {
            //if there is send success response
            //and assign username to request session
            req.session.username = user[0].usrnm;
            res.send(JSON.stringify({ "Login": "Success" }));
        };
    })();

});
//Logout delete
app.delete("/M00871555/login", (req, res) => {
    //Destroys request's session
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
        //If not logged in send error response
        res.send(JSON.stringify({ "Createpost": "Error", "ErrorMsg": "Not logged in" }))
    } else {
        //Insert response body into mongoDB
        insertPost(data.postContents, req.session.username);
        //Send success response
        res.send(JSON.stringify({ "Createpost": "Success" }))
    }
});
//post GET -- Retrieves posts that are made by people that the user is following
app.get("/M00871555/contents", (req, res) => {
    //Login check
    if (!("username" in req.session)) {
        res.send(JSON.stringify({ "RetrievePost": "Error", "ErrorMsg": "Not logged in" }))
    } else {
        //If logged in
        (async () => {
            //Query for logged in user's following
            const following = await findFollowing(req.session.username);
            //Query for following's posts
            const posts = await findPosts(following[0].following);
            //send success response alognside with the retrieved posts
            res.send(JSON.stringify({ "RetrievePost": "Success", "Posts": posts }));
        })();

    }
});

//follow POST
app.post("/M00871555/follow", (req, res) => {
    const data = req.body;
    //Login check
    if (!("username" in req.session)) {
        res.send(JSON.stringify({ "Follow": "Error", "ErrorMsg": "Not logged in" }))
    } else { // if logged in
        //Check if user is trying to follow themselves
        if (data.user == req.session.username) {
            //if so send error response
            res.send(JSON.stringify({ "Follow": "Error", "ErrorMsg": "Cannot follow yourself" }))
        } else {
            (async () => {
                let toFollowUsr = await findDuplicate(data.user, "usrnm")
                let duplicateFollow = await findDuplicateFollowing(req.session.username, data.user);
                //If the user to be followed doesn't exist
                if (toFollowUsr.length == 0) {
                    res.send(JSON.stringify({ "Follow": "Error", "ErrorMsg": "The user you're trying to follow no longer exists" }))
                } else {
                    //If the user already follows
                    if (duplicateFollow.length > 0) {
                        res.send(JSON.stringify({ "Follow": "Error", "ErrorMsg": "You already follow " + data.user }));
                    } else {
                        //Append to user's [following] in mongoDb and send success response
                        await pushToFollowing(req.session.username, data.user);
                        res.send(JSON.stringify({ "Follow": "Success" }))
                    }
                }

            })();
        }
    }
});

app.delete("/M00871555/follow", (req, res) => {
    const data = req.body;

    if (!("username" in req.session)) {
        res.send(JSON.stringify({ "Unfollow": "Error", "ErrorMsg": "Not logged in" }))
    } else {
        if (data.user == req.session.username) {
            res.send(JSON.stringify({ "Unfollow": "Error", "ErrorMsg": "Cannot unfollow yourself" }));
        } else {
            (async () => {
                let duplicateFollow = await findDuplicateFollowing(req.session.username, data.user);
                if (duplicateFollow.length > 0) {
                    await removeFollow(req.session.username, data.user);
                    res.send(JSON.stringify({ "Unfollow": "Success" }))
                } else if (duplicateFollow.length == 0) {
                    res.send(JSON.stringify({ "Unfollow": "Error", "ErrorMsg": "You don't follow " + data.user }));
                }
            })();
        }
    }
})
//User search GET
app.get("/M00871555/users/search", (req, res) => {
    (async () => {
        //IF query parameter is empty
        if (req.query.q == "") {
            res.send(JSON.stringify({ "Search": "Fail", "Query": "No results found" }));
        } else { //otherwise query mongoDb
            let searchQ = await userSearch(req.query.q)
            if (searchQ.length == 0) { //if query from mongoDB is empty
                res.send(JSON.stringify({ "Search": "Fail", "Query": "No results found" }))
            } else {//if query is > 0 return query
                res.send(JSON.stringify({ "Search": "Success", "Query": searchQ }))
            }
        }
    })();
});
//GET request that retrieves the logged in user's following
app.get("/M00871555/getFollowing", (req, res) => {
    //If query is empty
    if (req.query.user == "") {
        res.send(JSON.stringify({ "getFollowing": "Error", "ErrorMsg": "Query is empty" }))
    } else { //if query 
        (async () => {
            const following = await findFollowing(req.query.user);
            //return following as response
            res.send(JSON.stringify({ "getFollowing": "Success", "Query": following[0].following }));
        })();
    }
});

app.get("/M00871555/getFollowers", (req, res) => {
    if (req.query.user == "") {
        res.send(JSON.stringify({"getFollowers" : "Error", "ErrorMsg" : "Query is empty"}));
    } else {
        (async () =>{
            const followers = await findFollowers(req.query.user);
            res.send(JSON.stringify({"getFollowers" : "Success", "Query" : followers}));
        })();
    }
})
//GET for posts made by a SPECIFIC user
app.get("/M00871555/contents/user", (req, res) => {
    if (req.query.user == "") {
        res.send(JSON.stringify({ "RetrievePostUser": "Error", "ErrorMsg": "Query is empty"}))
    } else {
        (async () => {
            let selfArray = [];
            selfArray.push(req.query.user);
            const posts = await findPosts(selfArray);
            res.send(JSON.stringify({ "RetrievePostUser": "Success", "Posts": posts }));
        })();
    }
})

//POST request for fileupload
app.post("/M00871555/upload", (req, res) => {
    if (!("username" in req.session)) {
        res.send(JSON.stringify({ "upload": "Error", "ErrorMsg": "Not logged in" }))
    } else if (!req.files || Object.keys(req.files).length === 0) {
        res.send(JSON.stringify({ "upload": "Error", "ErrorMsg": "Files missing" }))
    } else {
        let myFile = req.files.myFile;
        let imageFormats = [".jpeg", ".png", ".jpg"];
        if (!(imageFormats.includes(path.extname(myFile.name)))) {
            res.send(JSON.stringify({"upload" : "Error", "ErrorMsg" : "Filetype not supported"}));
        } else {
            let fileName = req.session.username + path.extname(myFile.name)
        //should perform checks for filetype
        myFile.mv('./tempImg/' + fileName, async function (err) {
            if (err) {
                res.send(JSON.stringify({ "upload": "Error", "ErrorMsg": err }))
            } else {
                let tmpPath = './tempImg/' + fileName;
                let destination = './uploads/' + fileName.replace(path.extname(myFile.name), '.jpg');
                try {
                    await easyimg.resize({
                        src: tmpPath,
                        dst: tmpPath,
                        width: 180,
                        height: 180,
                    })
                } catch (e) {
                    console.log("Error: ", e);
                }
                try {
                    await easyimg.convert({
                        src: tmpPath,
                        dst: destination,
                    });
                    await fs.unlink(tmpPath, (err) => {
                        if (err) {
                            console.error(`Error removing file: ${err}`);
                            return;
                        }

                        console.log(`File ${tmpPath} has been successfully removed.`);
                    });
                } catch (e) {
                    console.log("Error: ", e);
                }
                res.send(JSON.stringify({"upload": "Success"}))
            }
        })
        }

    }
});
app.get("/M00871555/getProfilePic", (req, res) => {

    (async () => {
        if (req.query.user == "") {
            res.send(JSON.stringify({"getProfilePic" : "Error", "ErrorMsg" : "No query"}))
        } else {
            let pfpPath = await searchFile('./uploads', req.query.user + '.jpg')
            res.sendFile(pfpPath, {root: '.'});
        }
    })();
})

app.listen("5555")
console.log("Express listening on port 5555");

