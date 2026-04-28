import app from './app.js';
import dbConnect from './config/db.js';
import { httpServer } from './app.js';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 3000;

const gracefulShutdown = async (signal) => {
  const io = app.get('io');
  if (io) {
    io.close();
  }

  httpServer.close(async () => {
    await mongoose.connection.close();
    process.exit(0);
  });

  setTimeout(() => {
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

const startServer = async () => {
  await dbConnect();
  httpServer.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
  });
};

startServer();