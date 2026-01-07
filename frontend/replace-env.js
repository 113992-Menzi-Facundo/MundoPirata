const fs = require('fs');
const path = require('path');

// Get build arguments from environment or use defaults
const API_URL = process.env.API_URL || 'http://localhost:8080';
const MERCADOPAGO_PUBLIC_KEY = process.env.MERCADOPAGO_PUBLIC_KEY || 'APP_USR-7455f78f-5166-463f-b145-cf2fc137b34f';

// Read the production environment file
const envPath = path.join(__dirname, 'src', 'environments', 'environment.prod.ts');
let envContent = fs.readFileSync(envPath, 'utf8');

// Replace placeholders or default values
envContent = envContent.replace(
  /apiUrl:\s*['"](.*?)['"]/,
  `apiUrl: '${API_URL}'`
);

envContent = envContent.replace(
  /publicKey:\s*['"](.*?)['"]/,
  `publicKey: '${MERCADOPAGO_PUBLIC_KEY}'`
);

// Write back the file
fs.writeFileSync(envPath, envContent, 'utf8');

console.log('Environment variables replaced:');
console.log(`  API_URL: ${API_URL}`);
console.log(`  MERCADOPAGO_PUBLIC_KEY: ${MERCADOPAGO_PUBLIC_KEY}`);

