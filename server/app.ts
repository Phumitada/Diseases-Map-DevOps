import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";

dotenv.config();
const app = express();
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:3000',
      'http://localhost:5173',
      process.env.FRONTEND_URL!
    ]
    if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

import provinceRoutes from "./routes/provinceRoutes";
import authRoutes from "./routes/authRoutes";
import hospitalRoutes from "./routes/hospitalRoutes";
import reportRoutes from "./routes/reportRoutes";
import dataProvincesRoutes from "./routes/dataProvincesRoutes";
app.use("/api/provinces", provinceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/hospital", hospitalRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/dataProvince", dataProvincesRoutes);

export default app;