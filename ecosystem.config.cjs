module.exports = {
    apps: [
      {
        name: 'TRANSPORT TRACKING APP',
        port: '3003',
        exec_mode: 'cluster',
        instances: 'max',
        script: './.output/server/index.mjs',
  
        // Error handling
        max_restarts: 10,
        min_uptime: '5s',
  
        // Logging
        error_file: 'logs/err.log',
        out_file: 'logs/out.log',
        merge_logs: true,
  
        // Environment variables
        env: {
          NODE_ENV: 'production',
        },
  
        // Resource management
        max_memory_restart: '1G',
  
        // Graceful shutdown
        kill_timeout: 3000,
  
        // Watch options
        watch: false,
  
        // Restart delay
        restart_delay: 1000,
      },
    ],
  };
  