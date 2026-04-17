import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const validateSignup = (req, res, next) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.json({ message: "Email, Password, Last Name, and First Name are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.json({ message: "Le format de l'email est invalide." });
  }

  if (!isStrongPassword(password)) {
    return res.json({ 
      message: "Le mot de passe doit contenir au moins 8 caractères, dont une majuscule, une minuscule, un chiffre et un caractère spécial." 
    });
  }

  next();
};

export const verifyUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ status: false, message: "No token" });
    }
    const decoded = await jwt.verify(token, process.env.KEY);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ status: false, message: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ status: false, message: "Invalid token" });
  }
};

export const verifyAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ status: false, message: "Not authorized" });
  }
  next();
};

const isStrongPassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validateProfileUpdate = (req, res, next) => {
  const { firstName, lastName } = req.body;

  if (!firstName?.trim() || !lastName?.trim()) {
    return res.status(400).json({ message: 'Prénom et nom sont requis.' });
  }

  next();
};

export const validatePasswordChange = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Mot de passe actuel et nouveau mot de passe requis.' });
  }

  if (!isStrongPassword(newPassword)) {
    return res.status(400).json({
      message: 'Le nouveau mot de passe doit contenir au moins 8 caractères, dont une majuscule, une minuscule, un chiffre et un caractère spécial.',
    });
  }

  next();
};