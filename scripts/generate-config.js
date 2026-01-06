const fs = require('fs');
const path = require('path');
require('dotenv').config();

const API_BASE = process.env.API_BASE || '';
const FUNCTION_KEY = process.env.FUNCTION_KEY || '';
const PRIVY_TEMPLATE_URL = process.env.PRIVY_TEMPLATE_URL || '';

const out = `// Generated config - do NOT commit secrets
window.__APP_CONFIG = {
  API_BASE: ${JSON.stringify(API_BASE)},
  FUNCTION_KEY: ${JSON.stringify(FUNCTION_KEY)},
  PRIVY_TEMPLATE_URL: ${JSON.stringify(PRIVY_TEMPLATE_URL)}
};
`;

const outPath = path.join(__dirname, '..', 'js', 'config.js');
fs.writeFileSync(outPath, out, { encoding: 'utf8' });
console.log('Wrote', outPath);
