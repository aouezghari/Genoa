import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity,
  Dimensions, SafeAreaView, StatusBar, Alert,
} from 'react-native';
import Svg, { G, Path, Line, Circle } from 'react-native-svg';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

import {
  buildLayout, bezierPath, mkNode,
  getFamilyRootId, buildHierarchyForD3,
  NODE_W, SPOUSE_OFFSET,
} from '../utils/treeUtils';
import { treeApi } from '../services/tree-api';

import PersonCard from '../components/PersonCard';
import AddMemberSheet from '../components/AddMemberModal';
import EditMemberModal from '../components/EditMemberModal';
import FamilyTreeActionModal from '../components/FamilyTreeActionModal';
import FamilyTreeInfoModal from '../components/FamilyTreeInfoModal';
import FamilyTreeDeleteModal from '../components/FamilyTreeDeleteModal';
import { familyTreeStyles as s } from '../styles/FamilyTreeScreen.styles';

const { width: SW, height: SH } = Dimensions.get('window');

const toDbMap = (members) => {
  return members.reduce((acc, member) => {
    acc[member.id] = member;
    return acc;
  }, {});
};

const pickRootId = (members) => {
  if (!members.length) return null;
  const explicitRoot = members.find(member => !member.parentId);
  return (explicitRoot || members[0]).id;
};

const getApiErrorMessage = (error, fallback) => {
  return error?.response?.data?.message || fallback;
};

