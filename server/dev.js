import config from './src/config.js';
import app from './src/app.js';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`
==================================================
🚀 QA Planning Assistant Server is running!
🌐 URL: http://localhost:${PORT}
⚡ Node Env: ${config.nodeEnv}
🤖 AI Model: ${config.geminiModel}
💾 DB URL: ${config.databaseUrl}
==================================================
  `);
});
