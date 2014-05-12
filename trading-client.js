// anx restful API for obtaining datatoken 
// the restful api also supports many functions such as trading and send money - see github.com/btcdude/anx and http://docs.anxv2.apiary.io/
var ANX = require('anx');

//obtain key and secret by creating an account at anxpro.com
var key = "fd012755-ed0a-4740-ab16-f8dda02913a7";
var secret = "HpicWK9k/425hqLUF/kluflK5N9rME4xVYYlM7Ux/uJ7UZa1PV1iyeEFovKg6hl/Q59/j00+Fewl0xQMlCh85A==";

// connect to ANX
// it is possible to override the environment for testing (ANX provides sandbox environments to some partners) (ignore if you are testing against ANX production)
//var rest_client = new ANX(key,secret,"BTCUSD","http://my-partner-sandbox.anxpro.com");
var client = new ANX(key, secret, "BTCUSD", 'https://test.anxpro.com');

//client.orders(function(err, json) {
//    if (err) {
//        console.log("error getting orders - "+JSON.stringify(err,null,3));
//        throw err;
//    }
//    console.log("---------------Client Orders:--------------");
//    console.log(JSON.stringify(json,null,2));
//});

client.add("ask", "0.1", null, function(err, json) {
     if (err) { throw JSON.stringify(err,null,3); }
     console.log("---------------Add:--------------");
     console.log(json);
});
