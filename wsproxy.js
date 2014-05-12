//TODO: implement subscription cache and re-subscribe on server ReInit Control Event
//TODO: replace console.log with some decent winston logging
// websocket proxy for the ANX restful and streaming API
// underlying API's docmented at github.com/btcdude/anx , http://docs.anxv2.apiary.io/ and http://docs/anxv3.apiary.io/
var ANX = require('anx');

var clientSocketCache = {};
var restClientCache = {};
var topicSubscriptionCache = {};

// create a socket.io topic to listen for incoming ws requests
var ioServer = require('socket.io').listen(9990);
var ioClientLib = require('socket.io-client');
ioServer.set('log level', 1);
ioServer.enable('browser client minification');  // send minified client
ioServer.enable('browser client etag');          // apply etag caching logic based on version number
ioServer.enable('browser client gzip');          // gzip the file



/**
 * Obtains a data token from the cache or from ANX via a rest call and invokes the callback when done
 */
function doWithRestDataToken(key,secret,callback) {
    var restClientWrapper = restClientCache[key];
    // if cached client not yet obtained or existing cache client > 20 hours old
    if (!restClientWrapper || (new Date().getTime()-restClientWrapper.timeStamp)>1000*60*60*20) {
        var rest_client = new ANX(key, secret, "BTCUSD", "https://test.anxpro.com");

        // obtain data key and uuid for private subscriptions
        rest_client.dataToken(function (err, json) {
            if (err) {
                callback(null,err);
            } else {
                var token = json.token;
                var uuid = json.uuid;
                restClientWrapper = {client: rest_client, token: token, uuid: uuid, timeStamp:new Date().getTime()}; // save wrapper;
                callback(restClientWrapper); // important to be before addition to cache
                restClientCache[key] = restClientWrapper;

            }
        });
    } else {
        // invoke callback immediately with cached wrapper
        callback(restClientWrapper);
    }
}

/**
 * Obtains a new (or cached) client socket connection to the server and when available executes the callback return client and client's uuid for private subscriptions
 */
function doWithClientSocket(key,secret,callback) {
    // race condition here - multiple socket connections could happen if requests are fired down before the initial connection is established. should be harmless however
    // all calls should still work as expected
    var ioClientWrapper=clientSocketCache[key];
    if (!ioClientWrapper) {
        // we need to get a data token to establish our per-user connection. as it's an expensive/ roundtrip request we cache it
        doWithRestDataToken(key,secret,function(restClientWrapper,err) {
            if (err) {
                console.log("request error for key: "+key);
                callback(null,err);
            } else {
                var token = restClientWrapper.token;
                var uuid = restClientWrapper.uuid;
                ioClient = ioClientLib.connect('https://test.anxpro.com', {query: "token=" + token, resource: 'streaming/3'});
                ioClient.on("error", function (data, error) {
                    console.log("connection error with client socket to ANX for key:" + key);
                    callback(null, error);
                    delete clientSocketCache[key]; // remove broken connection from cache
                });
                ioClient.on('connect', function () {
                    console.log("connected client socket to ANX for key:" + key);
                    ioClientWrapper = {client: ioClient, uuid: uuid};
                    callback(ioClientWrapper); // important to be before addition to cache
                    clientSocketCache[key] = ioClientWrapper; // only add the connection to the cache when it is connected and ready to use
                });
                server.on('reconnect_failed', function() {
                    console.log("reconnect failed, now disconnected without reconnect.");
                    //TODO: set a timeout to reconnect after some period so after extended outages and re-subscribe to topics
                });

                server.on('connect_error',function(err) {
                    console.log(JSON.stringify(err,null,2));
                });

            }
        });
    } else {
        //connected client was available in the cache, so use it immediately
        callback(ioClientWrapper);
    }
}

/**
 * Lists to incoming websocket connections, and proxie's through the request to ANX
 * Everything is NIO on both sides, however it would be best to use unsubscribe
 * TODO: add timeout or close to close down old client connections (possibly socket.io cleans them up already)
 */
ioServer.on('connection', function (socket) {
    console.log('socket.io client connection');

    // subscribes this client
    socket.on('subscribe', function (request) {
        var topics = request.topics;
        var secret = request.secret;
        var key = request.key;
        doWithClientSocket(key, secret, function (clientSocketWrapper,err) {
            if (err) {
                console.log("subscribe error");
            } else {
                var clientSocket = clientSocketWrapper.client;
                var token = clientSocketWrapper.token;
                var translatedTopics=[]; // map requests with a key and "private" to a subscription to "private/uuid";
                var uuid = clientSocketWrapper.uuid;
                for (var i=0;i<topics.length;i++) {
                    var topic = topics[i];
                    var actualTopic = topic;
                    if (topic=='private') topic='private/'+uuid;
                    translatedTopics[i]=topic;
                    //TODO: removing duplicate subscriptions so we don't get duplicates after a reconnect/subscribe
                    clientSocket.on(actualTopic, function (data) {
                        // we submit the actual topic subscribed - i.e. "private" is private/uuid to ANX - but this just returns "private" and the key so the client doesn't even need to know about client uuid
                        // i.e. "topic" below is not a mistake
                        ioServer.sockets.emit(actual, {
                            key: key,
                            event: data
                        });
                    });

                }
                // do the batched topics subscription with the translated topics
                clientSocket.emit('subscribe', {token:token,topics:translatedTopics});
            }
        });
    });

    // unsubscribes this client
    socket.on('unsubscribe', function (request) {
           if (err) {
                console.log("subscribe error");
            } else {
                var clientSocket = clientSocketWrapper.client;
                var token = clientSocketWrapper.token;
                var translatedTopics=[]; // map requests with a key and "private" to a subscription to "private/uuid";
                var uuid = clientSocketWrapper.uuid;
                for (var i=0;i<topics.length;i++) {
                    var topic = topics[i];
                    var actualTopic = topic;
                    if (topic=='private') topic='private/'+uuid;
                    translatedTopics[i]=topic;
                }
                // do the batched topics subscription with the translated topics
                clientSocket.emit('unsubscribe', {token:token,topics:translatedTopics});
            }
    });

    // TODO: add an explicit close for end of session

});
