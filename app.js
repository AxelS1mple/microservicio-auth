const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

dotenv.config();
const app = express();
const port = process.env.PORT || 4000;

// Dominio frontend exacto permitido
const allowedOrigins = [
  'https://microservicio-auth-view-nabdljmjp-axels1mples-projects.vercel.app',
  'http://localhost:5173' // solo si pruebas local
];

// Configurar CORS
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Para Postman u otros
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch((err) => console.error("❌ Error de conexión:", err));

// Rutas
app.use("/api/auth", require("./routes/auth.routes"));

// Servidor
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
