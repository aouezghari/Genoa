import axios from 'axios';

const api = axios.create({
  baseURL: 'http://172.20.10.3:3000/',
  withCredentials: true,
});

const mapBackendMemberToNode = (member) => ({
  id: member.nodeId,
  firstName: member.firstName || '',
  lastName: member.lastName || '',
  name: member.name || `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Inconnu',
  email: member.email || '',
  gender: member.gender || 'male',
  birthDate: member.birthDate || '',
  deathDate: member.deathDate || '',
  professions: member.professions || '',
  addresses: member.addresses || '',
  phone: member.phone || '',
  birthYear: member.birthYear || (member.birthDate ? member.birthDate.slice(0, 4) : ''),
  parentId: member.parentId || null,
  spouseId: member.spouseId || null,
  childrenIds: member.childrenIds || [],
});

const mapNodeToBackendPayload = (node) => ({
  nodeId: node.id,
  firstName: node.firstName || '',
  lastName: node.lastName || '',
  name: node.name || `${node.firstName || ''} ${node.lastName || ''}`.trim() || 'Inconnu',
  email: (node.email || '').trim().toLowerCase(),
  gender: node.gender || 'male',
  birthDate: node.birthDate || '',
  deathDate: node.deathDate || '',
  professions: node.professions || '',
  addresses: node.addresses || '',
  phone: node.phone || '',
  birthYear: node.birthYear || (node.birthDate ? node.birthDate.slice(0, 4) : ''),
});

export const treeApi = {
  getStats: async () => {
    const response = await api.get('/tree/stats');
    return response.data;
  },

  getMembers: async ({ adminTargetUserId } = {}) => {
    const endpoint = adminTargetUserId
      ? `/admin/trees/${adminTargetUserId}/members`
      : '/tree/members';

    const response = await api.get(endpoint);
    return {
      role: response.data.role,
      members: (response.data.members || []).map(mapBackendMemberToNode),
    };
  },

  addMember: async ({ member, relation, targetId, adminTargetUserId }) => {
    const payload = {
      ...mapNodeToBackendPayload(member),
      ...(relation ? { relation } : {}),
      ...(targetId ? { targetId } : {}),
    };

    const endpoint = adminTargetUserId
      ? `/admin/trees/${adminTargetUserId}/members`
      : '/tree/members';

    const response = await api.post(endpoint, payload);
    return response.data;
  },

  updateMember: async (nodeId, patch, { adminTargetUserId } = {}) => {
    const payload = {
      ...patch,
      email: (patch.email || '').trim().toLowerCase(),
    };

    const endpoint = adminTargetUserId
      ? `/admin/trees/${adminTargetUserId}/members/${nodeId}`
      : `/tree/members/${nodeId}`;

    const response = await api.put(endpoint, payload);
    return response.data;
  },

  deleteMember: async (nodeId, { adminTargetUserId } = {}) => {
    const endpoint = adminTargetUserId
      ? `/admin/trees/${adminTargetUserId}/members/${nodeId}`
      : `/tree/members/${nodeId}`;

    const response = await api.delete(endpoint);
    return response.data;
  },
};
