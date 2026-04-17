import { Tree } from '../models/Tree.js';
import { Member } from '../models/Member.js';


export const findTreeByUserId = async (userId) => {
  return await Tree.findOne({ 'collaborators.userId': userId });
};


export const createMember = async (memberData) => {
  const newMember = new Member(memberData);
  return await newMember.save();
};

export const findMemberByNodeId = async (treeId, nodeId) => {
  return await Member.findOne({ treeId, nodeId });
};

export const createMemberWithRelation = async (treeId, memberData, relation, targetId) => {
  const payload = {
    ...memberData,
    treeId,
    childrenIds: memberData.childrenIds || [],
  };

  if (!payload.nodeId) {
    throw new Error('nodeId is required.');
  }

  let target = null;
  if (relation && targetId) {
    target = await findMemberByNodeId(treeId, targetId);
    if (!target) {
      const error = new Error('Target member not found.');
      error.statusCode = 404;
      throw error;
    }
  }

  if (relation === 'child') {
    payload.parentId = targetId;
  }

  if (relation === 'parent') {
    payload.childrenIds = [targetId];
  }

  if (relation === 'spouse') {
    payload.spouseId = targetId;
    payload.childrenIds = [...(target.childrenIds || [])];
  }

  if (relation === 'sibling') {
    const parentId = target?.parentId;
    if (!parentId) {
      const error = new Error('Cannot add sibling without a known parent.');
      error.statusCode = 400;
      throw error;
    }
    payload.parentId = parentId;
  }

  const newMember = await createMember(payload);

  if (relation === 'child') {
    const parent = await Member.findOneAndUpdate(
      { treeId, nodeId: targetId },
      { $addToSet: { childrenIds: newMember.nodeId } },
      { new: true }
    );

    if (parent?.spouseId) {
      await Member.findOneAndUpdate(
        { treeId, nodeId: parent.spouseId },
        { $addToSet: { childrenIds: newMember.nodeId } }
      );
    }
  }

  if (relation === 'spouse') {
    await Member.findOneAndUpdate(
      { treeId, nodeId: targetId },
      { spouseId: newMember.nodeId }
    );
  }

  if (relation === 'parent') {
    await Member.findOneAndUpdate(
      { treeId, nodeId: targetId },
      { parentId: newMember.nodeId }
    );
  }

  if (relation === 'sibling') {
    const sibling = target;
    await Member.findOneAndUpdate(
      { treeId, nodeId: sibling.parentId },
      { $addToSet: { childrenIds: newMember.nodeId } },
      { new: true }
    );

    const parent = await Member.findOne({ treeId, nodeId: sibling.parentId });
    if (parent?.spouseId) {
      await Member.findOneAndUpdate(
        { treeId, nodeId: parent.spouseId },
        { $addToSet: { childrenIds: newMember.nodeId } }
      );
    }
  }

  return newMember;
};

export const updateMemberNode = async (treeId, nodeId, updateData) => {
  return await Member.findOneAndUpdate(
    { treeId, nodeId },
    updateData,
    { new: true, runValidators: true }
  );
};

export const getMembersByTreeId = async (treeId) => {
  
  return await Member.find({ treeId: treeId });
};

export const deleteMemberAndCleanup = async (treeId, nodeId) => {
  const node = await Member.findOne({ treeId, nodeId });
  if (!node) return null;

  if (node.spouseId && node.parentId) {
    const error = new Error('Suppression impossible: ce conjoint est deja lie a un parent.');
    error.statusCode = 400;
    throw error;
  }

  await Member.updateMany(
    { treeId, childrenIds: nodeId },
    { $pull: { childrenIds: nodeId } }
  );

  await Member.updateMany(
    { treeId, spouseId: nodeId },
    { spouseId: null }
  );

  if (node.childrenIds?.length) {
    await Member.updateMany(
      { treeId, nodeId: { $in: node.childrenIds } },
      { parentId: null }
    );
  }

  return await Member.findOneAndDelete({ treeId, nodeId });
};

const normalizeCountry = (address = '') => {
  if (!address || typeof address !== 'string') return null;
  const parts = address
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);

  if (!parts.length) return null;
  return parts[parts.length - 1].toLowerCase();
};

const toPercent = (value, total) => {
  if (!total) return 0;
  return Math.round((value / total) * 100);
};

const computeGenerations = (members) => {
  if (!members.length) return 0;

  const byNodeId = new Map(members.map(member => [member.nodeId, member]));
  const memo = new Map();

  const depthOf = (nodeId, visiting = new Set()) => {
    if (!nodeId) return 1;
    if (memo.has(nodeId)) return memo.get(nodeId);
    if (visiting.has(nodeId)) return 1;

    const member = byNodeId.get(nodeId);
    if (!member) return 1;

    const parentId = member.parentId;
    if (!parentId || !byNodeId.has(parentId)) {
      memo.set(nodeId, 1);
      return 1;
    }

    visiting.add(nodeId);
    const depth = depthOf(parentId, visiting) + 1;
    visiting.delete(nodeId);

    memo.set(nodeId, depth);
    return depth;
  };

  let maxDepth = 0;
  for (const member of members) {
    const depth = depthOf(member.nodeId);
    if (depth > maxDepth) maxDepth = depth;
  }

  return maxDepth;
};

export const getTreeStatsById = async (treeId) => {
  const members = await Member.find({ treeId }).lean();
  const totalMembers = members.length;

  if (!totalMembers) {
    return {
      totalMembers: 0,
      generations: 0,
      countries: 0,
      marriages: 0,
      gender: { male: 0, female: 0, malePercent: 0, femalePercent: 0 },
      topLastNames: [],
      alive: 0,
      deceased: 0,
    };
  }

  let male = 0;
  let female = 0;
  let deceased = 0;
  const countrySet = new Set();
  const lastNameCounts = new Map();
  const marriagePairSet = new Set();
  const memberIds = new Set(members.map(member => member.nodeId));

  for (const member of members) {
    if (member.gender === 'female') female += 1;
    else male += 1;

    if (member.deathDate?.trim()) deceased += 1;

    const country = normalizeCountry(member.addresses || '');
    if (country) countrySet.add(country);

    const ln = (member.lastName || '').trim().toLowerCase();
    if (ln) {
      lastNameCounts.set(ln, (lastNameCounts.get(ln) || 0) + 1);
    }

    if (member.spouseId && memberIds.has(member.spouseId)) {
      const pairKey = [member.nodeId, member.spouseId].sort().join('::');
      marriagePairSet.add(pairKey);
    }
  }

  const topLastNames = Array.from(lastNameCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count,
    }));

  const alive = totalMembers - deceased;

  return {
    totalMembers,
    generations: computeGenerations(members),
    countries: countrySet.size,
    marriages: marriagePairSet.size,
    gender: {
      male,
      female,
      malePercent: toPercent(male, totalMembers),
      femalePercent: toPercent(female, totalMembers),
    },
    topLastNames,
    alive,
    deceased,
  };
};
