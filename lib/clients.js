var server_ip = require('./ip');
var server_port = require('./port');

var clientsList = [];
var redisClient = null;
var redisChannel = server_ip + ':' + server_port;

module.exports = {

  setRedisClient: function(redisPubConnection) {
    redisClient = redisPubConnection;
  },

  // Send message to specific client
  send: function(client, message, lookup) {

    // Send local
    if (typeof clientsList[client] != 'undefined') {
      return clientsList[client].write(message);
    }

    if (lookup !== false) {
      redisClient.hget('clients', client, function(error, server) {
        if (server) {
          redisClient.publish(server, '/send ' + client + ' ' + message);
        } else {
          console.error('client ' + client + ' not recognized');
        }
      });
    }
  },

  // Broadcast the message to all connected clients.
  broadcast: function(data) {

    for (var i = 0; i < clientsList.length; i++) {
      clientsList[i].write(data);
    }
  },

  // Add client
  add: function(connection) {

    var clientID = connection.remoteAddress + ':' + connection.remotePort;

    clientsList[clientID] = connection;

    redisClient.hset('clients', clientID, redisChannel);
  },

  // Remove client
  remove: function(connection) {

    var clientID = connection.remoteAddress + ':' + connection.remotePort;

    clientsList.splice(clientsList.indexOf(connection), 1);

    redisClient.hdel('clients', clientID);
  },

  // Get local clients
  getLocalClients: function() {
    // redisClient.hkeys(redisChannel, callback);
    var clientsIPS = [];
    for (var clientID in clientsList) {
      if (clientsList.hasOwnProperty(clientID)) {
        clientsIPS.push(clientID);
      }
    }

    return clientsIPS;
  }
};
