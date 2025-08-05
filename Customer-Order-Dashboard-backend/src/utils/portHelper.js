// Helper function to find available port
const net = require('net');

const findAvailablePort = (startPort = 5000, maxAttempts = 10) => {
  return new Promise((resolve, reject) => {
    let port = startPort;
    let attempts = 0;

    const tryPort = (testPort) => {
      if (attempts >= maxAttempts) {
        return reject(new Error(`No available port found after ${maxAttempts} attempts`));
      }

      const server = net.createServer();
      
      server.listen(testPort, (err) => {
        if (err) {
          attempts++;
          return tryPort(testPort + 1);
        }
        
        server.once('close', () => {
          resolve(testPort);
        });
        
        server.close();
      });
      
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          attempts++;
          tryPort(testPort + 1);
        } else {
          reject(err);
        }
      });
    };

    tryPort(port);
  });
};

module.exports = { findAvailablePort };
