import dns from 'dns';
import { promisify } from 'util';

const resolveSrv = promisify(dns.resolveSrv);
const resolveTxt = promisify(dns.resolveTxt);
const lookup = promisify(dns.lookup);

async function diagnose() {
  const hostname = 'cluster0.bz057of.mongodb.net';
  const srvDomain = '_mongodb._tcp.cluster0.bz057of.mongodb.net';

  console.log(`--- Diagnosing Connection to ${hostname} ---`);

  try {
    console.log(`1. Testing basic DNS lookup for ${hostname}...`);
    const address = await lookup(hostname);
    console.log(`   ✅ Success: ${address.address}`);
  } catch (err) {
    console.log(`   ❌ Failed: ${err.message}`);
  }

  try {
    console.log(`2. Testing SRV record lookup for ${srvDomain}...`);
    const records = await resolveSrv(srvDomain);
    console.log(`   ✅ Success: Found ${records.length} records.`);
    records.forEach(r => console.log(`      - ${r.name}:${r.port}`));
  } catch (err) {
    console.log(`   ❌ Failed: ${err.message}`);
    console.log(`      Tip: This often means your DNS provider or firewall is blocking SRV lookups.`);
  }

  try {
    console.log(`3. Testing TXT record lookup for ${hostname}...`);
    const txtRecords = await resolveTxt(hostname);
    console.log(`   ✅ Success: Found TXT records.`);
  } catch (err) {
    console.log(`   ❌ Failed: ${err.message}`);
  }
}

diagnose();
