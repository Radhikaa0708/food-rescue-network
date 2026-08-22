const authService = require("../services/authService");

async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

function me(req, res) {
  res.json({ success: true, data: req.user });
}

function logout(req, res) {
  res.json({ success: true, message: "Logged out" });
}

module.exports = { register, login, me, logout };