import * as adminService from '../services/admin.service.js';

export const getUsers = async (req, res) => {
  try {
    const users = await adminService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUsersWithTreeRole = async (req, res) => {
  try {
    const users = await adminService.getAllUsersWithTreeRole();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const result = await adminService.deleteUserById(req.params.id);
    res.json({ status: true, message: 'User deleted and tree membership cleaned', data: result });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const makeAdmin = async (req, res) => {
  try {
    await adminService.promoteToAdmin(req.params.id);
    res.json({ status: true, message: 'User updated to admin' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const validateUser = async (req, res) => {
  try {
    await adminService.validateUserAccount(req.params.id);
    res.json({ status: true, message: 'User validated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUserTreeRole = async (req, res) => {
  try {
    const result = await adminService.updateUserTreeRole(req.params.id, req.body.role);
    res.json({ status: true, message: 'Tree role updated', data: result });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};