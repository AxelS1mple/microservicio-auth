const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.delete("/delete-account", authController.deleteAccount);
router.get("/security-question/:username", authController.getSecurityQuestion);



module.exports = router;
