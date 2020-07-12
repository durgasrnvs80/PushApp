console.log("index.js started...");
const subscribeBtn = document.querySelector("#subscribe");
const unSubscribeBtn = document.querySelector("#un-subscribe");
const sendMeBtn = document.querySelector("#send-me");
subscribeBtn.addEventListener("click",subscribeBtnClicked);
unSubscribeBtn.addEventListener("click",unSubscribeBtnClicked)
sendMeBtn.addEventListener("click",sendMeBtnClicked);

//We have to get our beloved server's public key
let applicationServerPublicKey = null;
fetch("/publicKey")
.then( res => res.text())
.then( data => {
    applicationServerPublicKey = data;
    console.log("Application server public key is",applicationServerPublicKey);
});

//First register our service worker
let swRegistration;
if( "serviceWorker" in navigator && "PushManager" in window ){
    console.log("Push messaging is supported");
    navigator.serviceWorker.register("service-worker.js")
    .then( swReg => {
        console.log("Service worker registered",swReg);
        swRegistration = swReg;
        initialize();  
    })
    .catch( error => {
        console.log(error);
    })
}else{
    console.warn("Push messageing is not supported");
}

//Initialize
function initialize(){
    swRegistration.pushManager.getSubscription()
    .then( subscription => {
        console.log("Subscription is",subscription);
        //Set initial subscription value
        updateSubscriptionOnServer(subscription);//TODO

        if(subscription != null){
            console.log("User is subscribed");
        }else{
            console.log("User is not subscribed");
        }
    });
}

function subscribeBtnClicked(){
    console.log("Subscribe button clicked begin");
    subscribeUser();
}

function unSubscribeBtnClicked(){
    console.log("Un-subscribe button clicked");
    unsubscribeUser();
}

//To subscribe
function subscribeUser() {
    console.log("Subscribe user begin")
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    })
    .then(function(subscription) {
      console.log('User is subscribed.',subscription);
      updateSubscriptionOnServer(subscription);
    })
    .catch(function(err) {
      console.log('Failed to subscribe the user: ', err);
    });
    console.log("Subscribe user end");
}
//To unsubscribe
function unsubscribeUser() {
    console.log("Trying to unsubscribe")
    swRegistration.pushManager.getSubscription()
    .then(function(subscription) {
      if (subscription) {
        console.log(subscription);
        return subscription.unsubscribe();
      }
    })
    .catch(function(error) {
      console.log('Error unsubscribing', error);
    })
    .then(function() {
      updateSubscriptionOnServer(null);
      console.log('User is unsubscribed.');
    });
}

function updateSubscriptionOnServer(subscription){
    if(subscription != null){
        console.log("Updating subscription to server",subscription);
        fetch("/subscribe",{
            method: "POST",
            headers: {
                "Content-Type":"application/json"
            },
            body: JSON.stringify(subscription)
        })
        .then( response => response.json)
        .then( data => console.log(data))
        .catch( error => console.log(data));
    }
};

function sendMeBtnClicked(){
    console.log("Send Me button clicked");
    fetch("/send-me")
    .then( res => console.log(res.body));
}


// //Our helper function
function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}