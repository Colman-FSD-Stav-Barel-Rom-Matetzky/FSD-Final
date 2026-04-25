module.exports = {
  apps: [
    {
      name: 'Backend',
      script: './backend/dist/server.js',
      env: {
        NODE_ENV: 'production',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'Frontend',
      script: 'serve',
      env: {
        NODE_ENV: 'production',
        PM2_SERVE_PATH: './frontend/dist',
        PM2_SERVE_PORT: '80',
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: '/index.html',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
