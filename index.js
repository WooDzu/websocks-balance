var http = require('http');
var redis = require('redis');
var sockjs = require('sockjs');
var node_static = require('node-static');

var clients = require('./lib/clients');
var server_ip = require('./lib/ip');
var server_port = require('./lib/port');
var redisChannel = server_ip + ':' + server_port;

/*******************
 * Setup
 *******************/

// Setup Redis pub/sub
var pub = redis.createClient(6379, '127.0.0.1', {});
var sub = redis.createClient(6379, '127.0.0.1', {});

sub.subscribe(redisChannel);
sub.subscribe('global');

clients.setRedisClient(pub);

// Setup our SockJS server and static server
var static_serv = new node_static.Server(__dirname);
var ws = sockjs.createServer();

/*******************
 * Events
 *******************/

sub.on('message', function(channel, message) {

  console.log('[' + channel + '] ' + message);

  if (message[0] != '/') {
    return;
  }

  var cmd = message.split(' ');

  switch(cmd[0]) {

    case '/send':
      clients.send(cmd[1], '[MSG] ' + cmd[2], false);
      break;
  }
});

ws.on('connection', function(conn) {

  // Add this client to the client list.
  clients.add(conn);

  // Listen for data coming from clients.
  conn.on('data', function(message) {

    if (message[0] != '/') {
      return pub.publish('global', message);
    }

    var cmd = message.split(' ');

    switch(cmd[0]) {

      case '/getlocal':
        conn.write("[LOCAL CLIENTS]: " + clients.getLocalClients().join(","));
        break;

      case '/getglobal':
        pub.hgetall('clients', function(error, data) {
          conn.write('[GLOBAL CLIENTS]: ' + JSON.stringify(data));
        });
        break;

      case '/send':
        clients.send(cmd[1], cmd[2]);
        break;

      default:
        conn.write('Unknown Command: ' + cmd);
        break;
    }

  });

  // Remove the client from the list.
  conn.on('close', function() {
    clients.remove(conn);
  });
});

/*******************
 * Run
 *******************/

var server = http.createServer();

server.addListener('request', function(req, res) {
  static_serv.serve(req, res);
});
server.addListener('upgrade', function(req,res){
  res.end();
});

ws.installHandlers(server, {prefix: '/echo'});

console.log(server_ip + ' listening on 0.0.0.0:' + server_port);
pub.publish('global', 'server connected on: ' + server_ip + ':'+ server_port);

server.listen(server_port, '0.0.0.0');
