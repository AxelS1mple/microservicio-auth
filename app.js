const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

dotenv.config();
const app = express();
const port = process.env.PORT || 4000;

// Lista de orígenes permitidos
const allowedOrigins = [
  'http://localhost:5173',
  'https://microservicio-auth-view.vercel.app'
];

// Middleware CORS configurado correctamente
app.use(cors({
  origin: function (origin, callback) {
    // Permitir solicitudes sin origen (como en POSTMAN o curl)
    if (!origin) return callback(null, true);
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

// Middleware para analizar JSON y cookies
app.use(express.json());
app.use(cookieParser());

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch((err) => console.error("❌ Error de conexión:", err));

// Rutas de autenticación
app.use("/api/auth", require("./routes/auth.routes"));

// Escuchar el servidor
app.listen(port, () => {
  console.log(`🚀 Servidor en http://localhost:${port}`);
});
