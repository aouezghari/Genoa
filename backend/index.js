import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
dotenv.config();
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import treeRoutes from './routes/tree.routes.js';

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: function (origin, callback) {

      callback(null, true);
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/tree', treeRoutes);

app.get("/", ( _ , res) => {
  res.send("Hello World");
});
mongoose.connect(
 process.env.MONGO_URI,
);
app.listen(process.env.PORT, () => {
  console.log(`Server is Running on port ${process.env.PORT}`);
});
