# README.md

PubSubHubbub subscriber module. Supports both 0.3 and 0.4 hubs.

**NB** Do not upgrade from v0.1.x - the API is totally different

## Install

Install with npm

    npm install pubsubhubbub

## Usage

**pubsubhubbub** starts a HTTP server on selected port. 

    var pubSubHubbub = require("pubsubhubbub");

    var pubSubSubscriber = pubSubHubbub.createServer(options);

    pubSubSubscriber.listen(1337);

Where options includes the following properties

  * **port** - port to listen
  * **callbackUrl** Callback URL for the hub
  * **secret** (optional) Secret value for HMAC signatures
  * **maxContentSize** (optional) Maximum allowed size of the POST messages
  * **username** (optional) Username for HTTP Authentication
  * **password** (optional) Password for HTTP Authentication

## Events

  * **'listen'** - HTTP server has been set up and is listening for incoming connections
  * **'error'** (*err*) - An error has occurred
  * **'subscribe'** (*data*) - Subscription for a feed has been updated
  * **'unsubscribe'** (*data*) - Subscription for a feed has been cancelled
  * **'denied'** (*data*) - Subscription has been denied
  * **'feed'** (*data*) - Incoming notification

## API

### Listen

Start listening on selected port

    pubSubSubscriber.listen(port)

Where

  * **port** is the HTTP port to listen

### Subscribe

Subscribe to a feed with 

    pubSubSubscriber.subscribe(topic, hub, callback)

Where

  * **topic** is the URL of the RSS/ATOM feed to subscribe to
  * **hub** is the hub for the feed
  * **callback** (optional) is the callback function with an error object if the subscription failed

Example:

    var pubSubSubscriber = pubSubHubbub.createServer(options),
        topic = "http://testetstetss.blogspot.com/feeds/posts/default",
        hub = "http://pubsubhubbub.appspot.com/";

    pubSubSubscriber.on("subscribe", function(data){
        console.log(data.topic + " subscribed");
    });

    pubSubSubscriber.listen(port);

    pubsub.on("listen", function(){
        pubSubSubscriber.subscribe(topic, hub, function(err){
            if(err){
                console.log("Failed subscribing");
            }
        });
    });

### Unsubscribe

Unsubscribe from a feed with 

    pubSubSubscriber.unsubscribe(topic, hub, callback)

Where

  * **topic** is the URL of the RSS/ATOM feed to unsubscribe from
  * **hub** is the hub for the feed
  * **callback** (optional) is the callback function with an error object if the unsubscribing failed

Example:

    var pubSubSubscriber = pubSubHubbub.createServer(options),
        topic = "http://testetstetss.blogspot.com/feeds/posts/default",
        hub = "http://pubsubhubbub.appspot.com/";

    pubSubSubscriber.on("unsubscribe", function(data){
        console.log(data.topic + " unsubscribed");
    });

    pubSubSubscriber.listen(port);

    pubsub.on("listen", function(){
        pubSubSubscriber.unsubscribe(topic, hub, function(err){
            if(err){
                console.log("Failed unsubscribing");
            }
        });
    });

## Notifications

Update notifications can be checked with the `'feed'` event. The data object is with the following structure:

  * **topic** - Topic URL
  * **hub** - Hub URL, might be undefined
  * **callback** - Callback URL that was used by the Hub
  * **feed** - Feed XML as a Buffer object
  * **headers** - Request headers object

## License

**MIT**