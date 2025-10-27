const deviceManager = require('./deviceManager');
const zkCommands = require('../utils/zkCommands');

class ZKService {
  constructor() {
    this.timezonesInitialized = false;
  }

  // Initialize timezones on device
  async initializeTimezones(zkInstance) {
    if (this.timezonesInitialized) {
      return;
    }

    try {
      await zkInstance.disableDevice();

      // Create ENABLED timezone (TZ 1): 00:00 - 23:59
      const enabledTzBuffer = zkCommands.buildTimezoneBuffer(zkCommands.TZ_ENABLED, true);
      await zkInstance.executeCmd(zkCommands.CMD_TZ_WRQ, enabledTzBuffer.toString('binary'));
      
      // Create DISABLED timezone (TZ 99): 23:59 - 00:00
      const disabledTzBuffer = zkCommands.buildTimezoneBuffer(zkCommands.TZ_DISABLED, false);
      await zkInstance.executeCmd(zkCommands.CMD_TZ_WRQ, disabledTzBuffer.toString('binary'));
      
      // Refresh device data
      await zkInstance.executeCmd(zkCommands.CMD_REFRESHDATA, '');
      
      await zkInstance.enableDevice();
      
      this.timezonesInitialized = true;
      console.log('✅ Timezones initialized successfully');
    } catch (error) {
      await zkInstance.enableDevice();
      console.error('❌ Failed to initialize timezones:', error.message);
      throw error;
    }
  }

  async testConnection(ip, port) {
    try {
      const zkInstance = await deviceManager.connect(ip, port);
      const info = await zkInstance.getInfo();
      return {
        success: true,
        connected: true,
        device: { ip, port },
        info
      };
    } catch (error) {
      return {
        success: false,
        connected: false,
        device: { ip, port },
        error: error.message
      };
    }
  }

  async getDeviceInfo(ip, port) {
    const zkInstance = await deviceManager.connect(ip, port);
    const info = await zkInstance.getInfo();
    return info;
  }

  async createUser(ip, port, userData) {
    const zkInstance = await deviceManager.connect(ip, port);
    
    // Initialize timezones if not done
    await this.initializeTimezones(zkInstance);
    
    await zkInstance.disableDevice();
    
    try {
      const userBuffer = zkCommands.buildUserBuffer(userData);
      await zkInstance.executeCmd(zkCommands.CMD_USER_WRQ, userBuffer.toString('binary'));
      
      // By default, assign to ENABLED timezone
      const users = await zkInstance.getUsers();
      const createdUser = users.data.find(u => parseInt(u.userId) === parseInt(userData.userId));
      
      if (createdUser) {
        const userSn = createdUser.uid;
        const tzBuffer = zkCommands.buildUserTimezoneBuffer(userSn, zkCommands.TZ_ENABLED);
        await zkInstance.executeCmd(zkCommands.CMD_USERTZ_WRQ, tzBuffer.toString('binary'));
      }
      
      await zkInstance.executeCmd(zkCommands.CMD_REFRESHDATA, '');
      await zkInstance.enableDevice();
      
      return {
        success: true,
        message: `User ${userData.name} (ID: ${userData.userId}) created successfully`,
        userId: userData.userId
      };
    } catch (error) {
      await zkInstance.enableDevice();
      throw error;
    }
  }

  async enrollFingerprint(ip, port, userId) {
    const zkInstance = await deviceManager.connect(ip, port);
    
    await zkInstance.disableDevice();
    
    try {
      const userIdString = userId.toString();
      const enrollBuffer = Buffer.alloc(userIdString.length + 1);
      enrollBuffer.write(userIdString, 0, userIdString.length, 'ascii');
      enrollBuffer.writeUInt8(0, userIdString.length);
      
      await zkInstance.executeCmd(zkCommands.CMD_STARTENROLL, enrollBuffer.toString('binary'));
      
      await zkInstance.enableDevice();
      
      return {
        success: true,
        message: `Fingerprint enrollment started for User ID ${userId}`,
        instructions: [
          'Place finger on scanner when device prompts',
          'Repeat finger placement 3-4 times',
          'Device will beep when enrollment is complete'
        ]
      };
    } catch (error) {
      await zkInstance.enableDevice();
      throw error;
    }
  }

  async getAllUsers(ip, port) {
    const zkInstance = await deviceManager.connect(ip, port);
    const users = await zkInstance.getUsers();
    return users;
  }

  async deleteUser(ip, port, userId) {
    const zkInstance = await deviceManager.connect(ip, port);
    
    await zkInstance.disableDevice();
    
    try {
      const deleteBuffer = Buffer.alloc(2);
      deleteBuffer.writeUInt16LE(userId, 0);
      
      await zkInstance.executeCmd(zkCommands.CMD_DELETE_USER, deleteBuffer.toString('binary'));
      
      await zkInstance.enableDevice();
      
      return {
        success: true,
        message: `User ${userId} deleted successfully`
      };
    } catch (error) {
      await zkInstance.enableDevice();
      throw error;
    }
  }

