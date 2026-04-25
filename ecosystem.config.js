module.exports = {
  apps: [
    {
      name: 'Backend',
      script: './backend/dist/server.js',
      env_production: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'Frontend',
      script: 'serve',
      env: {
        PM2_SERVE_PATH: './frontend/dist',
        PM2_SERVE_PORT: '80',
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: '/index.html',
      },
    },
  ],
};
