import * as treeService from '../services/tree.service.js';

export const addNodeToTree = async (req, res) => {
  try {
    const { targetId, relation, ...memberData } = req.body;
    const treeId = req.treeId;

    if (!memberData.nodeId) {
      return res.status(400).json({ message: 'nodeId (UUID frontend) est requis.' });
    }

    if (!memberData.email?.trim()) {
      return res.status(400).json({ message: 'Email requis pour creer un membre.' });
    }

    memberData.email = memberData.email.trim().toLowerCase();

    const newMember = await treeService.createMemberWithRelation(treeId, memberData, relation, targetId);

    res.status(201).json({ status: true, member: newMember });

  } catch (error) {
    console.error("Erreur addNodeToTree:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Contrainte unique violee (email ou nodeId deja utilise).',
      });
    }
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: "Erreur lors de l'ajout du membre." });
  }
};

export const getTreeMembers = async (req, res) => {
  try {
    const treeId = req.treeId;
    const userRole = req.userRole; 

    const members = await treeService.getMembersByTreeId(treeId);

    res.status(200).json({ 
      status: true, 
      role: userRole,  
      members: members 
    });

  } catch (error) {
    console.error("Erreur lors de la récupération de l'arbre :", error);
    res.status(500).json({ message: "Erreur lors de la récupération de l'arbre." });
  }
};

export const updateMemberInTree = async (req, res) => {
  try {
    const treeId = req.treeId;
    const nodeId = req.params.nodeId; 
    const updateData = req.body; 

   
    delete updateData.parentId;
    delete updateData.spouseId;
    delete updateData.childrenIds;
    delete updateData.treeId;
    delete updateData.nodeId;
    delete updateData._id;

    if (typeof updateData.email === 'string') {
      updateData.email = updateData.email.trim().toLowerCase();
    }

    const updatedMember = await treeService.updateMemberNode(treeId, nodeId, updateData);

    if (!updatedMember) {
      return res.status(404).json({ message: "Membre introuvable." });
    }

    res.status(200).json({ status: true, member: updatedMember });

  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Email deja utilise dans cet arbre.' });
    }
    res.status(500).json({ message: "Erreur lors de la modification du membre." });
  }
};


export const deleteMemberFromTree = async (req, res) => {
  try {
    const { nodeId } = req.params;
    const treeId = req.treeId;

    const deleted = await treeService.deleteMemberAndCleanup(treeId, nodeId);

    if (!deleted) {
      return res.status(404).json({ message: "Membre introuvable dans cet arbre." });
    }

    res.status(200).json({ 
      status: true, 
      message: "Membre supprimé et liens familiaux nettoyés avec succès." 
    });
  } catch (error) {
    console.error("Erreur DeleteMember:", error);
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: "Erreur lors de la suppression." });
  }
};

export const getTreeStats = async (req, res) => {
  try {
    const treeId = req.treeId;
    const stats = await treeService.getTreeStatsById(treeId);

    res.status(200).json({
      status: true,
      stats,
    });
  } catch (error) {
    console.error('Erreur getTreeStats:', error);
    res.status(500).json({ message: "Erreur lors de la récupération des statistiques." });
  }
};