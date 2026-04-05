import express from "express";
import dbConnect from './config/db.js';
import userRouter from "./routes/user.routes.js";
import helmet from "helmet";
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'node:path'
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
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

app.use("/api/user", userRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

