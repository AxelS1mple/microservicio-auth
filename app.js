const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error("Error de conexión:", err));

app.use("/api/auth", require("./routes/auth.routes"));

app.listen(port, () => {
  console.log(`Servidor en http://localhost:${port}`);
});
