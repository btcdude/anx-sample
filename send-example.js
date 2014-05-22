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

/*
client.send("BTC","1CRu4x1tAYRaegd4krwPBiE4hexbPwYAnp","0.0005","",function(err, json) {
    if (err) { throw JSON.stringify(err,null,3); }
    console.log("---------------Send:--------------");
    console.log(JSON.stringify(json,null,3));
});
*/

// query the transaction history, using a date range
/*
var fromMillis = new Date().getTime()-1000*60*5; // five minutes ago
var toMillis = new Date().getTime()+1000*60; // one minute in the future
client.history("BTC",1,fromMillis,toMillis,function(err, json) {
    if (err) { throw JSON.stringify(err,null,3); }
    console.log("---------------History:--------------");
    console.log(JSON.stringify(json,null,3));
});
*/
