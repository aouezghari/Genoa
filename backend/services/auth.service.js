import { User } from '../models/User.js';
import bcrypt from 'bcrypt';
import { Tree } from '../models/Tree.js';
import { Member } from '../models/Member.js';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';

export const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

export const findUserById = async (id) => {
  return await User.findById(id);
};

export const registerUser = async (userData, photoPath) => {
  const { email, password, lastName, firstName, gender, dateOfBirth, profession, address, phoneNumber } = userData;

  
  const hashPassword = await bcrypt.hash(password, 10);
  
  
  const isFirstUser = (await User.countDocuments({})) === 0;
  const newUser = new User({
    email,
    password: hashPassword,
    lastName,
    firstName,
    gender: gender || null,
    dateOfBirth: dateOfBirth || null,
    profession: profession || '',
    contacts: {
      addresses: address ? [address] : [],
      phoneNumbers: phoneNumber ? [phoneNumber] : []
    },
    photo: photoPath || '',
    isAdmin: isFirstUser,
    isValidated: isFirstUser
  });

  const savedUser = await newUser.save();

  const existingMember = await Member.findOne({ email: email.toLowerCase() });

  if (existingMember) {
    const tree = await Tree.findById(existingMember.treeId);
    if (tree) {
      tree.collaborators.push({
        userId: savedUser._id,
        role: 'reader' 
      });
      await tree.save();
    }
  } else {
    const newTree = new Tree({
      name: `Arbre de ${firstName} ${lastName}`,
      collaborators: [{
        userId: savedUser._id,
        role: 'editor' 
      }]
    });
    const savedTree = await newTree.save();

    const rootMember = new Member({
      treeId: savedTree._id,
      nodeId: uuidv4(), 
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      email: email.toLowerCase(),
      gender: gender || 'male',
      birthDate: dateOfBirth || '',
      professions: profession || '',
      addresses: address || '',
      phone: phoneNumber || '',
      parentId: null,
      spouseId: null,
      childrenIds: []
    });
    await rootMember.save();
  }

  return savedUser;
};

export const checkPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

export const updatePassword = async (userId, newPassword) => {
  const hashPassword = await bcrypt.hash(newPassword, 10);
  return await User.findByIdAndUpdate(userId, { password: hashPassword });
};

export const updateUserProfile = async (userId, profileData) => {
  const updateDoc = {
    firstName: profileData.firstName,
    lastName: profileData.lastName,
    dateOfBirth: profileData.dateOfBirth || null,
    profession: profileData.profession || '',
    contacts: {
      addresses: profileData.address ? [profileData.address] : [],
      phoneNumbers: profileData.phoneNumber ? [profileData.phoneNumber] : [],
    },
  };

  return await User.findByIdAndUpdate(userId, updateDoc, {
    new: true,
    runValidators: true,
  });
};

export const changePasswordWithCurrent = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('Utilisateur introuvable.');
    error.statusCode = 404;
    throw error;
  }

  const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentValid) {
    const error = new Error('Mot de passe actuel incorrect.');
    error.statusCode = 400;
    throw error;
  }

  const hashPassword = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(userId, { password: hashPassword });

  return { status: true };
};

const createMailTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.APP_PASSWORD) {
    const error = new Error('EMAIL_USER ou APP_PASSWORD manquant dans les variables d\'environnement.');
    error.statusCode = 500;
    throw error;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.APP_PASSWORD,
    },
  });
};

export const sendResetPasswordEmail = async (email, resetLink) => {
  const transporter = createMailTransporter();

  await transporter.sendMail({
    from: `"GenoaTree Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Réinitialisation de votre mot de passe',
    text: `Cliquez sur ce lien pour réinitialiser votre mot de passe : ${resetLink}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #007AFF;">Réinitialisation de mot de passe</h2>
        <p>Bonjour,</p>
        <p>Vous avez demandé à réinitialiser votre mot de passe pour votre arbre généalogique.</p>
        <a href="${resetLink}" 
           style="display: inline-block; background-color: #007AFF; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Réinitialiser mon mot de passe
        </a>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.
        </p>
      </div>
    `,
  });
};