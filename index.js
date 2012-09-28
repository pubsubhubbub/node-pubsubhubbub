var request = require("request"),
    http = require("http"),
    urllib = require("url"),
    Stream = require("stream").Stream,
    utillib = require("util"),
    NodePie = require("nodepie");

// Expose to the world
module.exports.PubSubHubbub = PubSubHubbub;

/**
 * Create a PubSubHubbub client handler object. HTTP server is set up to listen 
 * the responses from the hubs.
 *
 * @constructor
 * @param {Object} options Options object to set up the handler
 * @param {String} options.callbackServer Hostname the hubs can send the response, include also the port number if not behind proxy
 * @param {Number} [options.callbackPath="/hubbub"] Path to listen for (other paths return 404)
 * @param {String} [options.token] Secret token for the hub to authenticate itself, not used if not set 
 * @param {Number} [options.maxRSSSize=3MB] Maximum file size in bytes for an incoming RSS file - if longer, it will be trimmed
 * @param {String} [options.gid] If started as root, downgrade to selected group ID
 * @param {String} [options.giu] If started as root, downgrade to selected user ID
 */
function PubSubHubbub(options){
    Stream.call(this);

    options = options || {};

    this.port = options.port || 8921;
    this.callbackServer = options.callbackServer;
    this.callbackPath = options.callbackPath || "/hubbub";
    this.token = options.token || false;
    this.maxRSSSize = options.maxRSSSize || 3 * 1024 * 1024;
    this.gid = options.gid;
    this.uid = options.uid;

    this.server = http.createServer(this.serverHandler.bind(this));
    this.server.on("error", this.onServerError.bind(this));
    this.server.on("listening", this.onServerListening.bind(this));

    this.server.listen(this.port);
}
utillib.inherits(PubSubHubbub, Stream);

PubSubHubbub.prototype.serverHandler = function(req, res){
    if(req.url.substr(0, this.callbackPath.length) != this.callbackPath){
        res.writeHead(404, {"Content-Type": "text/html"});
        res.end("<!DOCTYPE html><html><head><meta charset=\"utf-8\"/><title>404 Not Found</title></head><body><h1>404 Not Found</h1></body></html>");
        return;
    }

    if(req.method == "GET"){
        return this.serverGETHandler(req, res);
    }

    if(req.method == "POST"){
        return this.serverPOSTHandler(req, res);
    }

    res.writeHead(500, {"Content-Type": "text/html"});
    res.end("<!DOCTYPE html><html><head><meta charset=\"utf-8\"/><title>500 Internal Server Error</title></head><body><h1>500 Internal Server Error</h1></body></html>");
}

PubSubHubbub.prototype.onServerError = function(error){
    if(error.syscall == "listen"){
        process.stderr.write("Failed to start listening on port " + this.port + " ("+error.code+")\n");
        process.exit(1);
    }

    console.log("HTTP Server error");
    console.log(error);
}

PubSubHubbub.prototype.onServerListening = function(){
    if(typeof this.gid != "undefined"){
        process.setgid(this.gid);
    }

    if(typeof this.uid != "undefined"){
        process.setuid(this.uid);
    }

    console.log("Server listening on port " + this.port + " as " + process.getuid() + ":" + process.getgid());

    this.emit("listen");
}

PubSubHubbub.prototype.subscribe = function(topic, hub, callback){
    this.setSubscription("subscribe", topic, hub, callback);
}

PubSubHubbub.prototype.unsubscribe = function(topic, hub, callback){
    this.setSubscription("unsubscribe", topic, hub, callback);
}

PubSubHubbub.prototype.setSubscription = function(mode, topic, hub, callback){
    var form = {
            "hub.mode": mode || "subscribe",
            "hub.verify": "sync",
            "hub.callback": this.callbackServer + this.callbackPath,
            "hub.topic": topic
        },
        postParams = {
            url: hub,
            form: form,
            encoding: "utf-8"
        };

    if(this.token){
        form["hub.verify_token"] = this.token;
    }

    request.post(postParams, this.pubsubResponse.bind(this, topic, callback));
}

PubSubHubbub.prototype.pubsubResponse = function(topic, callback, error, response, body){
    if(error){
        return callback(error);
    }

    if(response.statusCode >= 300){
        return callback(new Error("Invalid response status "+response.statusCode));
    }

    return callback(null, topic);
}

PubSubHubbub.prototype.serverGETHandler = function(req, res){
    var params = urllib.parse(req.url, true, true);

    if(this.token && (params.query['hub.verify_token'] != this.token || !params.query["hub.topic"])){
        res.writeHead(500, {"Content-Type": "text/html"});
        res.end("<!DOCTYPE html><html><head><meta charset=\"utf-8\"/><title>500 Internal Server Error</title></head><body><h1>500 Internal Server Error</h1></body></html>");
        return;
    }

    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(params.query['hub.challenge']);

    var data = {
        lease: Number(params.query["hub.lease_seconds"] || 0) + Math.round(Date.now()/1000),
        topic: params.query["hub.topic"]
    };

    this.emit(params.query["hub.mode"] || "subscribe", data);
}

PubSubHubbub.prototype.serverPOSTHandler = function(req, res){
    var body = new Buffer(0), data;

    req.on("data", (function(chunk){
        if(body.length < this.maxRSSSize){
            if(body.length + chunk.length < this.maxRSSSize){
                data = new Buffer(body.length + chunk.length);
                if(body.length){
                    body.copy(data);
                }
                chunk.copy(data, body.length);
            }else{
                data = new Buffer(this.maxRSSSize);
                if(body.length){
                    body.copy(data);
                }
                chunk.copy(data, body.length, 0, this.maxRSSSize - body.length);
            }
            body = data;
            data = null;
        }
        chunk = null;
    }).bind(this));

    req.on("end", (function(){
        res.writeHead(204, {'Content-Type': 'text/plain; charset=utf-8'});
        res.end();
        this.parseFeed(body);
    }).bind(this));

}

PubSubHubbub.prototype.parseFeed = function(xml){
    var feed = new NodePie(xml);
    
    try{
        feed.init();
    }catch(E){
        this.emit("error", E);
        return;
    }

    this.emit("feed", feed);
}