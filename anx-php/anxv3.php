<?php
 
function anx_query($path, array $param = array()) {
	// API settings
	
	$key = "";
	$secret = "";
 
	// generate a nonce as microtime, with as-string handling to avoid problems with 32bits systems
	//$mt = explode(' ', time());
	$param['max'] = 100;
	$param['tonce'] = time() * 1000 * 1000;


	// generate the POST data string
	// $post_data = http_build_query($param, '', '&');
	$post_data = json_encode($param);
 
	$prefix = $path ."\0";
 
	// generate the extra headers
	$headers = array(
		'Rest-Key: '.$key,
		'Rest-Sign: '.base64_encode(hash_hmac('sha512', $prefix.$post_data, base64_decode($secret), true)),
		'Content-Type: application/json'
	);

 
	// our curl handle (initialize if required)
	static $ch = null;
	if (is_null($ch)) {
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/4.0 (compatible; ANX PHP client; '.php_uname('s').'; PHP/'.phpversion().')');
	}
	curl_setopt($ch, CURLOPT_URL, 'http://dev.anxpro.com/'.$path);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
	curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);

 
	$proxy = '127.0.0.1:8888';
	curl_setopt($ch, CURLOPT_PROXY, $proxy);

	// run the query
	$res = curl_exec($ch);
	if ($res === false) throw new Exception('Could not get reply: '.curl_error($ch));
	$dec = json_decode($res, true);
	if (!$dec) throw new Exception('Invalid data received, please make sure connection is working and requested API exists');
	return $dec;
}
 
// example 1: get infos about the account, plus the list of rights we have access to
 var_dump(anx_query('api/3/order/list'));


?>
