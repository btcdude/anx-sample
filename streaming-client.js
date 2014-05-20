// anx restful API for obtaining datatoken 
// the restful api also supports many functions such as trading and send money - see github.com/btcdude/anx and http://docs.anxv2.apiary.io/
var ANX = require('anx');

//obtain key and secret by creating an account at anxpro.com
var key = "fd012755-ed0a-4740-ab16-f8dda02913a7";
var secret = "HpicWK9k/425hqLUF/kluflK5N9rME4xVYYlM7Ux/uJ7UZa1PV1iyeEFovKg6hl/Q59/j00+Fewl0xQMlCh85A==";

// connect to ANX
// it is possible to override the environment for testing (ANX provides sandbox environments to some partners) (ignore if you are testing against ANX production)
//var host = 'https://test.anxpro.com'  // http://my-partner-sandbox.anxpro.com
var host = 'https://test.anxpro.com'
var rest_client = new ANX(key, secret, "BTCUSD", host);

// socket.io for streaming support
var io = require('socket.io-client');

// obtain data key and uuid for private subscriptions
rest_client.dataToken(function (err, json) {
    if (err) {
        throw JSON.stringify(err,null,3);
    }

    var token = json.token;
    var uuid = json.uuid;

    // use token to get streaming connection
    var server = io.connect(host, {resource: 'streaming/3'});

    server.on('connect', function () {
        console.log("connected");

        // on each connect, subscribe to the relevant topics, passing your token
        server.emit('subscribe', {token: token, topics: ['public/tick/ANX/BTCUSD', 'public/orderBook/ANX/BTCUSD', 'public/trades/ANX/BTCUSD', 'private/' + uuid]});

        // you could have multiple tokens (for different users/api keys) and subscribe for private data within this single socket.io connection
        //server.emit('subscribe',{token:another_token,topics:['private/'+another_uuid]});
    });

    // note we send the "subscribe" requests each time on connect, however we set the local "on" handlers only once.
    server.on('reconnect_failed', function() {
        console.log("reconnect failed, now disconnected without reconnect.");
    });

    server.on('connect_error',function(err) {
        console.log(JSON.stringify(err,null,2));
    });

    // PUBLIC DATA

    // tick events
    server.on('public/tick/ANX/BTCUSD', function (data) {
        console.log("tick received:" + JSON.stringify(data, undefined, 2));
    });

    // order book updates for high quality pricing  (single atomic json message for lengthy top of book)
    server.on('public/orderBook/ANX/BTCUSD', function (data) {
        console.log("orderbook update" + JSON.stringify(data, undefined, 3));
    });

    // public trade data (i.e. receive a notification for every trade that is executed
    server.on('public/trades/ANX/BTCUSD', function (data) {
        console.log("trade event:" + JSON.stringify(data, undefined, 2));
    });

    // PRIVATE DATA

    // subscribe to private events - fills, order updates, and account balance updates (check the eventType field on the received message)
    server.on('private/' + uuid, function (data) {
        console.log("private event received:" + JSON.stringify(data, undefined, 2));
    });

});
