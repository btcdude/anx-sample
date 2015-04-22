// anx restful API for obtaining datatoken 
// the restful api also supports many functions such as trading and send money - see github.com/btcdude/anx , http://docs.anxv2.apiary.io/ and http://docs.anxv3.apiary.io/
var ANX = require('../anx/index.js');

//obtain key and secret by creating an account at anxpro.com (or from your sandbox environment)
var key = "fd012755-ed0a-4740-ab16-f8dda02913a7";
var secret = "MMbp+NmQ1JOy5njATVwEqMHjugZCImyiDNGYZDc0LbI/VQ/AWJ7nN9HVQSfe8pxSnqpBpnmG3HvklOArM07QFg==";

// connect to ANX
// it is possible to override the environment for testing (ANX provides sandbox environments to some partners) (ignore if you are testing against ANX production)
//var rest_client = new ANX(key,secret,"BTCUSD","http://my-partner-sandbox.anxpro.com");
var client = new ANX(key, secret, "BTCUSD", 'https://anxpro.com');
var subAccount = 'aec0d3e5-1e6d-45ed-af11-5488396edc45';

/*
// create a sub account
client.createSubAccount("BTC", "custom", function (err, json) {
    if (err) {
        throw JSON.stringify(err, null, 3);
    }
    else {
        console.log("---------------Create subaccount:--------------");
        console.log(JSON.stringify(json, null, 3));
    }
});


// get existing address
client.accountAddress("BTC", subAccount, function (err, json) {
    if (err) {
        throw JSON.stringify(err, null, 3);
    }
    else {
        console.log("---------------Existing Address:--------------");
        console.log(JSON.stringify(json, null, 3));
    }
});

// now create a new address for account (will only work if there has been at least 1 tx to that address)

// get existing address
client.newAccountAddress("BTC", subAccount, function (err, json) {
    if (err) {
        throw JSON.stringify(err, null, 3);
    }
    else {
        console.log("---------------New address (if used) :--------------");
        console.log(JSON.stringify(json, null, 3));
    }
});

client.send("BTC","14KYQU3LAb94XRZVADmkoTS2utKxUo81Pa","0.002",null, function(err,json) {
    if (err) {
        throw JSON.stringify(err, null, 3);
    }
    else {
        console.log("---------------send results:--------------");
        console.log(JSON.stringify(json, null, 3));
    }
});


// ask for the history for a particular ccy
client.history("BTC", 0, null, null, function (err, json) {
    if (err) {
        console.log("errorrrrr")
        throw JSON.stringify(err, null, 3);
    } else {
        console.log("------------BTC History:--------------");
        console.log(JSON.stringify(json, null, 3));
    }
});
*/

// get a quote and accept it via the API
client.merchantQuoteRequest("BTC", "USD", "500", "SELL", "my customer or other reference reference", function (err, json) {
    if (err) {
        throw JSON.stringify(err, null, 3);
    } else {
        console.log("---------------Quote:--------------");
        console.log(JSON.stringify(json, null, 3));

        //
        if (json.resultCode && json.resultCode == "OK" && json.response.responseCode == "FULL_QUOTE") {
            var quoteId = json.response.quoteId;
            console.log("---------------Trade:" + quoteId + "--------------");
            client.merchantTradeRequest(quoteId, function (err2, json2) {
                console.log(JSON.stringify(json2, null, 3));
            });
        }
    }
});

client.merchantTradeList(function (err,json) {
    if (err) {
        throw JSON.stringify(err, null, 3);
    } else {
        console.log("---------------Trade List:--------------");
        console.log(JSON.stringify(json, null, 3));

    }
});
