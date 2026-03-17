module.exports = {
  apps: [
    {
      name: 'codearena-api',
      // Adjust 'index.js' if your entry point is named differently (e.g., app.js or server.js)
      script: './src/main.js', 
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
      }
    },
    {
      name: 'codearena-worker',
      // Path to your submission worker logic
      script: './src/workers/submission.worker.js', 
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
      }
    }
  ]
};