//TODO: implement subscription cache and re-subscribe on server ReInit Control Event
//TODO: period re-connect and re-subscription
//TODO: replace console.log with some decent winston logging
// websocket proxy for the ANX restful and streaming API
// underlying API's docmented at github.com/btcdude/anx and http://docs.anxv2.apiary.io/
var ANX = require('anx');

var clientSocketCache = {};
var restClientCache = {};
var topicSubscriptionCache = {};

// create a socket.io topic to listen for incoming ws requests
var io = require('socket.io');
var ioServer = io.listen(9990);
ioServer.set('log level', 1);
ioServer.enable('browser client minification');  // send minified client
ioServer.enable('browser client etag');          // apply etag caching logic based on version number
ioServer.enable('browser client gzip');          // gzip the file



/**
 * Obtains a data token from the cache or from ANX via a rest call and invokes the callback when done
 */
function doWithRestDataToken(key,secret,callback) {
    var restClientWrapper = resClientCache[key];
    if (!restClient) {
        var rest_client = new ANX(key, secret, "BTCUSD", "https://test.anxpro.com");

        // obtain data key and uuid for private subscriptions
        rest_client.dataToken(function (err, json) {
            if (err) {
                callback(null,err);
            } else {
                var token = json.token;
                var uuid = json.uuid;
                restClientWrapper = {client: rest_client, token: token, uuid: uuid}; // save wrapper;
                restClientCache[key] = restClientWrapper;
                callback(restClientWrapper);
            }
        });
    } else {
        // invoke callback immediately with cached wrapper
        // TODO: add check for age of data token - if > 24 hours get a new one
        // TODO: also add some kind of a ping for each active rest client to make this happen automagically for extended execution
        callback(restClientWrapper);
    }
}

/**
 * Obtains a new (or cached) client socket connection to the server and when available executes the callback
 */
function doWithClientSocket(key,secret,callback) {
    // race condition here - multiple socket connections could happen if requests are fired down before the initial connection is established. should be harmless however
    // all calls should still work as expected
    var ioClient=clientSocketCache[key];
    if (!ioClient) {
        // we need to get a data token to establish our per-user connection. as it's an expensive/ roundtrip network operation we cache it
        doWithRestDataToken(key,secret,function(restClientWrapper,err) {
            var token=restClientWrapper.token;
            ioClient = io.connect('https://test.anxpro.com', {query: "token=" + token, resource: 'streaming/3'});
            ioClient.onerror(data, error, function (data, error) {
                console.log("connection error with client socket to ANX for key:"+key);
                callback(null, error);
                delete clientSocketCache[key]; // remove broken connection from cache
            });
            ioClient.on('connect', function () {
                console.log("connected client socket to ANX for key:"+key);
                clientSocketCache[key] = ioClient; // only add the connection to the cache when it is connected and ready to use
                callback(ioClient);
            });
            // TODO add reconnect/abort/etc pass through events to calling client in case they care
            clientSocketCache[key] = ioClient;
        });
    } else {
        //connect client was available in the cache, so use it immediately
        callback(ioClient);
    }
}

/**
 * Lists to incoming websocket connections, and proxie's through the request to ANX
 * Unfortunately the ANX side socket library is not multiplexed for many user accounts.
 * This library at least allows 1 WS connection to then access multiple cached individual connections to the server.
 * Everything is NIO on both sides, however it would be best to use unsubscribe
 * TODO: add timeout or close to close down old client connections
 */
ioServer.on('connection', function (socket) {
    logger.info('socket.io client connection');

    //subscribe client to control messages which indicate reconnection etc
    doWithClientSocket(key, secret, function (clientSocket) {
        clientSocket.on('control',function(data) {
            socket.emit('control',data);
        });
    });

    // subscribes this client
    socket.on('subscribe', function (request) {
        var topic = request.topic;
        var secret = request.secret;
        var key = request.key;
        doWithClientSocket(key, secret, function (clientSocket) {
            clientSocket.join(topic);
            clientSocket.on(topic, function (data) {
                ioServer.sockets.emit(topic, {
                    key: key,
                    event: data
                });
            });
        });
    });

    // unsubscribes this client
    socket.on('unsubscribe', function (request) {
        doWithClientSocket(key, secret, function (clientSocket) {
            clientSocket.leave(topic);
        });
    });

    // TODO: add an explicit close for end of session

});
