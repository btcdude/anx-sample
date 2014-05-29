This example shows how to use the ANX node library:

streaming-example.js
--------------------
Shows how to get a data token and connect to the streaming API.
It uses socket.io and the anx library.

send-example.js
---------------
Shows hows how to send crypto.
The send returns a transaction id if successful.

The wallet history returns all transactions for the given currency. The transactionid in a given transaction record should match the send above.

trading-example.js
------------------
Shows all the various different order methods, and querying the order status given the order id.

wsproxy.js
----------
Provides a sample socket.io proxy that exposes a working socket.io over websocket for non node clients that do not support long-polling.
It also provides convenience methods to multiplex multiple clients, and hides the work required to obtain a data token.

wsproxy-client.js
-----------------
Sample client for wsproxy.js.

account-example.js
------------------
Shows how to create a sub account for a specified traded currency;
Shows how to query coin address for a specified sub account for a traded ccy;
Shows how to create new coin address for a specified sub account for a traded ccy.


More information is available at: https://github.com/btcdude/anx , http://docs.anxv2.apiary.io/ and http://docs.anxv3.apiary.io/
