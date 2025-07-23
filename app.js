const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

dotenv.config();
const app = express();
const port = process.env.PORT || 4000;

const allowedOrigins = [
  'http://localhost:5173',
  'https://microservicio-auth-view.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("No permitido por CORS"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200, // importante para algunos navegadores
};

// Usar CORS con opciones
app.use(cors(corsOptions));

// Habilitar manejo explícito de preflight OPTIONS para todas las rutas
app.options("*", cors(corsOptions));

// Middleware para analizar JSON y cookies
app.use(express.json());
app.use(cookieParser());

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB conectado"))
  .catch((err) => console.error("❌ Error de conexión:", err));

// Rutas de autenticación
app.use("/api/auth", require("./routes/auth.routes"));

// Ruta base para probar que la API está viva
app.get("/", (req, res) => {
  res.send("✅ API funcionando correctamente");
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor en http://localhost:${port}`);
});
