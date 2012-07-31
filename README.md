# README.md

PubSubHubbub subscriber module

## Install

Install with npm

    npm install pubsubhubbub

## Usage

**pubsubhubbub** starts a dedicated HTTP server on selected port (default is 8921). When
subscribing to a feed, the webserver address will be used as the callback URL

    var PubSubHubbub = require("pubsubhubbub").PubSubHubbub;

    var pubSubSubscriber = new PubSubHubbub(options);

Where options includes the following properties

  * **port** - port to listen
  * **callbackServer** - Server url, the PubSubHubbub client can be reaced by, eg. "http://mypubsubsserver.com:8921"
  * **token** - secret token for verifying the subscription requests
  * **uid** - *optional* user id to change after http server has been set up (eg. if you're starting the server as root on port 80 and want to change the user to "nobody" etc.)
  * **gid** - *optional* group id to change after http server has been set up

## Events

  * **'listen'** - HTTP server has been set up and is listening for incoming connections
  * **'error'** (*err*) - An error has occurred
  * **'subscribe'** (*data*) - Subscription for a feed has been updated
  * **'unsubscribe'** (*data*) - Subscription for a feed has been cancelled
  * **'feed'** (*feed*) - Incoming notification as a NodePie feed object

## API

### Subscribe

Subscribe to a feed with 

    pubsub.subscribe(topic, hub, callback)

Where

  * **topic** is the URL of the RSS/ATOM feed to subscribe to
  * **hub** is the hub for the feed
  * **callback** is the callback function with an error object if the subscription failed

Example:

    var pubSubSubscriber = new PubSubHubbub(options),
        topic = "http://testetstetss.blogspot.com/feeds/posts/default",
        hub = "http://pubsubhubbub.appspot.com/";

    pubSubSubscriber.subscribe(topic, hub, function(err){
        if(err){
            console.log("Subscribing failed");
        }else{
            console.log("Subscribed!");
        }
    });

You should also listen to the 'subscribe' event since the hub will resubmit the
data when the lease expires and a new lease time is provided.

### Unsubscribe

Unsubscribe from a feed with 

    pubsub.unsubscribe(topic, hub, callback)

Where

  * **topic** is the URL of the RSS/ATOM feed to unsubscribe from
  * **hub** is the hub for the feed
  * **callback** is the callback function with an error object if the unsubscribing failed

Example:

    var pubSubSubscriber = new PubSubHubbub(options),
        topic = "http://testetstetss.blogspot.com/feeds/posts/default",
        hub = "http://pubsubhubbub.appspot.com/";

    pubSubSubscriber.unsubscribe(topic, hub, function(err){
        if(err){
            console.log("Unsubscribing failed");
        }else{
            console.log("Unsubscribed!");
        }
    });

## License

**MIT**