export default function FamilyTreeScreen({ adminTargetUserId = null, adminTreeOwnerName = '' }) {
  const [db, setDb] = useState({});
  const [history, setHistory] = useState([]); 
  const [treeRole, setTreeRole] = useState('editor');
  const [isLoadingTree, setIsLoadingTree] = useState(true);
  const didBootstrapRef = useRef(false);
  
  const [selected, setSelected] = useState(null);
  const [sheet, setSheet] = useState(false);
  const [actionMenu, setActionMenu] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [deleteBlockedMessage, setDeleteBlockedMessage] = useState('');

  const loadTree = useCallback(async ({ preserveHistory = true, allowBootstrap = true } = {}) => {
    try {
      setIsLoadingTree(true);
      const response = await treeApi.getMembers({ adminTargetUserId });
      const members = response.members || [];
      setTreeRole(response.role || 'reader');

      if (!adminTargetUserId && !members.length && allowBootstrap && !didBootstrapRef.current) {
        didBootstrapRef.current = true;
        const bootstrapMember = mkNode({
          name: 'Moi',
          firstName: 'Moi',
          gender: 'male',
          email: `root-${Date.now()}@tree.local`,
        });
        await treeApi.addMember({ member: bootstrapMember, adminTargetUserId });
        await loadTree({ preserveHistory: false, allowBootstrap: false });
        return;
      }

      const nextDb = toDbMap(members);
      const fallbackRootId = pickRootId(members);
      setDb(nextDb);
      setHistory(prev => {
        if (!fallbackRootId) return [];
        if (!preserveHistory) return [fallbackRootId];
        const filtered = prev.filter(id => nextDb[id]);
        return filtered.length ? filtered : [fallbackRootId];
      });
    } catch (error) {
      Alert.alert('Erreur', getApiErrorMessage(error, "Impossible de charger l'arbre."));
    } finally {
      setIsLoadingTree(false);
    }
  }, [adminTargetUserId]);

  useEffect(() => {
    loadTree({ preserveHistory: false });
  }, [loadTree]);

  const ensureEditor = () => {
    if (treeRole !== 'editor') {
      Alert.alert('Lecture seule', "Vous n'avez pas les droits pour modifier cet arbre.");
      return false;
    }
    return true;
  };

  const tx  = useSharedValue(SW / 2);
  const ty  = useSharedValue(SH * 0.42);
  const sc  = useSharedValue(1);
  const stx = useSharedValue(SW / 2);
  const sty = useSharedValue(SH * 0.42);
  const ssc = useSharedValue(1);

  const currentFocusId = history[history.length - 1] || Object.keys(db)[0] || null;
  const rootNodeId = history[0] || null;
  const isSubTreeView = history.length > 1;

  const actualRootId = useMemo(() => {
    if (!currentFocusId) return null;
    return getFamilyRootId(db, currentFocusId);
  }, [db, currentFocusId]);
  
  const d3ReadyTree = useMemo(() => buildHierarchyForD3(db, actualRootId), [db, actualRootId]);
  
  const layout = useMemo(() => buildLayout(d3ReadyTree), [d3ReadyTree]);

  const pan = Gesture.Pan()
    .minDistance(6)
    .onUpdate(e => {
      tx.value = stx.value + e.translationX;
      ty.value = sty.value + e.translationY;
    })
    .onEnd(() => {
      stx.value = tx.value;
      sty.value = ty.value;
    });

  const pinch = Gesture.Pinch()
    .onUpdate(e => {
      sc.value = Math.min(4, Math.max(0.2, ssc.value * e.scale));
    })
    .onEnd(() => {
      ssc.value = sc.value;
    });

  const gesture = Gesture.Simultaneous(pan, pinch);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: sc.value },
    ],
  }));

  const goBack = () => {
    setHistory(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
    clearSelectionAndMenus();
  };

  const navigateToSpouseTree = () => {
    if (selected && selected._isSpouseCard) {
      setHistory(prev => [...prev, selected.id]);
      clearSelectionAndMenus();
    }
  };

  const handleNodePress = (person, isSpouseCard = false, mainNodeId = null) => {
    setSelected({ ...person, _isSpouseCard: isSpouseCard, _mainNodeId: mainNodeId });
    setSheet(false);
    setInfoVisible(false);
    setEditVisible(false);
    setActionMenu(true);
  };

  const handleAdd = async (formData) => {
    if (!selected) return;
    if (!ensureEditor()) return;
    
    const targetId = selected._isSpouseCard ? selected._mainNodeId : selected.id;

    const normalizedName = `${formData.firstName} ${formData.lastName}`.trim();
    const newMember = mkNode({
      ...formData,
      name: normalizedName || formData.firstName,
      birthYear: formData.birthDate ? formData.birthDate.slice(0, 4) : '',
    });

    try {
      await treeApi.addMember({
        member: newMember,
        relation: formData.relation,
        targetId,
        adminTargetUserId,
      });
      await loadTree();
      clearSelectionAndMenus();
    } catch (error) {
      Alert.alert('Erreur', getApiErrorMessage(error, "Impossible d'ajouter ce membre."));
    }
  };

  const handleEdit = async (formData) => {
    if (!selected) return;
    if (!ensureEditor()) return;
    const normalizedName = `${formData.firstName} ${formData.lastName}`.trim();

    const patch = {
      ...formData,
      name: normalizedName || selected.name,
      birthYear: formData.birthDate ? formData.birthDate.slice(0, 4) : '',
    };

    try {
      await treeApi.updateMember(selected.id, patch, { adminTargetUserId });
      await loadTree();
      clearSelectionAndMenus();
    } catch (error) {
      Alert.alert('Erreur', getApiErrorMessage(error, "Impossible de modifier ce membre."));
    }
  };

  const handleDelete = () => {
    if (!selected) return;
    if (!ensureEditor()) return;
    if (selected.id === rootNodeId) return; 

    const hasSpouse = !!selected.spouseId;
    const hasParent = !!selected.parentId;

    if (hasSpouse && hasParent) {
      setActionMenu(false);
      setDeleteBlockedMessage('Ce conjoint est deja lie a un parent. Supprimez d\'abord ce lien de parent avant de retenter.');
      setDeleteConfirmVisible(true);
      return;
    }

    setActionMenu(false);
    setDeleteBlockedMessage('');
    setDeleteConfirmVisible(true);
  };

  const confirmDelete = async () => {
    if (!selected) return;
    
    if (selected.id === currentFocusId && isSubTreeView) {
      goBack();
    }

    try {
      await treeApi.deleteMember(selected.id, { adminTargetUserId });
      await loadTree();
      clearSelectionAndMenus();
      setDeleteBlockedMessage('');
      setDeleteConfirmVisible(false);
    } catch (error) {
      Alert.alert('Erreur', getApiErrorMessage(error, "Impossible de supprimer ce membre."));
    }
  };

  const recenter = () => {
    const { offsetX, offsetY } = layout;
    const cx = SW / 2 - offsetX - 100;
    const cy = SH * 0.38 - offsetY - 100;
    tx.value = withSpring(cx); stx.value = cx;
    ty.value = withSpring(cy); sty.value = cy;
    sc.value = withSpring(1);  ssc.value = 1;
  };

  const zoom = (dir) => {
    const next = Math.min(4, Math.max(0.2, ssc.value + dir * 0.3));
    sc.value = withSpring(next);
    ssc.value = next;
  };

  const clearSelectionAndMenus = () => {
    setSelected(null);
    setSheet(false);
    setInfoVisible(false);
    setActionMenu(false);
    setEditVisible(false);
  };

  const { nodes, links, bounds, offsetX, offsetY } = layout;
  const svgW = bounds.w + 200;
  const svgH = bounds.h + 200;
  const count = useMemo(() => Object.keys(db).length, [db]);
  const isRoot = selected?.id === rootNodeId;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={s.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {isSubTreeView && (
            <TouchableOpacity onPress={goBack} style={{ marginRight: 15, padding: 5 }}>
              <Feather name="arrow-left" size={24} color="#2563EB" />
            </TouchableOpacity>
          )}
          <View>
            <Text style={s.hTitle}>Arbre généalogique</Text>
            <Text style={s.hSub}>
              {isLoadingTree
                ? 'Chargement...'
                : `${count} membre${count > 1 ? 's au total' : ''}${adminTargetUserId ? ` • mode admin${adminTreeOwnerName ? ` (${adminTreeOwnerName})` : ''}` : ''}`}
            </Text>
          </View>
        </View>

        {selected && (
          <View style={s.selPill}>
            <Text style={s.selLabel}>{[selected.firstName, selected.lastName].filter(Boolean).join(' ').trim() || selected.name}</Text>
            <TouchableOpacity onPress={clearSelectionAndMenus}>
              <Text style={s.selClose}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <GestureDetector gesture={gesture}>
        <View style={{ flex: 1, backgroundColor: 'transparent', overflow: 'hidden' }}>
          <Animated.View 
            style={[
              { position: 'absolute', width: svgW, height: svgH }, 
              animStyle
            ]}
          >
            <Svg width={svgW} height={svgH}>
              <G x={offsetX + 100} y={offsetY + 100}>

                {links.map(l => (
                  <Path
                    key={l.id}
                    d={bezierPath(l.x1, l.y1, l.x2, l.y2)}
                    stroke="rgba(148,163,184,0.85)"
                    strokeWidth={2}
                    fill="none"
                  />
                ))}

                {nodes.filter(n => n.data.spouse).map(n => (
                  <G key={`sc_${n.id}`}>
                    <Line
                      x1={n.x + NODE_W / 2 + 2}               y1={n.y}
                      x2={n.x + SPOUSE_OFFSET - NODE_W / 2 - 2} y2={n.y}
                      stroke="#F9A8D4" strokeWidth={2.5}
                    />
                    <Circle
                      cx={n.x + SPOUSE_OFFSET / 2} cy={n.y} r={4} fill="#EC4899"
                    />
                  </G>
                ))}

                {nodes.filter(n => n.data.spouse).map(n => (
                  <PersonCard
                    key={`sp_${n.data.spouse.id}`}
                    x={n.x + SPOUSE_OFFSET} y={n.y}
                    person={n.data.spouse}
                    isSelected={selected?.id === n.data.spouse.id}
                    onPress={(person) => handleNodePress(person, true, n.id)}
                  />
                ))}

                {nodes.map(n => (
                  <PersonCard
                    key={n.id}
                    x={n.x} y={n.y}
                    person={n.data}
                    isSelected={selected?.id === n.id}
                    onPress={(person) => handleNodePress(person, false, n.id)}
                  />
                ))}

              </G>
            </Svg>
          </Animated.View>
        </View>
      </GestureDetector>

      <View style={s.fabCol}>
        <TouchableOpacity style={s.fab} onPress={recenter}>
          <Feather name="crosshair" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={s.fab} onPress={() => zoom(1)}>
          <Feather name="plus" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={s.fab} onPress={() => zoom(-1)}>
          <Feather name="minus" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <AddMemberSheet
        visible={sheet}
        onClose={clearSelectionAndMenus}
        onAdd={handleAdd}
        targetName={selected ? ([selected.firstName, selected.lastName].filter(Boolean).join(' ').trim() || selected.name) : ''}
        
        disableSibling={selected?._isSpouseCard || !selected?.parentId}
        disableSpouse={selected?._isSpouseCard || !!selected?.spouseId}
        disableParent={selected?._isSpouseCard || !!selected?.parentId}
        disableChild={isSubTreeView}
      />

      <EditMemberModal
        visible={editVisible && !!selected && !infoVisible}
        member={selected}
        onClose={() => setEditVisible(false)}
        onSave={handleEdit}
      />

      <FamilyTreeActionModal
        visible={actionMenu}
        selected={selected}
        isRoot={isRoot}
        canEdit={treeRole === 'editor'}
        onClose={() => setActionMenu(false)}
        onAdd={() => {
          setActionMenu(false); setInfoVisible(false); setSheet(true);
        }}
        onInfo={() => {
          setActionMenu(false); setSheet(false); setInfoVisible(true); setEditVisible(false);
        }}
        onEdit={() => {
          setActionMenu(false); setSheet(false); setInfoVisible(false); setEditVisible(true);
        }}
        onDelete={handleDelete}
        onClearSelection={clearSelectionAndMenus}
        onViewTree={navigateToSpouseTree} 
      />

      <FamilyTreeInfoModal
        visible={infoVisible && !editVisible && !actionMenu}
        selected={selected}
        onClose={() => setInfoVisible(false)}
      />

      <FamilyTreeDeleteModal
        visible={deleteConfirmVisible}
        selected={selected}
        blocked={!!deleteBlockedMessage}
        blockedMessage={deleteBlockedMessage}
        onClose={() => {
          setDeleteConfirmVisible(false);
          setDeleteBlockedMessage('');
        }}
        onConfirm={confirmDelete}
      />
    </SafeAreaView>
  );
}