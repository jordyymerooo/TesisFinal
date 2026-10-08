/**
 * ReportModal.tsx
 * Modal nativo para reportar / denunciar un inmueble o arrendador
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AlertTriangle, X, Check, ShieldAlert } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme/theme';
import { enviarReporte } from '../../services/api';

export interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  propertyId?: number;
  landlordId?: number;
  propertyTitle?: string;
  onSuccess?: () => void;
}

const MOTIVOS = [
  'Información falsa/engañosa',
  'Intento de fraude',
  'Contenido inapropiado',
  'El inmueble ya no está disponible',
];

export function ReportModal({
  visible,
  onClose,
  propertyId,
  landlordId,
  propertyTitle,
  onSuccess,
}: ReportModalProps) {
  const [motivoSeleccionado, setMotivoSeleccionado] = useState<string>(MOTIVOS[0]);
  const [descripcion, setDescripcion] = useState<string>('');
  const [enviando, setEnviando] = useState<boolean>(false);

  const handleEnviar = async () => {
    if (!motivoSeleccionado) {
      Alert.alert('Motivo requerido', 'Por favor selecciona un motivo para la denuncia.');
      return;
    }

    setEnviando(true);
    try {
      await enviarReporte({
        inmueble_id: propertyId,
        arrendador_id: landlordId,
        motivo: motivoSeleccionado,
        descripcion: descripcion.trim() || undefined,
      });

      Alert.alert(
        'Reporte enviado',
        'Gracias por ayudarnos a mantener la comunidad segura. Nuestro equipo de administración revisará la denuncia a la brevedad.'
      );
      setDescripcion('');
      setMotivoSeleccionado(MOTIVOS[0]);
      onClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'No se pudo enviar el reporte. Inténtalo nuevamente.';
      Alert.alert('Error', msg);
    } finally {
      setEnviando(false);
    }
  };

  const handleCancelar = () => {
    if (!enviando) {
      setDescripcion('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancelar}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <ShieldAlert size={22} color={Colors.Error} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Reportar Inmueble</Text>
                {propertyTitle ? (
                  <Text style={styles.headerSubtitle} numberOfLines={1}>
                    {propertyTitle}
                  </Text>
                ) : null}
              </View>
            </View>
            <TouchableOpacity
              onPress={handleCancelar}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              disabled={enviando}
              accessibilityLabel="Cerrar modal"
            >
              <X size={20} color={Colors.Gray600} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView
            style={styles.bodyScroll}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionLabel}>Selecciona el motivo de la denuncia:</Text>

            {/* Opciones de Motivo */}
            <View style={styles.motivosList}>
              {MOTIVOS.map((motivo) => {
                const isSelected = motivoSeleccionado === motivo;
                return (
                  <TouchableOpacity
                    key={motivo}
                    style={[styles.motivoItem, isSelected && styles.motivoItemSelected]}
                    onPress={() => setMotivoSeleccionado(motivo)}
                    activeOpacity={0.7}
                    disabled={enviando}
                  >
                    <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
                      {isSelected && <View style={styles.radioButtonInner} />}
                    </View>
                    <Text style={[styles.motivoText, isSelected && styles.motivoTextSelected]}>
                      {motivo}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Descripción Adicional */}
            <Text style={[styles.sectionLabel, { marginTop: Spacing.base }]}>
              Detalles adicionales (opcional):
            </Text>
            <TextInput
              style={styles.textArea}
              placeholder="Explica brevemente lo ocurrido para que el equipo administrativo tome las medidas necesarias..."
              placeholderTextColor={Colors.Gray400}
              multiline
              numberOfLines={4}
              maxLength={1000}
              value={descripcion}
              onChangeText={setDescripcion}
              editable={!enviando}
              textAlignVertical="top"
            />
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelar}
              disabled={enviando}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, enviando && styles.submitButtonDisabled]}
              onPress={handleEnviar}
              disabled={enviando}
              activeOpacity={0.8}
            >
              {enviando ? (
                <ActivityIndicator size="small" color={Colors.White} />
              ) : (
                <>
                  <AlertTriangle size={16} color={Colors.White} style={{ marginRight: 6 }} />
                  <Text style={styles.submitButtonText}>Enviar Reporte</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: Colors.White,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.card,
    maxHeight: '90%',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Gray200,
    backgroundColor: Colors.Gray50,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.ErrorLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.Gray900,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.Gray500,
    marginTop: 2,
    maxWidth: 240,
  },
  closeBtn: {
    padding: Spacing.xs,
    borderRadius: 8,
    backgroundColor: Colors.Gray100,
  },
  bodyScroll: {
    flexGrow: 0,
  },
  bodyContent: {
    padding: Spacing.lg,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.Gray700,
    marginBottom: Spacing.sm,
  },
  motivosList: {
    gap: 8,
  },
  motivoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.Gray200,
    backgroundColor: Colors.Gray50,
  },
  motivoItemSelected: {
    borderColor: Colors.Error,
    backgroundColor: Colors.ErrorLight,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.Gray400,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  radioButtonSelected: {
    borderColor: Colors.Error,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.Error,
  },
  motivoText: {
    fontSize: 14,
    color: Colors.Gray800,
    flex: 1,
    fontWeight: '500',
  },
  motivoTextSelected: {
    color: Colors.Gray900,
    fontWeight: '700',
  },
  textArea: {
    borderWidth: 1,
    borderColor: Colors.Gray300,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 13,
    color: Colors.Gray900,
    backgroundColor: Colors.White,
    minHeight: 85,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.Gray200,
    backgroundColor: Colors.Gray50,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.Gray200,
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.Gray700,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.Error,
    ...Shadows.primary,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.White,
  },
});
