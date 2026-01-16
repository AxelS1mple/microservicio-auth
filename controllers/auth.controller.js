const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");




exports.register = async (req, res) => {
  const { username, password, securityQuestion, securityAnswer } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "Usuario ya existe" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedAnswer = await bcrypt.hash(securityAnswer, 10);

    const user = new User({
      username,
      password: hashedPassword,
      securityQuestion,
      securityAnswer: hashedAnswer,
    });

    await user.save();
    res.status(201).json({ message: "Usuario registrado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Usuario no encontrado" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Contraseña incorrecta" });

    // Crear tokens
    const accessToken = jwt.sign(
      { id: user._id, tokenVersion: user.tokenVersion },
      process.env.JWT_SECRET,
      {
        expiresIn: "5m",
        issuer: "LoginAPI",
        audience: "LoginAPIUsers",
      }
    );

    const refreshToken = jwt.sign(
      { id: user._id, tokenVersion: user.tokenVersion },
      process.env.REFRESH_SECRET,
      {
        expiresIn: "7d",
        issuer: "LoginAPI",
        audience: "LoginAPIUsers",
      }
    );

    // Enviar refreshToken en cookie httpOnly y accessToken en JSON
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,       // Solo https en producción
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    res.status(200).json({ message: "Login exitoso", token: accessToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.refreshToken = (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No autenticado" });

  jwt.verify(token, process.env.REFRESH_SECRET, (err, payload) => {
    if (err) return res.status(403).json({ message: "Token inválido" });

    // Buscar usuario para validar tokenVersion actual
    User.findById(payload.id).then((user) => {
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
      if (user.tokenVersion !== payload.tokenVersion)
        return res.status(403).json({ message: "Token revocado" });

      // Crear nuevo accessToken
      const accessToken = jwt.sign(
        { id: user._id, tokenVersion: user.tokenVersion },
        process.env.JWT_SECRET,
        {
          expiresIn: "5m",
          issuer: "LoginAPI",
          audience: "LoginAPIUsers",
        }
      );

      res.json({ token: accessToken });
    });
  });
};




exports.forgotPassword = async (req, res) => {
  const { username, securityAnswer, newPassword } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Usuario no encontrado" });

    const matchAnswer = await bcrypt.compare(securityAnswer, user.securityAnswer);
    if (!matchAnswer)
      return res.status(401).json({ message: "Respuesta de seguridad incorrecta" });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Contraseña actualizada exitosamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.deleteAccount = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Contraseña incorrecta" });

    await User.deleteOne({ _id: user._id });
    res.status(200).json({ message: "Cuenta eliminada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.getSecurityQuestion = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    res.status(200).json({ securityQuestion: user.securityQuestion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.logout = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(200).json({ message: "Sesión cerrada" });

  jwt.verify(token, process.env.REFRESH_SECRET, async (err, payload) => {
    if (err) {
      res.clearCookie("refreshToken");
      return res.status(200).json({ message: "Sesión cerrada" });
    }

    // Incrementar tokenVersion para invalidar tokens antiguos
    await User.findByIdAndUpdate(payload.id, { $inc: { tokenVersion: 1 } });

    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Sesión cerrada y tokens revocados" });
  });
};
