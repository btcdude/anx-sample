/**
 * Example of a client to the multiplexing websocket proxy to ANX. Only use this is you need to use the wsproxy for multiplexing or pure websockets without long polling
 * Many users will wish to replace this with client language other than javascript
 */


// suggested to use one key for all public data, and then per-user keys for private data
var key = "89b5784c-b6ef-4bc6-bb69-261a2c840ed7";
var secret = "LZVq9sBV04j6ocH0CdWjVfWjIhUSboufmf42z39mx0r4DoHtpVX85iI+Cc3jFbew/+DUH5vtBYt8+t2bMDv25A==";

// websocket client for streaming support
var io = require('socket.io-client');

var server = io.connect('http://localhost:9990');

server.on('connect', function () {

    console.log("connected"); // suggest you listen for other relevant websocket events

    // CONTROL MESSAGES

    // control message ReInit is sent by the server when it needs to flush all client data including subscriptions. Your client should watch for this message, and restart, or simply re-subscribe
    server.on('control', function (data) {
        if (data.event == "ReInit") {
            console.log("ReInit control message received - client should re-subscribe to topics or no messages will be received");
        }
    });


    // PUBLIC DATA

    // subscribe to ticks
    server.emit('subscribe', {secret: secret, key: key, topic: 'public/tick/ANX/BTCUSD'});
    server.on('public/tick/ANX/BTCUSD', function (data) {
        var key = data.key;
        var payload = data.event;
        console.log("tick received:" + JSON.stringify(event, undefined, 2));
    });

    // order book updates for high quality pricing  (single atomic json message for lengthy top of book)
    server.emit('subscribe', {secret: secret, key: key, topic: 'public/orderBook/ANX/BTCUSD'});
    server.on('public/orderBook/ANX/BTCUSD', function (data) {
        var key = data.key;
        var payload = data.event;
        console.log("orderbook update:" + JSON.stringify(event, undefined, 2));
    });

    // public trade data (i.e. receive a notification for every trade that is executed
    server.emit('subscribe', {secret: secret, key: key, topic: 'public/trades/ANX/BTCUSD'});
    server.on('public/trades/ANX/BTCUSD', function (data) {
        var key = data.key;
        var payload = data.event;
        console.log("trade event:" + JSON.stringify(event, undefined, 2));
    });

    // PRIVATE DATA

    // subscribe to private events - fills, order updates, and account balance updates (check the eventType field on the received message)
    // replace your main key and secret below with per client key and secret
    server.emit('subscribe', {secret: secret, key: key, topic: "private"});
    server.on("private", function (data) {
        var key = data.key;
        var payload = data.event;
        console.log("private event for key: " + key + " received:" + JSON.stringify(data, undefined, 2));
    });
});
