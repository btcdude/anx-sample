// anx restful API for obtaining datatoken 
// the restful api also supports many functions such as trading and send money - see github.com/btcdude/anx , http://docs.anxv2.apiary.io/ and http://docs.anxv3.apiary.io/
var ANX = require('anx');

//obtain key and secret by creating an account at anxpro.com (or from your sandbox environment)
var key = "85a21c6c-2eee-49e1-9471-4c36d4f2a120";
var secret = "PZ7qogXJBecFUauUGqL8WmAbryY5o4FMkGP9/t77CrliQYH27eF/hANc5xVK7QVGt+z/8lt628xUpty9ZZuC+g==";


// connect to ANX
// it is possible to override the environment for testing (ANX provides sandbox environments to some partners) (ignore if you are testing against ANX production)
//var rest_client = new ANX(key,secret,"BTCUSD","http://my-partner-sandbox.anxpro.com");
var client = new ANX(key, secret, "BTCUSD", 'https://test.anxpro.com');

// create a sub account for a specified traded currency

var ccy="BTC"
var customRef="ENTERTAINMENT FUNDS"
client.createSubAccount(ccy,customRef,function(err, json) {
    if (err) { throw JSON.stringify(err,null,3); }
    console.log("---------------Create sub account:--------------");
    console.log(JSON.stringify(json,null,3));

});

/*
//query coin address for a specified sub account for a traded ccy
var ccy="BTC"
var subAccount="821e53b6-d2ab-4784-843f-53449cc3d3b7"
client.accountAddress(ccy,subAccount,function(err, json) {
    if (err) { throw JSON.stringify(err,null,3); }
    console.log("---------------Get coin address of sub account:--------------");
    console.log(JSON.stringify(json,null,3));

});
 */

/*
//create new coin address for a specified sub account for a traded ccy
var ccy="USD"
var subAccount="821e53b6-d2ab-4784-843f-53449cc3d3b7"
client.newAccountAddress(ccy,subAccount,function(err, json) {
    if (err) { throw JSON.stringify(err,null,3); }
    console.log("---------------Create new coin address of sub account:--------------");
    console.log(JSON.stringify(json,null,3));

});
*/