var os = require('os');

var ifaces = os.networkInterfaces();
var ips = [];

for (var dev in ifaces) {
  ifaces[dev].forEach(function(details){
    if (details.family == 'IPv4' && details.address != '127.0.0.1') {
      ips.push(details.address);
    }
  });
}

module.exports = ips[0];
