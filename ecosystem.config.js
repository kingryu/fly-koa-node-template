const { name } = require('./package.json');
const { NODE_ENV } = process.env;

module.exports = {
  apps : [{
    name,
    script: 'app.js',
    autorestart: false,
    watch: false,
    env: {
      "NODE_PATH": ".",
      "NODE_ENV": "qa",
    }
  }]
};