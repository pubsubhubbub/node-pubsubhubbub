var PubSubHubbub = require("../index").PubSubHubbub;

var pubsub = new PubSubHubbub({
    callbackServer: "http://subscriber.node.ee",
    port: 8922
});

pubsub.on("subscribe", function(data){
    console.log("Subscribe");
    console.log(data);
});

pubsub.on("unsubscribe", function(data){
    console.log("Unsubscribe");
    console.log(data);
});

pubsub.on("error", function(error){
    console.log("Error");
    console.log(data);
});

pubsub.on("feed", function(feed){
    console.log(feed);
    pubsub.unsubscribe(feed.getPermalink(), feed.getHub(), console.log.bind(console, "Unsubscribed "+feed.getPermalink()+" from "+feed.getHub()));
});

pubsub.on("listen", function(){
    var topic = "http://testetstetss.blogspot.com/feeds/posts/default",
        hub = "http://pubsubhubbub.appspot.com/";

    pubsub.subscribe(topic, hub, function(err, subscription){
        if(err){
            console.log("Subscribing failed");
            console.log(err);
            return;
        }

        if(subscription == topic){
            console.log("Subscribed "+topic+" to "+hub);
        }else{
            console.log("Invalid response");
            return;
        }
    });
});