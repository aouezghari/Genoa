import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons'; 
import { treeApi } from '../services/tree-api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const StatCard = ({ icon, label, value, color }) => (
  <View style={[styles.statCard, { width: CARD_WIDTH }]}>
    <View style={[styles.iconCircle, { backgroundColor: color + '15' }]}>
      <Feather name={icon} size={20} color={color} />
    </View>
    <View style={styles.statInfo}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </View>
);

export default function StatsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalMembers: 0,
    generations: 0,
    countries: 0,
    marriages: 0,
    gender: { male: 0, female: 0, malePercent: 0, femalePercent: 0 },
    topLastNames: [],
    alive: 0,
    deceased: 0,
  });

  const loadStats = useCallback(async ({ isRefresh = false } = {}) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      const response = await treeApi.getStats();
      setStats(response.stats || {
        totalMembers: 0,
        generations: 0,
        countries: 0,
        marriages: 0,
        gender: { male: 0, female: 0, malePercent: 0, femalePercent: 0 },
        topLastNames: [],
        alive: 0,
        deceased: 0,
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Impossible de charger les statistiques.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const topNamesRows = useMemo(() => {
    const source = (stats.topLastNames || []).slice(0, 5);
    const maxCount = source.reduce((max, item) => Math.max(max, item.count || 0), 0) || 1;
    const palette = ['#007AFF', '#34C759', '#5856D6', '#FF9500', '#FF2D55'];
    return source.map((item, index) => ({
      name: item.name,
      count: item.count,
      width: `${Math.max(20, Math.round(((item.count || 0) / maxCount) * 100))}%`,
      color: palette[index % palette.length],
    }));
  }, [stats.topLastNames]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadStats({ isRefresh: true })} />}
    >
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Statistiques</Text>
        <Text style={styles.headerSub}>Analyse de votre Arbre</Text>
      </View>

      {!!error && <Text style={styles.errorText}>{error}</Text>}

      {/* Grille de stats */}
      <View style={styles.grid}>
        <StatCard icon="users" label="Membres" value={String(stats.totalMembers || 0)} color="#007AFF" />
        <StatCard icon="git-branch" label="Générations" value={String(stats.generations || 0)} color="#34C759" />
        <StatCard icon="map-pin" label="Pays" value={String(stats.countries || 0)} color="#5856D6" />
        <StatCard icon="heart" label="Mariages" value={String(stats.marriages || 0)} color="#FF2D55" />
      </View>

      <Text style={styles.sectionTitle}>Répartition par Genre</Text>
      <View style={styles.mainCard}>
        <View style={styles.genderContainer}>
          
          <View style={styles.genderBlock}>
            <FontAwesome5 name="male" size={40} color="#007AFF" />
            <Text style={[styles.genderValue, { color: '#007AFF' }]}>{stats.gender?.male || 0}</Text>
            <Text style={styles.genderLabel}>Hommes</Text>
          </View>

          <View style={styles.verticalDivider} />

          <View style={styles.genderBlock}>
            <FontAwesome5 name="female" size={40} color="#FF2D55" />
            <Text style={[styles.genderValue, { color: '#FF2D55' }]}>{stats.gender?.female || 0}</Text>
            <Text style={styles.genderLabel}>Femmes</Text>
          </View>

        </View>
        
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${stats.gender?.malePercent || 0}%`, backgroundColor: '#007AFF' }]} />
          <View style={[styles.progressBar, { width: `${stats.gender?.femalePercent || 0}%`, backgroundColor: '#FF2D55' }]} />
        </View>
        <View style={styles.percentRow}>
          <Text style={styles.percentText}>{stats.gender?.malePercent || 0}%</Text>
          <Text style={styles.percentText}>{stats.gender?.femalePercent || 0}%</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Noms de Famille</Text>
      <View style={styles.mainCard}>
        {!topNamesRows.length && <Text style={styles.emptyText}>Aucun patronyme disponible.</Text>}
        {topNamesRows.map((item, index) => (
          <View key={`${item.name}-${index}`} style={styles.listRow}>
            <Text style={styles.listName}>{item.name}</Text>
            <View style={styles.listBarContainer}>
              <View style={[styles.listBar, { width: item.width, backgroundColor: item.color }]} />
            </View>
            <Text style={styles.listCount}>{item.count}</Text>
          </View>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FB' },
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  content: { padding: 16 },
  header: { marginBottom: 24, marginTop: 8 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#1A1A1A' },
  headerSub: { fontSize: 16, color: '#666', marginTop: 4 },
  errorText: { color: '#B42318', marginBottom: 16, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  statCard: {
    backgroundColor: '#FFF', padding: 14, borderRadius: 18, marginBottom: 14,
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#F0F0F0',
  },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  statInfo: { flex: 1 },
  statValue: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  statLabel: { fontSize: 11, color: '#999', textTransform: 'uppercase', fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 16, paddingLeft: 4 },
  mainCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#F0F0F0' },
  genderContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 20 },
  genderBlock: { alignItems: 'center', flex: 1 },
  genderValue: { fontSize: 24, fontWeight: '800', marginTop: 8 },
  genderLabel: { fontSize: 13, color: '#999', fontWeight: '500' },
  verticalDivider: { width: 1, height: 60, backgroundColor: '#EEE' },
  progressContainer: { height: 12, flexDirection: 'row', borderRadius: 6, overflow: 'hidden', backgroundColor: '#EEE' },
  progressBar: { height: '100%' },
  percentRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  percentText: { fontSize: 12, fontWeight: '600', color: '#666' },
  listRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  listName: { width: 70, fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  listBarContainer: { flex: 1, height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, marginHorizontal: 12, overflow: 'hidden' },
  listBar: { height: '100%', borderRadius: 4 },
  listCount: { fontSize: 14, fontWeight: '700', color: '#666', width: 25, textAlign: 'right' },
  emptyText: { color: '#6B7280', fontSize: 14, textAlign: 'center' },
});