  async updateUser(ip, port, userId, updateData) {
    const zkInstance = await deviceManager.connect(ip, port);
    
    await zkInstance.disableDevice();
    
    try {
      const allUsers = await zkInstance.getUsers();
      const existingUser = allUsers.data.find(u => parseInt(u.uid) === parseInt(userId));
      
      if (!existingUser) {
        throw new Error(`User ${userId} not found`);
      }
      
      const userData = {
        userId: parseInt(userId),
        name: updateData.name || existingUser.name,
        password: updateData.password || existingUser.password || '123456',
        role: updateData.role !== undefined ? parseInt(updateData.role) : (existingUser.role || 0),
        cardId: updateData.cardId !== undefined ? parseInt(updateData.cardId) : (existingUser.cardno || 0)
      };
      
      const userBuffer = zkCommands.buildUserBuffer(userData);
      await zkInstance.executeCmd(zkCommands.CMD_USER_WRQ, userBuffer.toString('binary'));
      
      await zkInstance.enableDevice();
      
      return {
        success: true,
        message: `User ${userData.name} (ID: ${userId}) updated successfully (fingerprints preserved)`,
        userId: userId
      };
    } catch (error) {
      await zkInstance.enableDevice();
      throw error;
    }
  }

  // ✅ Enable user by assigning to ENABLED timezone
  async enableUser(ip, port, userId) {
    const zkInstance = await deviceManager.connect(ip, port);
    
    // Initialize timezones if not done
    await this.initializeTimezones(zkInstance);
    
    await zkInstance.disableDevice();
    
    try {
      const allUsers = await zkInstance.getUsers();
      const existingUser = allUsers.data.find(u => parseInt(u.userId) === parseInt(userId));
      
      if (!existingUser) {
        throw new Error(`User ${userId} not found`);
      }
      
      const userSn = existingUser.uid;
      
      // Assign user to ENABLED timezone (TZ 1)
      const tzBuffer = zkCommands.buildUserTimezoneBuffer(userSn, zkCommands.TZ_ENABLED);
      await zkInstance.executeCmd(zkCommands.CMD_USERTZ_WRQ, tzBuffer.toString('binary'));
      
      // Refresh device data
      await zkInstance.executeCmd(zkCommands.CMD_REFRESHDATA, '');
      
      await zkInstance.enableDevice();
      
      console.log(`✅ User ${userId} enabled - assigned to TZ ${zkCommands.TZ_ENABLED}`);
      
      return {
        success: true,
        message: `User ${userId} (${existingUser.name}) enabled successfully - attendance will NOW be recorded`,
        userId: userId,
        enabled: true
      };
    } catch (error) {
      await zkInstance.enableDevice();
      throw error;
    }
  }

  // ✅ Disable user by assigning to DISABLED timezone
  async disableUser(ip, port, userId) {
    const zkInstance = await deviceManager.connect(ip, port);
    
    // Initialize timezones if not done
    await this.initializeTimezones(zkInstance);
    
    await zkInstance.disableDevice();
    
    try {
      const allUsers = await zkInstance.getUsers();
      const existingUser = allUsers.data.find(u => parseInt(u.userId) === parseInt(userId));
      
      if (!existingUser) {
        throw new Error(`User ${userId} not found`);
      }
      
      const userSn = existingUser.uid;
      
      // Assign user to DISABLED timezone (TZ 99)
      const tzBuffer = zkCommands.buildUserTimezoneBuffer(userSn, zkCommands.TZ_DISABLED);
      await zkInstance.executeCmd(zkCommands.CMD_USERTZ_WRQ, tzBuffer.toString('binary'));
      
      // Refresh device data
      await zkInstance.executeCmd(zkCommands.CMD_REFRESHDATA, '');
      
      await zkInstance.enableDevice();
      
      console.log(`❌ User ${userId} disabled - assigned to TZ ${zkCommands.TZ_DISABLED}`);
      
      return {
        success: true,
        message: `User ${userId} (${existingUser.name}) disabled successfully - attendance will NOT be recorded`,
        userId: userId,
        enabled: false
      };
    } catch (error) {
      await zkInstance.enableDevice();
      throw error;
    }
  }

  async getUserStatus(ip, port, userId) {
    const zkInstance = await deviceManager.connect(ip, port);
    
    const allUsers = await zkInstance.getUsers();
    const user = allUsers.data.find(u => parseInt(u.userId) === parseInt(userId));
    
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    
    return {
      success: true,
      userId: parseInt(user.userId),
      name: user.name,
      role: user.role || 0,
      status: 'active' // You can enhance this by reading user timezone
    };
  }

  async getAttendanceLogs(ip, port) {
    const zkInstance = await deviceManager.connect(ip, port);
    const logs = await zkInstance.getAttendances();
    return logs;
  }

  async clearAttendanceLogs(ip, port) {
    const zkInstance = await deviceManager.connect(ip, port);
    await zkInstance.clearAttendanceLog();
    return { success: true, message: 'Attendance logs cleared' };
  }
}

module.exports = new ZKService();
