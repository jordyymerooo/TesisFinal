/**
 * PrivacyModal.tsx
 * Modal de Política de Privacidad y Tratamiento de Datos Personales (LOPDP Ecuador)
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { ShieldCheck, X } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme/theme';

export interface PrivacyModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export function PrivacyModal({ visible, onClose, onAccept }: PrivacyModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <ShieldCheck size={22} color={Colors.WinePrimary} />
              </View>
              <Text style={styles.headerTitle}>Política de Privacidad</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Cerrar modal"
            >
              <X size={20} color={Colors.Gray600} />
            </TouchableOpacity>
          </View>

          {/* Legal Content in ScrollView */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            <Text style={styles.mainHeading}>
              POLÍTICA DE PRIVACIDAD Y TRATAMIENTO DE DATOS PERSONALES
            </Text>

            <Text style={styles.subHeading}>
              En cumplimiento con la Ley Orgánica de Protección de Datos Personales (LOPDP) del Ecuador:
            </Text>

            <View style={styles.clauseBox}>
              <Text style={styles.clauseNumber}>1. Finalidad:</Text>
              <Text style={styles.clauseText}>
                Las imágenes de su documento de identidad (cédula), fotografías faciales (selfie) y comprobantes de domicilio solicitados por ULEAM Rental se utilizan ESTRICTA Y EXCLUSIVAMENTE para la validación de identidad (KYC) y seguridad de la comunidad estudiantil.
              </Text>
            </View>

            <View style={styles.clauseBox}>
              <Text style={styles.clauseNumber}>2. Confidencialidad:</Text>
              <Text style={styles.clauseText}>
                Esta información sensible se almacena de forma encriptada en nuestros servidores y NO será compartida, vendida, ni expuesta a terceros, arrendadores o estudiantes bajo ninguna circunstancia.
              </Text>
            </View>

            <View style={styles.clauseBox}>
              <Text style={styles.clauseNumber}>3. Conservación:</Text>
              <Text style={styles.clauseText}>
                Los documentos se mantendrán en el sistema únicamente mientras su cuenta permanezca activa.
              </Text>
            </View>

            <View style={styles.clauseBox}>
              <Text style={styles.clauseNumber}>4. Derechos (ARCO):</Text>
              <Text style={styles.clauseText}>
                Usted tiene el derecho de solicitar el Acceso, Rectificación, Cancelación u Oposición de sus datos en cualquier momento. Al eliminar su cuenta, todos los archivos físicos (fotos) y registros en base de datos serán destruidos permanentemente de nuestros servidores.
              </Text>
            </View>
          </ScrollView>

          {/* Footer Action Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.acceptButton}
              activeOpacity={0.85}
              onPress={() => {
                onAccept();
                onClose();
              }}
              accessibilityLabel="Entendido y de acuerdo"
            >
              <Text style={styles.acceptButtonText}>Entendido y de acuerdo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  modalCard: {
    backgroundColor: Colors.White,
    borderRadius: BorderRadius.xl,
    width: '100%',
    maxHeight: '85%',
    overflow: 'hidden',
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Gray100,
    backgroundColor: Colors.White,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray900,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.Gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flexGrow: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    gap: Spacing.md,
  },
  mainHeading: {
    fontSize: Typography.size.sm + 1,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray900,
    lineHeight: 20,
    textAlign: 'center',
  },
  subHeading: {
    fontSize: Typography.size.xs + 1,
    color: Colors.Gray600,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  clauseBox: {
    backgroundColor: Colors.Gray50,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.WinePrimary,
    gap: 4,
  },
  clauseNumber: {
    fontSize: Typography.size.xs + 1,
    fontWeight: Typography.weight.bold,
    color: Colors.WinePrimary,
  },
  clauseText: {
    fontSize: Typography.size.xs + 1,
    color: Colors.Gray700,
    lineHeight: 18,
  },
  footer: {
    padding: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.Gray100,
    backgroundColor: Colors.White,
  },
  acceptButton: {
    backgroundColor: Colors.WinePrimary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    color: Colors.White,
    fontSize: Typography.size.sm + 1,
    fontWeight: Typography.weight.bold,
  },
});

export default PrivacyModal;
