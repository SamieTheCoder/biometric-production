// installer/install-service.js
const Service = require('node-windows').Service;
const path = require('path');

// Create a new service object
const svc = new Service({
  name: 'Trackyfy Biometric Server',
  description: 'ESSL Biometric Device Integration Server for Trackyfy Gym Management',
  script: path.join(__dirname, '../server/server.js'),
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ],
  env: [
    {
      name: "NODE_ENV",
      value: "production"
    },
    {
      name: "PORT",
      value: "3000"
    }
  ]
});

// Listen for the "install" event
svc.on('install', function() {
  console.log('✅ Service installed successfully!');
  console.log('Starting service...');
  svc.start();
});

// Listen for the "start" event
svc.on('start', function() {
  console.log('✅ Service started successfully!');
  console.log('🚀 Trackyfy Biometric Server is now running as a Windows Service');
  console.log('📡 Server URL: http://localhost:3000');
  console.log('\nTo manage this service:');
  console.log('  - Open Services (services.msc)');
  console.log('  - Find "Trackyfy Biometric Server"');
  console.log('  - Right-click to Start/Stop/Restart');
});

// Listen for errors
svc.on('error', function(err) {
  console.error('❌ Service installation error:', err);
});

// Install the service
console.log('📦 Installing Trackyfy Biometric Server as Windows Service...');
svc.install();
