// Render entry point - run backend server
const path = require('path');
process.chdir(path.join(__dirname, 'backend'));
require('./backend/server.js');
