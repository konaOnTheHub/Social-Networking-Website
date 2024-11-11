import express from 'express';
import bodyParser from 'body-parser';


const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

const users = [];

function handleGetRequest(request, response) {
    response.send('Hello World');
}

app.post("/M012345/users", (req, res)=>{
    console.log(req.body);
    res.send();

});

app.listen("5555")
console.log("Express listening on port 5555");

