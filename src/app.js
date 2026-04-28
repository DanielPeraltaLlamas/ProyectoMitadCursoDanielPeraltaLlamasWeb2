import express from "express";
import dbConnect from './config/db.js';
import helmet from "helmet";
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'node:path'
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import morganBody from 'morgan-body';
import { loggerStream } from './utils/handleLogger.js';
import routes from "./routes/index.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./docs/swagger.js";
import { createServer } from 'node:http'; 
import { Server } from 'socket.io';
import { authSocketMiddleware } from "./middleware/auth.socket.middleware.js";

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

io.use(authSocketMiddleware);

io.on('connection', (socket) => {
  const companyId = socket.user.companyId; 
  
  if (companyId) {
    socket.join(companyId.toString());
    console.log(`[WS] Usuario ${socket.user.id} unido a room: ${companyId}`);
  }

  socket.on('disconnect', () => {
    console.log(`[WS] Usuario desconectado: ${socket.id}`);
  });
});

app.set('io', io);


app.use(helmet());
app.use(cors());
app.use(express.json());
morganBody(app, {
  noColors: true,
  skip: (req, res) => res.statusCode < 400,
  stream: loggerStream
});
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.get('/health', (req, res) => 
{
  res.json({ status: 'ok' });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api", routes);
app.use(notFoundHandler);
app.use(errorHandler);

export { app, httpServer };
export default app;

