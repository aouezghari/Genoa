import * as d3 from 'd3';

export const NODE_W = 150;
export const NODE_H = 76;
export const SPOUSE_OFFSET = NODE_W + 34; 

export const newId = () => {
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.getRandomValues) {
    throw new Error('Secure random UUID generation is not available in this environment.');
  }

  const bytes = new Uint8Array(16);
  cryptoApi.getRandomValues(bytes);

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join('-');
};


export const mkNode = ({
  name,
  firstName = '',
  lastName = '',
  email = '',
  gender = 'male',
  birthDate = '',
  deathDate = '',
  professions = '',
  addresses = '',
  phone = '',
  birthYear = '',
}) => ({
  id: newId(),
  firstName,
  lastName,
  name: name || `${firstName} ${lastName}`.trim() || 'Inconnu',
  email,
  gender,
  birthDate,
  deathDate,
  professions,
  addresses,
  phone,
  birthYear: birthYear || (birthDate ? birthDate.slice(0, 4) : ''),
  
  parentId: null,
  spouseId: null,
  childrenIds: [],
});


export function getFamilyRootId(db, startNodeId) {
  let currentId = startNodeId;
  while (db[currentId] && db[currentId].parentId && db[db[currentId].parentId]) {
    currentId = db[currentId].parentId;
  }
  return currentId;
}

export function buildHierarchyForD3(db, rootId) {
  const person = db[rootId];
  if (!person) return null;

  const d3Node = { ...person, children: [], spouse: null };

  if (person.spouseId && db[person.spouseId]) {
    d3Node.spouse = { ...db[person.spouseId] };
  }

  const spouseChildrenIds = d3Node.spouse?.childrenIds || [];
  const mergedChildrenIds = Array.from(new Set([...(person.childrenIds || []), ...spouseChildrenIds]));

  if (mergedChildrenIds.length > 0) {
    d3Node.children = mergedChildrenIds
      .map(childId => buildHierarchyForD3(db, childId))
      .filter(Boolean); 
  }

  return d3Node;
}


export function buildLayout(root) {
  if (!root) return { nodes: [], links: [], bounds: { w: 0, h: 0 }, offsetX: 0, offsetY: 0 };

  const hier = d3.hierarchy(root, n => n.children?.length ? n.children : null);

  d3.tree()
    .nodeSize([NODE_W + 80, NODE_H + 110])
    .separation((a, b) => {
      let sep = a.parent === b.parent ? 1.1 : 1.6;
      if (a.data.spouse) sep += 0.9;
      if (b.data.spouse) sep += 0.9;
      return sep;
    })(hier);

  const nodes = [];
  const links = [];

  hier.each(n => {
    nodes.push({ id: n.data.id, x: n.x, y: n.y, data: n.data });
    if (n.parent) {
      links.push({
        id: `lnk_${n.parent.data.id}_${n.data.id}`,
        x1: n.parent.x, y1: n.parent.y + NODE_H / 2,
        x2: n.x,        y2: n.y - NODE_H / 2,
      });
    }
  });

  const allX = [], allY = [];
  nodes.forEach(n => {
    allX.push(n.x - NODE_W / 2, n.x + NODE_W / 2);
    allY.push(n.y - NODE_H / 2, n.y + NODE_H / 2);
    if (n.data.spouse) allX.push(n.x + SPOUSE_OFFSET + NODE_W / 2);
  });

  const pad = 80;
  const minX = Math.min(...allX) - pad;
  const maxX = Math.max(...allX) + pad;
  const minY = Math.min(...allY) - pad;
  const maxY = Math.max(...allY) + pad;

  return {
    nodes, links,
    bounds: { w: maxX - minX, h: maxY - minY },
    offsetX: -minX,
    offsetY: -minY,
  };
}

export function bezierPath(x1, y1, x2, y2) {
  const mid = (y1 + y2) / 2;
  return `M${x1},${y1} C${x1},${mid} ${x2},${mid} ${x2},${y2}`;
}