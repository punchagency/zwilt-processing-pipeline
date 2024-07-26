module.exports = {
  apps: [
    {
      name: 'app',
      script: 'dist/index.js',
      instances: 1, 
      env: {
        NODE_ENV: 'development',
      },
      env_staging: {
        NODE_ENV: 'staging',
      },
    },
  ],
};
