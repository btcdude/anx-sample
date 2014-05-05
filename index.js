// anx restful API for obtaining datatoken 
// the restful api also supports many functions such as trading and send money - see github.com/btcdude/anx and http://docs.anxv2.apiary.io/
var ANX = require('anx');

//obtain key and secret by creating an account at anxpro.com
var key="89b5784c-b6ef-4bc6-bb69-261a2c840ed7";
var secret="LZVq9sBV04j6ocH0CdWjVfWjIhUSboufmf42z39mx0r4DoHtpVX85iI+Cc3jFbew/+DUH5vtBYt8+t2bMDv25A==";

// connect to ANX
// it is possible to override the environment for testing (ANX provides sandbox environments to some partners) (ignore if you are testing against ANX production)
//var rest_client = new ANX(key,secret,"BTCUSD","http://my-partner-sandbox.anxpro.com");
var rest_client = new ANX(key,secret,"BTCUSD");

// socket.io for streaming support
var io = require('socket.io-client');

// obtain data key and uuid for private subscriptions
rest_client.dataToken(function(err, json) {
    if (err) { throw err; }

    var token = json.token;
    var uuid = json.uuid;
    var private_topic = 'private/'+uuid;

    // use token to get streaming connection
    var server = io.connect('http://dev.anxpro.com',{query: "token="+token,resource: 'streaming/3'});

    server.on('connect', function() {

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
