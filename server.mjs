import express from 'express';
import mongoose from 'mongoose';
import Messages from './dbMessages.mjs';
import bodyParser from 'body-parser';
import Pusher from "pusher";
import cors from 'cors';

const app = express();
const port = process.env.PORT  || 9002;

const pusher = new Pusher({
    appId: "1147630",
    key: "d7e60a44bf815a5970e7",
    secret: "7ebe9003c8581f13be41",
    cluster: "eu",
    useTLS: true
  });

app.use(express.json());
app.use(cors());

app.use((req,res,next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    next();
});

const connection_url = 'mongodb+srv://admin:moro@cluster0.jrkyj.mongodb.net/tileterra-db?retryWrites=true&w=majority';
mongoose.connect(connection_url, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology:true,
});

const db = mongoose.connection;

db.once('open', () => {
    console.log("connected");

    const msgCollection = db.collection("messagecontents");
    const changeStream = msgCollection.watch();

    changeStream.on('change', (change) => {
        console.log(change.operationType);

        if(change.operationType === 'insert') {
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted', {
                quest: messageDetails.quest,
                reward: messageDetails.reward,
                type: messageDetails.type,
                amount: messageDetails.amount,

            });
        } else if(change.operationType === 'delete'){
            
        }
        
    });
});

app.get('/',(req,res)=>res.status(200).send('Not Accessable'));

app.post('/quests/add',(req,res) => {
    const dbMessage = req.body;
    console.log(req.body);
    Messages.create(dbMessage,(err,data) => {
        if(err) {
            res.status(500).send(err);   
        }else{
            res.status(201).send(data);
        }
    })
});

app.post('/quests/remove',(req,res) => {

    const dbMessage = req.body.id;
    console.log(dbMessage);

    Messages.deleteOne({"_id": dbMessage},(err,data) => {
        if(err) {
            console.log("not" );

            res.status(500).send(err);   
        }else{
            console.log("Removing" );

            res.status(201).send(data);
        }
    })
});

app.get('/quests/daily',(req,res) => {
    Messages.find((err,data) => {
        if(err) {
            res.status(500).send("Nope");   
        }else{
            res.status(201).send(data);
        }
    })
})


app.listen(port, ()=>console.log(`Listening on Localhost: ${port}`));