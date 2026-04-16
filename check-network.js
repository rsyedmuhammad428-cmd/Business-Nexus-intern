import http from 'http';
import net from 'net';

async function checkNetworking() {
  console.log('--- Network & Port Diagnostics ---');

  // 1. Get Public IP
  try {
    console.log('1. Detecting your public IP address...');
    const ip = await new Promise((resolve, reject) => {
      http.get('http://ifconfig.me/ip', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data.trim()));
      }).on('error', reject);
    });
    console.log(`   ✅ Your Public IP is: ${ip}`);
    console.log(`   👉 Make sure THIS IP (or 0.0.0.0/0) is active in your MongoDB Atlas "IP Access List".`);
  } catch (err) {
    console.log(`   ❌ Failed to detect IP: ${err.message}`);
  }

  // 2. Test Port 27017 connectivity
  const host = 'ac-4wvvo7m-shard-00-00.bz057of.mongodb.net';
  const port = 27017;
  console.log(`\n2. Testing connection to shard host on port ${port}...`);
  
  const socket = new net.Socket();
  const timeout = 5000;
  
  socket.setTimeout(timeout);
  const start = Date.now();

  socket.connect(port, host, () => {
    console.log(`   ✅ Success! Port ${port} is reachable in ${Date.now() - start}ms.`);
    socket.destroy();
  });

  socket.on('error', (err) => {
    console.log(`   ❌ Port ${port} is UNREACHABLE: ${err.message}`);
    console.log(`      Tip: Your ISP or local firewall might be blocking port 27017.`);
    socket.destroy();
  });

  socket.on('timeout', () => {
    console.log(`   ❌ Port ${port} connection TIMED OUT after ${timeout}ms.`);
    socket.destroy();
  });
}

checkNetworking();
