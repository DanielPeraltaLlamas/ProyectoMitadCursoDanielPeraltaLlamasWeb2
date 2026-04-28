import app from './app.js';
import dbConnect from './config/db.js';
import { httpServer } from './app.js';

const PORT = process.env.PORT || 3000;

const startServer = async () => 
{
  await dbConnect();
  httpServer.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
  });
};

startServer();