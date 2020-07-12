 self.addEventListener("push", event => {
    console.log("[Service Worker] Push recieved");
    console.log("[Service Worker] Push has data ",event.data.text());

    let title = "PushApp test";
    let options = {
        body: event.data.text(),
    };
    
    let notificationPromise = self.registration.showNotification(title,options);
    event.waitUntil(notificationPromise);
 });