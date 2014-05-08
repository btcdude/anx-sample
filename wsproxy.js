//TODO: implement subscription cache and re-subscribe on server ReInit Control Event
//TODO: period re-connect and re-subscription
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

var ioClient = io.connect('https://anxpro.com', {query: "token=" + token, resource: 'streaming/3'});

function doWithRestDataToken(key,secret,callback) {
    var restClientWrapper = restClientCache[key];
    if (!restClient) {
        var rest_client = new ANX(key, secret, "BTCUSD", "https://test.anxpro.com");

        // obtain data key and uuid for private subscriptions
        rest_client.dataToken(function (err, json) {
            if (err) {
                throw err;
            }
            var token = json.token;
            var uuid = json.uuid;
            restClientCache[key]={client:rest_client,token:token,uuid:uuid}; // save wrapper
            callback(restClientWrapper);
        });
    } else {
        callback(restClientWrapper);
    }
}

function doWithClientSocket(key,secret,callback) {

}
ioClient.on('connect', function () {

    console.log("connected");

    // CONTROL MESSAGES

    // control message ReInit is sent by the server when it needs to flush all client data including subscriptions. Your client should watch for this message, and restart, or simply re-subscribe
    ioClient.on('control', function (data) {
        if (data.event == "ReInit") {
            console.log("ReInit control message received - clients should re-subscribe to topics or no messages will be received");
        }
    });
});


ioServer.on('connection', function (socket) {
    logger.info('socket.io client connection');

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
        doWithClientSocket(key,secret,function (clientSocket) {
            clientSocket.leave(topic);
    });

});


// connect to ANX
// it is possible to override the environment for testing (ANX provides sandbox environments to some partners) (ignore if you are testing against ANX production)
//var rest_client = new ANX(key,secret,"BTCUSD","http://my-partner-sandbox.anxpro.com");
var rest_client = new ANX(key, secret, "BTCUSD");

// socket.io for streaming support
var io = require('socket.io-client');

// obtain data key and uuid for private subscriptions
rest_client.dataToken(function (err, json) {
    if (err) {
        throw err;
    }

    var token = json.token;
    var uuid = json.uuid;
    var private_topic = 'private/' + uuid;

    // use token to get streaming connection
    var server = io.connect('https://anxpro.com', {query: "token=" + token, resource: 'streaming/3'});

    server.on('connect', function () {

        console.log("connected");

        // CONTROL MESSAGES

        // control message ReInit is sent by the server when it needs to flush all client data including subscriptions. Your client should watch for this message, and restart, or simply re-subscribe
        server.on('control', function (data) {
            if (data.event == "ReInit") {
                console.log("ReInit control message received - client should re-subscribe to topics or no messages will be recieved");
            }
        });


        // PUBLIC DATA

        // subscribe to ticks
        server.emit('subscribe', 'public/tick/ANX/BTCUSD');
        server.on('public/tick/ANX/BTCUSD', function (data) {
            console.log("tick received:" + JSON.stringify(data, undefined, 2));
        });

        // order book updates for high quality pricing  (single atomic json message for lengthy top of book)
        server.emit('subscribe', 'public/orderBook/ANX/BTCUSD');
        server.on('public/orderBook/ANX/BTCUSD', function (data) {
            console.log("orderbook update:" + JSON.stringify(data, undefined, 2));
        });

        // public trade data (i.e. receive a notification for every trade that is executed
        server.emit('subscribe', 'public/trades/ANX/BTCUSD');
        server.on('public/trades/ANX/BTCUSD', function (data) {
            console.log("trade event:" + JSON.stringify(data, undefined, 2));
        });

        // PRIVATE DATA

        // subscribe to private events - fills, order updates, and account balance updates (check the eventType field on the received message)
        server.emit('subscribe', private_topic);
        server.on(private_topic, function (data) {
            console.log("private event received:" + JSON.stringify(data, undefined, 2));
        });
    });


});
