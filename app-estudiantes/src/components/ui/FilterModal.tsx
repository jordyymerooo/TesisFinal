import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, RotateCcw, Check } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme/theme';

export interface FilterState {
  tipo: string;
  minPrice: string;
  maxPrice: string;
  rooms: string;
}

export const DEFAULT_FILTERS: FilterState = {
  tipo: 'Todos',
  minPrice: '',
  maxPrice: '',
  rooms: 'Cualquiera',
};

export interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

const PROPERTY_TYPES = ['Todos', 'Habitación', 'Departamento', 'Casa', 'Suite'];
const ROOM_OPTIONS = ['Cualquiera', '1', '2', '3+'];

export function FilterModal({
  visible,
  onClose,
  onApply,
  initialFilters = DEFAULT_FILTERS,
}: FilterModalProps) {
  const [tipo, setTipo] = useState<string>(initialFilters.tipo || 'Todos');
  const [minPrice, setMinPrice] = useState<string>(initialFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState<string>(initialFilters.maxPrice || '');
  const [rooms, setRooms] = useState<string>(initialFilters.rooms || 'Cualquiera');

  // Sincronizar estado al abrir el modal con los filtros activos actuales
  useEffect(() => {
    if (visible) {
      setTipo(initialFilters.tipo || 'Todos');
      setMinPrice(initialFilters.minPrice || '');
      setMaxPrice(initialFilters.maxPrice || '');
      setRooms(initialFilters.rooms || 'Cualquiera');
    }
  }, [visible, initialFilters]);

  const handleClearAll = () => {
    setTipo('Todos');
    setMinPrice('');
    setMaxPrice('');
    setRooms('Cualquiera');
  };

  const handleApply = () => {
    onApply({
      tipo,
      minPrice: minPrice.trim(),
      maxPrice: maxPrice.trim(),
      rooms,
    });
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.sheetContainer}
            >
              {/* Barra de arrastre visual */}
              <View style={styles.dragHandle} />

              {/* Cabecera del Modal */}
              <View style={styles.header}>
                <View>
                  <Text style={styles.headerTitle}>Filtros de Búsqueda</Text>
                  <Text style={styles.headerSubtitle}>
                    Personaliza los alojamientos en el mapa
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  activeOpacity={0.7}
                  accessibilityLabel="Cerrar filtros"
                >
                  <X size={20} color={Colors.Gray600} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* ── Sección 1: Tipo de Inmueble ── */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Tipo de Alojamiento</Text>
                  <View style={styles.pillsRow}>
                    {PROPERTY_TYPES.map((item) => {
                      const isSelected = tipo === item;
                      return (
                        <TouchableOpacity
                          key={item}
                          style={[
                            styles.pill,
                            isSelected ? styles.pillSelected : styles.pillUnselected,
                          ]}
                          onPress={() => setTipo(item)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.pillText,
                              isSelected
                                ? styles.pillTextSelected
                                : styles.pillTextUnselected,
                            ]}
                          >
                            {item}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* ── Sección 2: Rango de Precio ── */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Precio Mensual ($ USD)</Text>
                  <View style={styles.priceRow}>
                    <View style={styles.priceInputWrapper}>
                      <Text style={styles.inputPrefix}>$</Text>
                      <TextInput
                        style={styles.priceInput}
                        placeholder="Mínimo"
                        placeholderTextColor={Colors.Gray400}
                        keyboardType="numeric"
                        value={minPrice}
                        onChangeText={setMinPrice}
                      />
                    </View>

                    <Text style={styles.priceDivider}>—</Text>

                    <View style={styles.priceInputWrapper}>
                      <Text style={styles.inputPrefix}>$</Text>
                      <TextInput
                        style={styles.priceInput}
                        placeholder="Máximo"
                        placeholderTextColor={Colors.Gray400}
                        keyboardType="numeric"
                        value={maxPrice}
                        onChangeText={setMaxPrice}
                      />
                    </View>
                  </View>
                </View>

                {/* ── Sección 3: Habitaciones / Capacidad ── */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Habitaciones / Capacidad</Text>
                  <View style={styles.pillsRow}>
                    {ROOM_OPTIONS.map((item) => {
                      const isSelected = rooms === item;
                      return (
                        <TouchableOpacity
                          key={item}
                          style={[
                            styles.pill,
                            styles.roomPill,
                            isSelected ? styles.pillSelected : styles.pillUnselected,
                          ]}
                          onPress={() => setRooms(item)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.pillText,
                              isSelected
                                ? styles.pillTextSelected
                                : styles.pillTextUnselected,
                            ]}
                          >
                            {item}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </ScrollView>

              {/* ── Sección 4: Botones de Acción ── */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={handleClearAll}
                  activeOpacity={0.7}
                >
                  <RotateCcw size={16} color={Colors.Gray700} style={{ marginRight: 6 }} />
                  <Text style={styles.clearBtnText}>Limpiar todo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.applyBtn}
                  onPress={handleApply}
                  activeOpacity={0.88}
                >
                  <Check size={18} color={Colors.White} style={{ marginRight: 6 }} />
                  <Text style={styles.applyBtnText}>Aplicar filtros</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.White,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 32 : Spacing.base,
    ...Shadows.card,
  },
  dragHandle: {
    width: 44,
    height: 4,
    backgroundColor: Colors.Gray300,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Gray100,
  },
  headerTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray900,
  },
  headerSubtitle: {
    fontSize: Typography.size.xs,
    color: Colors.Gray500,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.Gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
    gap: Spacing.lg,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray800,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pill: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
    borderRadius: BorderRadius.pill,
    borderWidth: 1.5,
  },
  roomPill: {
    minWidth: 68,
    alignItems: 'center',
  },
  pillSelected: {
    backgroundColor: Colors.WinePrimary,
    borderColor: Colors.WinePrimary,
  },
  pillUnselected: {
    backgroundColor: Colors.Gray50,
    borderColor: Colors.Gray200,
  },
  pillText: {
    fontSize: Typography.size.xs + 1,
  },
  pillTextSelected: {
    color: Colors.White,
    fontWeight: Typography.weight.bold,
  },
  pillTextUnselected: {
    color: Colors.Gray700,
    fontWeight: Typography.weight.medium,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  priceInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.Gray50,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.Gray300,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  inputPrefix: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray500,
    marginRight: 6,
  },
  priceInput: {
    flex: 1,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.Gray900,
    padding: 0,
  },
  priceDivider: {
    fontSize: Typography.size.base,
    color: Colors.Gray400,
    fontWeight: Typography.weight.bold,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.Gray100,
    gap: Spacing.md,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.Gray100,
    paddingVertical: 14,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.lg,
  },
  clearBtnText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.Gray700,
  },
  applyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.WinePrimary,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    ...Shadows.primary,
  },
  applyBtnText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    color: Colors.White,
  },
});

export default FilterModal;
