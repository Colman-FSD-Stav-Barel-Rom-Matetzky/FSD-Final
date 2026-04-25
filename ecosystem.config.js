module.exports = {
  apps: [
    {
      name: 'Backend',
      script: './dist/server.js',
      cwd: './backend',
      env: {
        NODE_ENV: 'production',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'Frontend',
      script: './serve-https.js',
      cwd: './frontend',
      env: {
        NODE_ENV: 'production',
        FRONTEND_HTTPS_PORT: '443',
      },
      env_production: {
        NODE_ENV: 'production',
        FRONTEND_HTTPS_PORT: '443',
      },
    },
  ],
};
