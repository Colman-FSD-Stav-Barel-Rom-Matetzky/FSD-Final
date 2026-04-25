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
      script: 'serve',
      cwd: './frontend',
      env: {
        NODE_ENV: 'production',
        PM2_SERVE_PATH: './dist',
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
