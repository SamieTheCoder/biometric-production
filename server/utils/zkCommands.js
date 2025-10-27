const zkCommands = {
  CMD_USER_WRQ: 8,
  CMD_DELETE_USER: 18,
  CMD_STARTENROLL: 61,
  CMD_REGEVENT: 500,
  CMD_USERTZ_RRQ: 23,       // Get user timezone
  CMD_USERTZ_WRQ: 24,       // Set user timezone
  CMD_TZ_RRQ: 27,            // Get timezone definition
  CMD_TZ_WRQ: 28,            // Set timezone definition
  CMD_REFRESHDATA: 1013,     // Refresh device data
  EF_ENROLLUSER: 4,
  EF_ENROLLFINGER: 8,

  // Timezone IDs
  TZ_ENABLED: 1,    // Timezone for enabled users (00:00 - 23:59)
  TZ_DISABLED: 99,  // Timezone for disabled users (23:59 - 00:00)

  // Permission/Role definitions
  ROLE_USER: 0,
  ROLE_ENROLLER: 2,
  ROLE_ADMIN: 6,
  ROLE_SUPER: 14,

  buildUserBuffer(userData) {
    const { userId, name, password, role, cardId } = userData;
    
    const userBuffer = Buffer.alloc(72);
    let offset = 0;
    
    // User Serial Number (2 bytes)
    userBuffer.writeUInt16LE(userId, offset);
    offset += 2;
    
    // Permission/Role byte (1 byte)
    userBuffer.writeUInt8(role || 0, offset);
    offset += 1;
    
    // Password (8 bytes)
    const pwd = (password || '123456').substring(0, 8);
    userBuffer.write(pwd, offset, 8, 'ascii');
    offset += 8;
    
    // Name (24 bytes)
    const userName = name.substring(0, 24);
    userBuffer.write(userName, offset, 24, 'ascii');
    offset += 24;
    
    // Card Number (4 bytes)
    if (cardId) {
      userBuffer.writeUInt32LE(cardId, offset);
    }
    offset += 4;
    
    // Group (1 byte)
    userBuffer.writeUInt8(1, offset);
    offset += 1;
    
    // User TZ Flag (2 bytes)
    userBuffer.writeUInt16LE(0, offset);
    offset += 2;
    
    // TZ1, TZ2, TZ3 (6 bytes total)
    offset += 6;
    
    // User ID String (9 bytes)
    const userIdStr = userId.toString().substring(0, 9);
    userBuffer.write(userIdStr, offset, 9, 'ascii');
    offset += 9;
    
    return userBuffer;
  },

  // Build timezone definition (32 bytes)
  buildTimezoneBuffer(tzIndex, enabled) {
    const tzBuffer = Buffer.alloc(32);
    let offset = 0;
    
    // Timezone index (4 bytes, little endian)
    tzBuffer.writeUInt32LE(tzIndex, offset);
    offset += 4;
    
    // Each day timezone (4 bytes each) - 7 days
    // Format: [start_hour, start_minute, end_hour, end_minute]
    
    if (enabled) {
      // ENABLED: 00:00 - 23:59 (allows attendance all day)
      const enabledTime = Buffer.from([0x00, 0x00, 0x17, 0x3B]); // 00:00 - 23:59
      
      for (let i = 0; i < 7; i++) {
        enabledTime.copy(tzBuffer, offset);
        offset += 4;
      }
    } else {
      // DISABLED: 23:59 - 00:00 (invalid range blocks attendance)
      const disabledTime = Buffer.from([0x17, 0x3B, 0x00, 0x00]); // 23:59 - 00:00
      
      for (let i = 0; i < 7; i++) {
        disabledTime.copy(tzBuffer, offset);
        offset += 4;
      }
    }
    
    console.log(`Built timezone ${tzIndex}: enabled=${enabled}`);
    
    return tzBuffer;
  },

  // Build user timezone assignment (20 bytes)
  buildUserTimezoneBuffer(userSn, tzIndex) {
    const buffer = Buffer.alloc(20);
    let offset = 0;
    
    // User SN (4 bytes, little endian)
    buffer.writeUInt32LE(userSn, offset);
    offset += 4;
    
    // User TZ flag (4 bytes) - 1 = use own timezone, 0 = use group timezone
    buffer.writeUInt32LE(1, offset); // Use own timezone
    offset += 4;
    
    // TZ1 (4 bytes, little endian) - Primary timezone
    buffer.writeUInt32LE(tzIndex, offset);
    offset += 4;
    
    // TZ2 (4 bytes) - unused
    buffer.writeUInt32LE(0, offset);
    offset += 4;
    
    // TZ3 (4 bytes) - unused
    buffer.writeUInt32LE(0, offset);
    
    console.log(`Assigned user ${userSn} to timezone ${tzIndex}`);
    
    return buffer;
  }
};

module.exports = zkCommands;
