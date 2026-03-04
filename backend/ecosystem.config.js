module.exports = {
  apps: [
    {
      name: 'socialapp-backend',
      script: 'dist/server.js',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
