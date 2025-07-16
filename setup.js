const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Todo Dashboard...\n');

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  const envContent = `MONGODB_URI=mongodb://localhost:27017/todo-dashboard
JWT_SECRET=your-secret-key-change-this-in-production
PORT=5000
CLIENT_URL=https://tododashboard-rpq8.onrender.com`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file with default configuration');
} else {
  console.log('ℹ️  .env file already exists');
}

// Check if MongoDB is mentioned in the setup
console.log('\n📋 Setup Checklist:');
console.log('1. ✅ .env file created/verified');
console.log('2. ⚠️  Make sure MongoDB is running on your system');
console.log('3. ⚠️  Update JWT_SECRET in .env for production use');
console.log('4. ⚠️  Install dependencies with: npm run install-all');
console.log('5. ⚠️  Start development with: npm run dev');

console.log('\n🎉 Setup complete! You can now run:');
console.log('   npm run install-all  # Install all dependencies');
console.log('   npm run dev          # Start development servers'); 