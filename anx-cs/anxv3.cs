using System;

using System.Text;

using System.Security.Cryptography;
using System.IO;
using System.Net.Security;
using System.Net;
using System.Security.Cryptography.X509Certificates;


public class Test
{
    static public void Main() {
        string key = "6c646452-1665-4903-a7b7-005c8f65ab38";
        string secret = "KqSr5Bp87pUx54bae5VQ5BbB+LNV/enHbyVFZKkhnL7ybweTmFIhWVCnLg40P0LNM8OLGcjQdg+cBqVHr/BXug=="; // shortened
        string path = "api/3/order/list";

        long unixTimestamp = (long)(DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1))).TotalSeconds;
        long ts = unixTimestamp * 1000 * 1000;

        string command = "{\"nonce\":"+ts+",\"max\":\"100\"}";

        HMACSHA512 hmacsha512 = new HMACSHA512(Convert.FromBase64String(secret));
        string input= path + '\0' + command;
        MemoryStream stream = new MemoryStream(Encoding.ASCII.GetBytes(input));
        byte[] hashData = hmacsha512.ComputeHash(stream);
        string sign = Convert.ToBase64String(hashData);

        var request = System.Net.WebRequest.Create("http://dev.anxpro.com/" + path) as System.Net.HttpWebRequest;


        request.KeepAlive = true;
        request.Method = "POST";

        request.ContentType = "application/json";
        request.Headers.Add("rest-key", key );
        request.Headers.Add("rest-sign", sign);


        byte[] byteArray = System.Text.Encoding.UTF8.GetBytes(command);
    //                request.ContentLength = byteArray.Length;
        using (var writer = request.GetRequestStream()){writer.Write(byteArray, 0, byteArray.Length);}

        string responseContent=null;
        using (var response = request.GetResponse() as System.Net.HttpWebResponse) {
            using (var reader = new System.IO.StreamReader(response.GetResponseStream())) {
                responseContent = reader.ReadToEnd();
                Console.WriteLine(responseContent);
            }
        }
    }
}
