import * as treeService from '../services/tree.service.js';


export const attachUserTree = async (req, res, next) => {
  try {
    const tree = await treeService.findTreeByUserId(req.user._id);

    if (!tree) {
      return res.status(404).json({ message: "Aucun arbre associé à ce compte." });
    }

  
    const collaborator = tree.collaborators.find(c => 
      c.userId.toString() === req.user._id.toString()
    );

    if (!collaborator) {
      return res.status(403).json({ message: "Accès refusé : vous n'êtes pas dans cet arbre." });
    }

   
    req.treeId = tree._id;        
    req.userRole = collaborator.role; 
    
    next();
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération de l'arbre." });
  }
};


export const requireEditor = (req, res, next) => {

  if (!req.userRole) {
    return res.status(500).json({ message: "Erreur serveur : Rôle non défini." });
  }

  if (req.userRole !== 'editor') {
    return res.status(403).json({ message: "Mode lecture seule. Vous ne pouvez pas modifier cet arbre." });
  }

  next();
};

export const attachTreeByTargetUserForAdmin = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "Paramètre userId manquant." });
    }

    const tree = await treeService.findTreeByUserId(userId);

    if (!tree) {
      return res.status(404).json({ message: "Aucun arbre associé à cet utilisateur." });
    }

    req.treeId = tree._id;
    req.userRole = 'editor';
    req.targetUserId = userId;

    next();
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération de l'arbre cible." });
  }
};