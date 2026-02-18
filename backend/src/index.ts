import app, { closeDatabaseConnections, connectDatabase } from './app';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDatabase();

  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  const gracefulShutdown = (reason: string, err?: unknown) => {
    console.error(reason, err);

    server.close(async () => {
      try {
        await closeDatabaseConnections();
        console.log('Clean shutdown complete');
      } catch (shutdownError) {
        console.error('Shutdown error:', shutdownError);
      } finally {
        process.exit(1);
      }
    });
  };

  process.on('unhandledRejection', (reason) => {
    console.error('UNHANDLED PROMISE REJECTION', reason);
  });

  process.on('uncaughtException', (err, origin) => {
    console.error('UNCAUGHT EXCEPTION', err, origin);
  });

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM RECEIVED'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT RECEIVED'));
};

startServer().catch((err) => {
  console.error('Server start failed:', err);
  process.exit(1);
});
