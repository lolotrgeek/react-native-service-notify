const blacklist = require('metro-config/src/defaults/blacklist');

module.exports = {
    resolver: {
      /* resolver options */
      blacklistRE : blacklist(['android\\app\\src\\main\\assets\\nodejs-project'])
    },
    transformer: {
      /* transformer options */
    },
    serializer: {
      /* serializer options */
    },
    server: {
      /* server options */
    }
  
    /* general options */
  };