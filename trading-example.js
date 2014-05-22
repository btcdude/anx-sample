// anx restful API for obtaining datatoken 
// the restful api also supports many functions such as trading and send money - see github.com/btcdude/anx , http://docs.anxv2.apiary.io/ and http://docs.anxv3.apiary.io/
var ANX = require('anx');

//obtain key and secret by creating an account at anxpro.com (or from your sandbox environment)
var key = "fd012755-ed0a-4740-ab16-f8dda02913a7";
var secret = "MMbp+NmQ1JOy5njATVwEqMHjugZCImyiDNGYZDc0LbI/VQ/AWJ7nN9HVQSfe8pxSnqpBpnmG3HvklOArM07QFg==";

// connect to ANX
// it is possible to override the environment for testing (ANX provides sandbox environments to some partners) (ignore if you are testing against ANX production)
//var rest_client = new ANX(key,secret,"BTCUSD","http://my-partner-sandbox.anxpro.com");
var client = new ANX(key, secret, "BTCUSD", 'https://anxpro.com');

// show open orders
//client.orders(function(err, json) {
//    if (err) {
//        console.log("error getting orders - "+JSON.stringify(err,null,3));
//        throw err;
//    }
//    console.log("---------------Client Orders:--------------");
//    console.log(JSON.stringify(json,null,2));
//});

//// market order to buy fixed amount of BTC
//client.newMarketOrderFixedTradedAmount(true, "BTC", "USD", "0.1", function(err, json) {
//     if (err) { throw JSON.stringify(err,null,3); }
//     console.log("---------------Add:--------------");
//     console.log(JSON.stringify(json,null,3));
//});

//// market order to buy fixed amount of USD
//client.newMarketOrderFixedSettlementAmount(true, "BTC", "USD", "5", function(err, json) {
//    if (err) { throw JSON.stringify(err,null,3); }
//    console.log("---------------Add:--------------");
//    console.log(JSON.stringify(json,null,3));
//});

//limit order to buy fixed amount of USD (you can fix traded or settlement) at limit price of 300 USD per BTC
//client.newLimitOrderFixedSettlementAmount(true, "BTC", "USD", "5","110",function(err, json) {
//    if (err) { throw JSON.stringify(err,null,3); }
//    console.log("---------------Add:--------------");
//    console.log(JSON.stringify(json,null,3));
//});

// replace existing order - but only if it is still active when this new order is placed. change the price to 112.
//var replaceOrderUuid='dca7381f-bab9-448e-895d-515edc901f0b'; // existing order that is active
//client.replaceLimitOrderFixedSettlementAmount(true, "BTC", "USD", "5","112",replaceOrderUuid,true,function(err, json) {
//    if (err) { throw JSON.stringify(err,null,3); }
//    console.log("---------------Add:--------------");
//    console.log(JSON.stringify(json,null,3));
//});
//
//// immediate or cancel sell order for 10 USD worth of BTC at 112 USD per BTC (fixed settlement amount in this example)
//client.newIOCOrderFixedSettlementAmount(false, "BTC", "USD", "10","112",function(err, json) {
//    if (err) { throw JSON.stringify(err,null,3); }
//    console.log("---------------Add:--------------");
//    console.log(JSON.stringify(json,null,3));
//});

// get order info for a specific order
// ACTIVE means it's still running, other statuses of relevance "FULLY_FILLED" and "PARTIALLY_FILLED"
/*
var orderId='62081b2d-e882-4398-94dd-c66aed148439';
client.orderInfo(orderId,function(err, json) {
    if (err) { throw JSON.stringify(err,null,3); }
    console.log("---------------Info:--------------");
    console.log(JSON.stringify(json,null,3));
});
*/

// cancel an order
var orderId='62081b2d-e882-4398-94dd-c66aed148439';
client.cancel(orderId,function(err, json) {
    if (err) { throw JSON.stringify(err,null,3); }
    console.log("---------------Cancel:--------------");
    console.log(JSON.stringify(json,null,3));
});
