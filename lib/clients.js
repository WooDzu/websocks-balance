var redis = require('redis');
var server_ip = require('./ip');
var server_port = require('./port');

var clients = [];
var redisClient = redis.createClient(6379, '127.0.0.1', {});
var redisChannel = 'clients-' + server_ip + '-' + server_port;

/**
 * Export module
 */

module.exports = {

  // Send message to specific client
  send: function(client, message, callback) {
    if (typeof clients[client] == 'undefined') {
      return console.error('I DO NOT HOLD CLIENT: ' + client);
    }

    clients[client].write(message);

    if (typeof cllback != 'undefined') {
      callback();
    }
  },

  // Broadcast the message to all connected clients.
  broadcast: function(data, cllback) {

    for (var i = 0; i < clients.length; i++) {
      clients[i].write(data);
    }

    if (typeof cllback != 'undefined') {
      callback();
    }
  },

  // Add client
  add: function(connection, callback) {

    var clientID = connection.remoteAddress + ':' + connection.remotePort;

    clients[clientID] = connection;

    redisClient.hset(redisChannel, clientID, {});

    if (typeof cllback != 'undefined') {
      callback();
    }
  },

  // Remove client
  remove: function(connection, callback) {

    var clientID = connection.remoteAddress + ':' + connection.remotePort;

    clients.splice(clients.indexOf(connection), 1);

    redisClient.hdel(redisChannel, clientID);

    if (typeof cllback != 'undefined') {
      callback();
    }
  },

  // Get local clients
  getLocal: function(callback) {
    redisClient.hkeys(redisChannel, callback);
  }
};

/**
 * Clear clients
 */
module.exports.getLocal(function(error, clients) {
  clients && clients.forEach(function(val) {
    redisClient.hdel(redisChannel, val);
  });
});
