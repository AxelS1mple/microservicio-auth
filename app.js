const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

dotenv.config();
const app = express();
const port = process.env.PORT || 4000;

app.use(cors({
  origin: "http://localhost:5173", // frontend exacto
  credentials: true                // permite cookies o headers con auth
}));
app.use(express.json());
app.use(cookieParser());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error("Error de conexión:", err));

app.use("/api/auth", require("./routes/auth.routes"));

app.listen(port, () => {
  console.log(`Servidor en http://localhost:${port}`);
});
