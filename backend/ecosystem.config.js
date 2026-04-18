module.exports = {
  apps: [
    {
      name: 'Threadly-backend',
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
