import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Megaphone, ShieldCheck } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme/theme';
import api from '../../services/api';

interface Aviso {
  id_comunicado?: number;
  id?: number;
  titulo: string;
  mensaje: string;
  destinatarios?: string;
  usuarios_ids?: number[];
  created_at: string;
  admin?: {
    id_usuario: number;
    nombres: string;
  };
}

export function AvisosScreen({ navigation }: any) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAvisos = async () => {
    try {
      const res = await api.get('/comunicados/mis-comunicados');
      const data = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setAvisos(data);
    } catch (error) {
      console.warn('Error fetching avisos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAvisos();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAvisos();
  };

  const renderAviso = ({ item }: { item: Aviso }) => (
    <View style={styles.avisoCard}>
      <View style={styles.avisoHeader}>
        <View style={styles.avisoIconContainer}>
          <Megaphone size={16} color={Colors.WinePrimary} />
        </View>
        <Text style={styles.avisoDate}>
          {new Date(item.created_at).toLocaleString()}
        </Text>
      </View>
      <Text style={styles.avisoTitle}>{item.titulo}</Text>
      <Text style={styles.avisoMessage}>{item.mensaje}</Text>
      {item.admin && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
          <ShieldCheck size={14} color="#16a34a" />
          <Text style={{ fontSize: 11, color: Colors.Gray500, marginLeft: 5 }}>
            Emitido por: {item.admin.nombres || 'Administración'}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.White} />
      
      {/* Header Fijo */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={Colors.Gray800} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.shieldContainer}>
            <ShieldCheck size={18} color="#FFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Soporte ULEAM Rental</Text>
            <Text style={styles.headerSubtitle}>Comunicados Oficiales</Text>
          </View>
        </View>
      </View>

      {/* Lista de Avisos */}
      <View style={styles.container}>
        <FlatList
          data={avisos}
          keyExtractor={(item, index) => (item.id_comunicado ?? item.id ?? index).toString()}
          renderItem={renderAviso}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.WinePrimary]}
              tintColor={Colors.WinePrimary}
            />
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Megaphone size={40} color={Colors.Gray300} />
                <Text style={styles.emptyText}>No hay comunicados oficiales por el momento.</Text>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.White,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Gray200,
    backgroundColor: Colors.White,
  },
  backButton: {
    marginRight: Spacing.md,
    padding: Spacing.xs,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shieldContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.WinePrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray900,
  },
  headerSubtitle: {
    fontSize: Typography.size.sm,
    color: Colors.Gray500,
    marginTop: 2,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.LightBG,
  },
  listContainer: {
    padding: Spacing.base,
    paddingBottom: 40,
  },
  avisoCard: {
    backgroundColor: Colors.White,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.Gray200,
  },
  avisoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avisoIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.WineLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.xs,
  },
  avisoDate: {
    fontSize: Typography.size.xs,
    color: Colors.Gray500,
  },
  avisoTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray900,
    marginBottom: Spacing.xs,
  },
  avisoMessage: {
    fontSize: Typography.size.sm,
    color: Colors.Gray700,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyText: {
    marginTop: Spacing.md,
    fontSize: Typography.size.base,
    color: Colors.Gray500,
    textAlign: 'center',
  },
});
