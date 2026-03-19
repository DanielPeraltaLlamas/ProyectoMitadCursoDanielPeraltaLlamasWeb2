import express from "express";
import dbConnect from './config/db.js';
import userRouter from "./routes/user.routes.js";

const app = express();

app.use(express.json());

app.get('/health', (req, res) => 
{
  res.json({ status: 'ok' });
});

app.use("/api/user", userRouter);

const PORT = process.env.PORT || 3000;

const startServer = async () => 
{
  await dbConnect();
  app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
  });
};

startServer();