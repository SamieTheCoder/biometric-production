// installer/uninstall-service.js
const Service = require('node-windows').Service;
const path = require('path');

// Create service object (same as install)
const svc = new Service({
  name: 'Trackyfy Biometric Server',
  script: path.join(__dirname, '../server/server.js')
});

// Listen for the "uninstall" event
svc.on('uninstall', function() {
  console.log('✅ Service uninstalled successfully!');
  console.log('The Windows Service has been removed.');
});

// Uninstall the service
console.log('🗑️  Uninstalling Trackyfy Biometric Server...');
svc.uninstall();
