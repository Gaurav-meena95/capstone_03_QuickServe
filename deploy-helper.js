#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 QuickServe Deployment Helper\n');

// Check if backend URL is provided
const backendUrl = process.argv[2];
if (!backendUrl) {
    console.log('❌ Please provide the backend URL as an argument');
    console.log('Usage: node deploy-helper.js https://your-backend.onrender.com');
    process.exit(1);
}

// Validate URL format
try {
    new URL(backendUrl);
} catch (error) {
    console.log('❌ Invalid URL format');
    process.exit(1);
}

// Update frontend environment file
const envPath = path.join(__dirname, 'Frontend', 'quick_serve', '.env.production');
const envContent = `VITE_PUBLIC_BACKEND_URL=${backendUrl}`;

try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Updated frontend environment file');
    console.log(`   VITE_PUBLIC_BACKEND_URL=${backendUrl}`);
} catch (error) {
    console.log('❌ Failed to update environment file:', error.message);
    process.exit(1);
}

console.log('\n📝 Next Steps:');
console.log('1. Commit and push changes:');
console.log('   git add .');
console.log('   git commit -m "Update production backend URL"');
console.log('   git push origin main');
console.log('2. Vercel will automatically redeploy');
console.log('3. Test the deployment at: https://capstone-03-quick-serve.vercel.app');

console.log('\n🔗 URLs:');
console.log(`Frontend: https://capstone-03-quick-serve.vercel.app`);
console.log(`Backend:  ${backendUrl}`);
console.log(`Health:   ${backendUrl}/api/health`);