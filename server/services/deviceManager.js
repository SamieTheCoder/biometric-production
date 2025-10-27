// services/deviceManager.js - COMPLETE FIXED VERSION

const ZKLib = require('node-zklib');

class DeviceManager {
  constructor() {
    this.activeConnections = new Map();
  }

  async connect(ip, port = 4370, timeout = 5000) {
    // ✅ FIX: Handle all possible IP formats
    let cleanIp = ip;
    
    // If IP is passed as object or has commas
    if (typeof ip === 'object' && ip !== null) {
      cleanIp = ip.toString();
    } else {
      cleanIp = String(ip);
    }
    
    // Remove any commas and take first IP
    cleanIp = cleanIp.split(',')[0].trim();
    
    const cleanPort = parseInt(port) || 4370;
    const cleanTimeout = parseInt(timeout) || 5000;
    const deviceKey = `${cleanIp}:${cleanPort}`;
    
    console.log(`🔌 Connecting to ${cleanIp}:${cleanPort}...`);
    
    // Check if already connected
    if (this.activeConnections.has(deviceKey)) {
      const existing = this.activeConnections.get(deviceKey);
      try {
        await existing.getInfo();
        console.log(`♻️ Reusing existing connection to ${deviceKey}`);
        return existing;
      } catch (error) {
        console.log(`❌ Existing connection dead, reconnecting to ${deviceKey}`);
        this.activeConnections.delete(deviceKey);
      }
    }

    // Create new connection
    const zkInstance = new ZKLib(cleanIp, cleanPort, cleanTimeout, 5000);
    
    try {
      await zkInstance.createSocket();
      console.log(`✅ Successfully connected to ${cleanIp}:${cleanPort}`);
      this.activeConnections.set(deviceKey, zkInstance);
      return zkInstance;
    } catch (error) {
      console.error(`❌ Connection failed to ${cleanIp}:${cleanPort}:`, error.message);
      throw new Error(`Failed to connect to device at ${cleanIp}:${cleanPort} - ${error.message}`);
    }
  }

  async disconnect(ip, port = 4370) {
    const cleanIp = String(ip).split(',')[0].trim();
    const cleanPort = parseInt(port) || 4370;
    const deviceKey = `${cleanIp}:${cleanPort}`;
    const zkInstance = this.activeConnections.get(deviceKey);
    
    if (zkInstance) {
      try {
        await zkInstance.disconnect();
        this.activeConnections.delete(deviceKey);
        console.log(`🔌 Disconnected from ${deviceKey}`);
        return true;
      } catch (error) {
        console.error(`Error disconnecting from ${deviceKey}:`, error.message);
        return false;
      }
    }
    return false;
  }

  disconnectAll() {
    for (const [key, zkInstance] of this.activeConnections) {
      try {
        zkInstance.disconnect();
        console.log(`🔌 Disconnected from ${key}`);
      } catch (error) {
        console.error(`Error disconnecting ${key}:`, error.message);
      }
    }
    this.activeConnections.clear();
  }

  getActiveConnections() {
    return Array.from(this.activeConnections.keys());
  }
}

module.exports = new DeviceManager();
