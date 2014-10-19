var http = require('http');
var httpProxy = require('http-proxy');
var addresses = require('./lib/servers');

//
// Create a HttpProxy object for each target
//
var proxies = addresses.map(function (target) {
  return new httpProxy.createProxyServer({
    target: target
  });
});

//
// A simple round-robin load balancing strategy.
//
// Get the proxy at the front of the array, put it at the end and return it
// If you want a fancier balancer, put your code here
//
function nextProxy() {
  var proxy = proxies.shift();
  proxies.push(proxy);
  return proxy;
}

// 
// Get the 'next' proxy and send the http request 
//
var server = http.createServer(function (req, res) {    
  nextProxy().web(req, res);
});

// 
// Get the 'next' proxy and send the upgrade request 
//
server.on('upgrade', function (req, socket, head) {
  nextProxy().ws(req, socket, head);
});

server.listen(80);
