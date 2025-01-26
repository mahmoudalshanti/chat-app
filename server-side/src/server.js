import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import cookieParser from "cookie-parser";
import { app, server } from "./socket/socket.js";
import { fileURLToPath } from "url";
import path from "path";
import cors from "cors";

dotenv.config();

const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(
    express.static(path.join(__dirname, "..", "..", "/client-side/dist"))
  );

  app.get("*", (req, res) => {
    res.sendFile(
      path.resolve(__dirname, "..", "..", "client-side", "dist", "index.html")
    );
  });
}
server.listen(PORT, () => console.log(`Server Running on port ${PORT}`));
