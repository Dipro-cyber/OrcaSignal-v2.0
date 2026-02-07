const fs = require('fs');
const path = require('path');

console.log('🔍 OrcaSignal Setup Verification (Foundry)\n');

const requiredFiles = [
  // Root files
  'package.json',
  'foundry.toml',
  'remappings.txt',
  '.env.example',
  '.gitignore',
  'README.md',
  
  // Smart contract files
  'src/OrcaSignalRegistry.sol',
  'script/Deploy.s.sol',
  'script/Interact.s.sol',
  'test/OrcaSignalRegistry.t.sol',
  
  // Backend files
  'backend/package.json',
  'backend/server.js',
  'backend/.env.example',
  'backend/services/riskAnalyzer.js',
  'backend/services/contractService.js',
  
  // Frontend files
  'frontend/package.json',
  'frontend/public/index.html',
  'frontend/public/manifest.json',
  'frontend/src/index.js',
  'frontend/src/App.js',
  'frontend/src/App.css',
  'frontend/src/index.css',
  'frontend/src/components/RiskAnalysis.js',
  'frontend/src/components/WalletConnect.js',
  'frontend/src/components/RiskThresholds.js'
];

const requiredDirectories = [
  'src',
  'script', 
  'test',
  'backend',
  'backend/services',
  'frontend',
  'frontend/src',
  'frontend/src/components',
  'frontend/public'
];

let allGood = true;

// Check directories
console.log('📁 Checking directories...');
requiredDirectories.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}`);
  } else {
    console.log(`❌ ${dir} - MISSING`);
    allGood = false;
  }
});

console.log('\n📄 Checking files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    if (stats.size > 0) {
      console.log(`✅ ${file} (${stats.size} bytes)`);
    } else {
      console.log(`⚠️  ${file} - EXISTS BUT EMPTY`);
    }
  } else {
    console.log(`❌ ${file} - MISSING`);
    allGood = false;
  }
});

// Check package.json dependencies
console.log('\n📦 Checking dependencies...');
try {
  const rootPkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const backendPkg = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
  const frontendPkg = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
  
  console.log(`✅ Root package.json - ${Object.keys(rootPkg.devDependencies || {}).length} dev dependencies`);
  console.log(`✅ Backend package.json - ${Object.keys(backendPkg.dependencies || {}).length} dependencies`);
  console.log(`✅ Frontend package.json - ${Object.keys(frontendPkg.dependencies || {}).length} dependencies`);
} catch (error) {
  console.log(`❌ Error reading package.json files: ${error.message}`);
  allGood = false;
}

// Check Foundry configuration
console.log('\n🔧 Checking Foundry setup...');
if (fs.existsSync('foundry.toml')) {
  console.log('✅ foundry.toml exists');
} else {
  console.log('❌ foundry.toml missing');
  allGood = false;
}

if (fs.existsSync('remappings.txt')) {
  console.log('✅ remappings.txt exists');
} else {
  console.log('❌ remappings.txt missing');
  allGood = false;
}

// Check environment files
console.log('\n🔧 Checking environment setup...');
if (fs.existsSync('.env.example')) {
  console.log('✅ .env.example exists');
} else {
  console.log('❌ .env.example missing');
  allGood = false;
}

if (fs.existsSync('backend/.env.example')) {
  console.log('✅ backend/.env.example exists');
} else {
  console.log('❌ backend/.env.example missing');
  allGood = false;
}

console.log('\n🎯 Summary:');
if (allGood) {
  console.log('✅ All required files and directories are present!');
  console.log('\n🚀 Next steps:');
  console.log('1. Install Foundry: curl -L https://foundry.paradigm.xyz | bash && foundryup');
  console.log('2. Run: npm run install:all');
  console.log('3. Install Foundry deps: forge install foundry-rs/forge-std --no-commit');
  console.log('4. Configure .env files with your RPC URLs and private key');
  console.log('5. Run: forge build');
  console.log('6. Run: forge test');
  console.log('7. Run: npm run deploy:sepolia (or deploy:local with anvil)');
  console.log('8. Update backend/.env with contract address');
  console.log('9. Run: npm run dev');
} else {
  console.log('❌ Some files are missing. Please check the output above.');
  process.exit(1);
}

console.log('\n📋 Project Structure (Foundry):');
console.log('OrcaSignal/');
console.log('├── src/                 # Solidity smart contracts');
console.log('├── script/              # Foundry deployment scripts');
console.log('├── test/                # Solidity tests');
console.log('├── backend/             # Node.js API server');
console.log('│   └── services/        # Risk analysis services');
console.log('├── frontend/            # React web application');
console.log('│   ├── public/          # Static assets');
console.log('│   └── src/             # React components');
console.log('│       └── components/  # UI components');
console.log('├── foundry.toml         # Foundry configuration');
console.log('├── remappings.txt       # Import remappings');
console.log('└── lib/                 # Foundry dependencies');