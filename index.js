import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'
import connectDB from './config/db.js';
import { fileURLToPath } from "url";
import path from 'path';
import cookieParser from 'cookie-parser';

//routers
import authRoutes from './routes/authRouters.js';
import leadRouters from './routes/leadRouters.js'
import userRouters from './routes/userRouters.js'

import companyRouters from './routes/companyRouters.js'
import userActivityRouter from './routes/userActivityRouter.js'

import rightsRouters from "./routes/rightsRouters.js"
import cmsRouters from './routes/cmsRouters.js';


connectDB();
dotenv.config();
const app = express()
app.use(cookieParser());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

// Allow reading the real IP when behind proxies (very important)
app.set("trust proxy", true);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// ✅ Serve the uploads folder for direct access
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));




const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
  res.send("Server is Running!")
})

//Auth Route
app.use("/api/auth", authRoutes)

//contact lead
app.use(leadRouters)

//Users Rouet
app.use(userRouters)

//Users Rouet
app.use(companyRouters)

//users Activity logs Route
app.use(userActivityRouter)

//user Rights Routes
app.use("/api", rightsRouters)

//CMS Routes

app.use("/api/cms", cmsRouters);





app.listen(PORT, () => {
  console.log(`Server Running At ${PORT}!`)
})