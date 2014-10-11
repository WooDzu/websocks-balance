var port = 80;

// Get listening port
if (process.argv.length > 2 && parseInt(process.argv[2]) > 9) {
  port = parseInt(process.argv[2]);
}

module.exports = port;
