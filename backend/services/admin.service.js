import { User } from '../models/User.js';
import { Tree } from '../models/Tree.js';

export const getAllUsers = async () => {
  return await User.find({}, '-password'); 
};

export const getAllUsersWithTreeRole = async () => {
  const users = await User.find({}, '-password').lean();
  const userIds = users.map(user => user._id);

  const trees = await Tree.find(
    { 'collaborators.userId': { $in: userIds } },
    { name: 1, collaborators: 1 }
  ).lean();

  const roleByUserId = new Map();

  trees.forEach(tree => {
    (tree.collaborators || []).forEach(collaborator => {
      const key = collaborator.userId?.toString();
      if (!key || roleByUserId.has(key)) return;
      roleByUserId.set(key, {
        role: collaborator.role,
        treeId: tree._id,
        treeName: tree.name,
      });
    });
  });

  return users.map(user => {
    const treeInfo = roleByUserId.get(user._id.toString());
    return {
      ...user,
      treeRole: treeInfo?.role || null,
      treeId: treeInfo?.treeId || null,
      treeName: treeInfo?.treeName || null,
    };
  });
};

export const deleteUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    const error = new Error('Utilisateur introuvable.');
    error.statusCode = 404;
    throw error;
  }

  const trees = await Tree.find({ 'collaborators.userId': id });
  const affectedTreeIds = [];
  const deletedTreeIds = [];

  for (const tree of trees) {
    tree.collaborators = (tree.collaborators || []).filter(
      collaborator => collaborator.userId.toString() !== id.toString()
    );

    if (!tree.collaborators.length) {
      deletedTreeIds.push(tree._id);
      await Tree.deleteOne({ _id: tree._id });
      continue;
    }

    const hasEditor = tree.collaborators.some(collaborator => collaborator.role === 'editor');
    if (!hasEditor) {
      tree.collaborators[0].role = 'editor';
    }

    await tree.save();
    affectedTreeIds.push(tree._id);
  }

  await User.findByIdAndDelete(id);

  return {
    userId: id,
    affectedTreeIds,
    deletedTreeIds,
  };
};

export const promoteToAdmin = async (id) => {
  return await User.findByIdAndUpdate(id, {
    isAdmin: true,
    isValidated: true,
  });
};

export const validateUserAccount = async (id) => {
  return await User.findByIdAndUpdate(id, { isValidated: true });
};

export const updateUserTreeRole = async (userId, role) => {
  if (!['editor', 'reader'].includes(role)) {
    const error = new Error('Role invalide. Utilisez editor ou reader.');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('Utilisateur introuvable.');
    error.statusCode = 404;
    throw error;
  }

  const tree = await Tree.findOne({ 'collaborators.userId': userId });
  if (!tree) {
    const error = new Error('Aucun arbre associe a cet utilisateur.');
    error.statusCode = 404;
    throw error;
  }

  const currentCollaborator = tree.collaborators.find(
    collaborator => collaborator.userId.toString() === userId.toString()
  );

  if (!currentCollaborator) {
    const error = new Error('Collaborateur introuvable dans cet arbre.');
    error.statusCode = 404;
    throw error;
  }

  if (currentCollaborator.role === 'editor' && role === 'reader') {
    const editorsCount = tree.collaborators.filter(collaborator => collaborator.role === 'editor').length;
    if (editorsCount <= 1) {
      const error = new Error('Impossible: cet arbre doit conserver au moins un editeur.');
      error.statusCode = 400;
      throw error;
    }
  }

  const updatedTree = await Tree.findOneAndUpdate(
    { _id: tree._id, 'collaborators.userId': userId },
    { $set: { 'collaborators.$.role': role } },
    { new: true }
  );

  const updatedCollaborator = updatedTree.collaborators.find(
    collaborator => collaborator.userId.toString() === userId.toString()
  );

  return {
    userId,
    role: updatedCollaborator?.role || role,
    treeId: updatedTree._id,
    treeName: updatedTree.name,
  };
};