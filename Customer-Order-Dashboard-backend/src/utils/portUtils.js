// src/utils/portUtils.js
const net = require('net');

const isPortAvailable = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, (err) => {
      if (err) {
        resolve(false);
      } else {
        server.once('close', () => {
          resolve(true);
        });
        server.close();
      }
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
};

const findAvailablePort = async (startPort = 5000, maxAttempts = 20) => {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    const available = await isPortAvailable(port);
    if (available) {
      return port;
    }
  }
  throw new Error(`No available port found after checking ${maxAttempts} ports starting from ${startPort}`);
};

module.exports = {
  isPortAvailable,
  findAvailablePort
};
