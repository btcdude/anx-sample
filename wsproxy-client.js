/**
 * Example of a client using the ANX websocket proxy. Only use this is you need to use the wsproxy to use pure websockets, and/or wish multiplexing multiple clients. 
 * Many users will wish to replace this with client language other than javascript
 */


// suggested to use one key for all public data, and then per-user keys for private data
var key="fd012755-ed0a-4740-ab16-f8dda02913a7";
var secret="SEMdIzSPXjEzOz6aGnHuDIKkTI8VfHr0bd5YFwnJS3xBlLU8n2hb2S5yZCMJOYhCrHbEyEsBccAMxLus6pSiCA==";

// websocket client for streaming support
var io = require('socket.io-client');

//var proxy = require('socket.io-proxy');
//proxy.init('http://localhost:8888');
//
//var server = proxy.connect('http://localhost:9990');
var server = io.connect('http://localhost:9990');

server.on('connect', function () {

    console.log("connected"); // suggest you listen for other relevant websocket events

//    // PUBLIC DATA

    // subscribe to ticks
    server.emit('subscribe', {secret: secret, key: key, topics: ['public/trades/ANX/BTCUSD', 'public/tick/ANX/BTCUSD', 'public/orderBook/ANX/BTCUSD']});

    // subscribe to private events - fills, order updates, and account balance updates (check the eventType field on the received message)
    // replace your main key and secret below with per client key and secret
    // you could subscribe several times with different keys
    server.emit('subscribe', {secret: secret, key: key, topics: ["private"]});
});

// note local event registration only done once - whilst subscribing to topics done on connect
server.on('public/tick/ANX/BTCUSD', function (data) {
    var key = data.key;
    var payload = data.event;
    console.log("public event received:" + JSON.stringify(payload, undefined, 3));
});
// order book updates for high quality pricing  (single atomic json message for lengthy top of book)
server.on('public/orderBook/ANX/BTCUSD', function (data) {
    var key = data.key;
    var payload = data.event;
    console.log("orderbook update:" + JSON.stringify(payload, undefined, 3));
});

// public trade data (i.e. receive a notification for every trade that is executed
server.on('public/trades/ANX/BTCUSD', function (data) {
    var key = data.key;
    var payload = data.event;
    console.log("trade event:" + JSON.stringify(payload, undefined, 3));
});

// PRIVATE DATA


server.on("private", function (data) {
    var key = data.key;
    var payload = data.event;
    console.log("private event for key: " + key + " received:" + JSON.stringify(payload, undefined, 2));
});

