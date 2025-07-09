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

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login exitoso", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
