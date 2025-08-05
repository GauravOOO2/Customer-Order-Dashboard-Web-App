// kill-port.js - Helper script to kill processes on a specific port
const { execSync } = require('child_process');

const killPort = (port) => {
  try {
    console.log(`🔍 Checking for processes using port ${port}...`);
    
    // Find processes using the port
    const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    
    if (!result) {
      console.log(`✅ Port ${port} is free`);
      return;
    }
    
    // Extract PIDs from netstat output
    const lines = result.split('\n').filter(line => line.includes('LISTENING'));
    const pids = new Set();
    
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0' && !isNaN(pid)) {
        pids.add(pid);
      }
    });
    
    if (pids.size === 0) {
      console.log(`✅ No processes found listening on port ${port}`);
      return;
    }
    
    // Kill each process
    pids.forEach(pid => {
      try {
        console.log(`🔪 Killing process ${pid}...`);
        execSync(`taskkill /PID ${pid} /F`, { encoding: 'utf8' });
        console.log(`✅ Process ${pid} terminated`);
      } catch (error) {
        console.log(`⚠️  Could not kill process ${pid}: ${error.message}`);
      }
    });
    
    console.log(`🎉 Port ${port} should now be free`);
    
  } catch (error) {
    console.log(`✅ Port ${port} appears to be free (no processes found)`);
  }
};

// Get port from command line argument or use default
const port = process.argv[2] || 5002;
killPort(port);
