console.log("Server started...");

const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
app.use(express.static("."));//Current folder
app.use(express.json());

app.listen(port, () => {
    console.log("App is listening on "+port);
});

const webPush = require("web-push");

//let newVapidKeys = webPush.generateVAPIDKeys();//Warning only once
let applicationUrl = "http://localhost:3000";//App url
process.env.VAPID_PUBLIC_KEY = "BMkYXp6cfdiUFdmBiDG1qtHoCFrUpcHxI-YtuKmpJdn84DclMe9X-KxluEAkwmPwLGJZvSrXrcV9a8D5GNhE2K8"//newVapidKeys.publicKey;
process.env.VAPID_PRIVATE_KEY = "kQfD8Rk8OQ1GfJrjskvluzxmq3Z15rXxJ8aVzMdxiPE"//newVapidKeys.privateKey;
//We have to set up public and private keys for our server
if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.log("You must set the VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY "+
      "environment variables. You can use the following ones:");
    console.log(webPush.generateVAPIDKeys());
    return;
}
webPush.setVapidDetails(
    applicationUrl,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

//Send our public key to our app
app.get("/publicKey",(req,res) => {
    console.log("Got get on publicKey")
    res.send(process.env.VAPID_PUBLIC_KEY);
});

//Get a subscription
let subscription;
let payload = "Phew";
let ttl = 60;
let options = {
    TTL: ttl
};

app.post("/subscribe",(req,res) => {
    if(req.body == null){
        console.log("We have to unsubscribe");
    }
    subscription = req.body;
    console.log("We have a subscription ",subscription);
});

app.get("/send-me",(req,res) => {
    //Send notification
    console.log("Got get on send-me");
    if(subscription != null){
        webPush.sendNotification(subscription,payload,options)
        .then(res => res.sendStatus(201))
        .catch( error => {
            res.sendStatus(500);
            console.log(error);
        });
    }
});
/*
//We have to get this subscription
const subscription = {
    endpoint:"https://fcm.googleapis.com/fcm/send/filoyXQ1mIo:APA91bF5Ecaa4xDJ2r5OBAvbbfWjk2kRFkItAQNQMRymQTJydc3DqSGZJyMrB1H-6anVLF-Q9REFvIB3PzhAnnavZyOKr3EyZuJi1uvdPcj4t4tZGxI7CMr5xxYyF8d2XsJhXXR4z2k7",
    expirationTime:null,
    keys:{
        p256dh:"BC1qmi6NmKAjkVtxpUGXo9HpTFenWaxe_eOKBoVgtrOxhZgvD5_yksdB43FTO7jYkP6kZHGQ2wKr7t3YDxAn1PI",
        auth:"exAyJeZ2l2pMkC-wzRj4wQ"
    }
};
const payload = "Hiii";
const options = {
    TTL: 60
};

webPush.sendNotification(subscription, payload, options)
.then(res => console.log(res))
.catch(err => console.log(err));
*/