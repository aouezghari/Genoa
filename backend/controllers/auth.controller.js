import * as authService from '../services/auth.service.js';
import jwt from 'jsonwebtoken';


export const signup = async (req, res) => {
  try {
    console.log(" Body reçu par le backend :", req.body);
    console.log(" Fichier reçu par Multer :", req.file);
    const existingUser = await authService.findUserByEmail(req.body.email);
    if (existingUser) {
      return res.json({ message: "User already existed" });
    }

    const photoPath = req.file ? req.file.path : '';
    await authService.registerUser(req.body, photoPath);

    return res.json({ status: true, message: "Record registered" });
  } catch (error) {
    console.error(" ERREUR LORS DU SIGNUP :", error);
    return res.status(500).json({ message: "Server error", detail: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.findUserByEmail(email);
  
  if (!user) {
    return res.json({ message: "User is not registered" });
  }

  const validPassword = await authService.checkPassword(password, user.password);
  if (!validPassword) {
    return res.json({ message: "Password is incorrect" });
  }

  const token = jwt.sign({ id: user._id }, process.env.KEY, { expiresIn: '24h' });
  res.cookie('token', token, { httpOnly: true, maxAge: 1000 * 3600 * 24 });
  return res.json({ status: true, message: "Login successfully" });
};

export const logout = (req, res) => {
  res.clearCookie('token');
  return res.json({ status: true });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log(" Requête forgotPassword reçue pour :", email); 

  try {
    if (!process.env.EMAIL_USER) {
      console.error(" ERREUR : EMAIL_USER (expéditeur) est absent du fichier .env");
      return res.status(500).json({ message: 'Missing EMAIL_USER in environment' });
    }

    if (!process.env.APP_PASSWORD) {
      console.error("ERREUR : APP_PASSWORD est absent du fichier .env");
      return res.status(500).json({ message: 'Missing APP_PASSWORD in environment' });
    }

    const user = await authService.findUserByEmail(email);
    if (!user) {
      console.log(" Utilisateur non trouvé en base");
      return res.json({ message: "User not registered" });
    }

    const token = jwt.sign({ id: user._id }, process.env.KEY, { expiresIn: '15m' });
    const encodedToken = encodeURIComponent(token).replace(/\./g, "%2E");
    
    const resetLink = `http://172.20.10.3:8081/reset-password/${encodedToken}`;

    console.log(" Tentative d'envoi d'email via Nodemailer...");
    await authService.sendResetPasswordEmail(email, resetLink);
    console.log("Email envoyé avec succès !");
    
    return res.json({ status: true, message: "Email sent" });

  } catch (err) {
    console.error("ERREUR COMPLETE DANS FORGOTPASSWORD :");
    console.error(err);
    return res.status(500).json({ message: "Server error while sending email" });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const decoded = await jwt.verify(token, process.env.KEY);
    await authService.updatePassword(decoded.id, password);
    return res.json({ status: true, message: "Updated password" });
  } catch (err) {
    return res.json("Invalid token");
  }
};

export const verifySession = (req, res) => {
  return res.json({
    status: true,
    isAdmin: req.user.isAdmin,
    isValidated: req.user.isValidated,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    gender: req.user.gender,
    email: req.user.email,
    dateOfBirth: req.user.dateOfBirth,
    profession: req.user.profession,
  });
};

export const getUserDetails = async (req, res) => {
  try {
    const user = await authService.findUserById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      email: user.email,
      dateOfBirth: user.dateOfBirth,
      profession: user.profession,
      contacts: user.contacts 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user details' });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const allowedData = {
      firstName: req.body.firstName?.trim(),
      lastName: req.body.lastName?.trim(),
      dateOfBirth: req.body.dateOfBirth || null,
      profession: req.body.profession?.trim() || '',
      address: req.body.address?.trim() || '',
      phoneNumber: req.body.phoneNumber?.trim() || '',
    };

    const updatedUser = await authService.updateUserProfile(req.user._id, allowedData);
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      status: true,
      message: 'Profil mis à jour',
      user: {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        gender: updatedUser.gender,
        email: updatedUser.email,
        dateOfBirth: updatedUser.dateOfBirth,
        profession: updatedUser.profession,
        contacts: updatedUser.contacts,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePasswordWithCurrent(req.user._id, currentPassword, newPassword);
    res.json({ status: true, message: 'Mot de passe mis à jour' });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Erreur lors du changement de mot de passe' });
  }
};