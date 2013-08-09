var pubSubHubbub = require("../index"),
    crypto = require("crypto"),
    
    pubsub = pubSubHubbub.createServer({
        callbackUrl: "http://kreata.ee:1337",
        secret: "MyTopSecret"
    }),
    
    topic = "http://testetstetss.blogspot.com/feeds/posts/default",
    hub = "http://pubsubhubbub.appspot.com/";

pubsub.listen(1337);

pubsub.on("denied", function(data){
    console.log("Denied");
    console.log(data);
});

pubsub.on("subscribe", function(data){
    console.log("Subscribe");
    console.log(data);

    console.log("Subscribed "+topic+" to "+hub);
});

pubsub.on("unsubscribe", function(data){
    console.log("Unsubscribe");
    console.log(data);

    console.log("Unsubscribed "+topic+" from "+hub);
});

pubsub.on("error", function(error){
    console.log("Error");
    console.log(error);
});

pubsub.on("feed", function(data){
    console.log(data)
    console.log(data.feed.toString());

    pubsub.unsubscribe(topic, hub);
});

pubsub.on("listen", function(){
    console.log("Server listening on port %s", pubsub.port);
    pubsub.subscribe(topic, hub);
});