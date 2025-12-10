#!/usr/bin/env node

const https = require('https');
const http = require('http');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://capstone-03-quick-serve.vercel.app';
const BACKEND_URL = process.env.BACKEND_URL || 'https://your-backend.onrender.com';

console.log('🚀 QuickServe Deployment Verification\n');

// Test frontend
console.log('Testing Frontend...');
const frontendRequest = https.get(FRONTEND_URL, (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Frontend is accessible');
  } else {
    console.log(`❌ Frontend returned status: ${res.statusCode}`);
  }
});

frontendRequest.on('error', (err) => {
  console.log('❌ Frontend error:', err.message);
});

// Test backend
console.log('Testing Backend...');
const backendRequest = https.get(`${BACKEND_URL}/api/health`, (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Backend is accessible');
  } else {
    console.log(`❌ Backend returned status: ${res.statusCode}`);
  }
});

backendRequest.on('error', (err) => {
  console.log('❌ Backend error:', err.message);
});

console.log('\n📝 Next Steps:');
console.log('1. Deploy backend to Render/Railway');
console.log('2. Update VITE_PUBLIC_BACKEND_URL in frontend');
console.log('3. Redeploy frontend on Vercel');