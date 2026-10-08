/**
 * PropertyCard.tsx
 * Tarjeta de alojamiento reutilizable para listados móviles con paginación
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MapPin, Star, Sparkles } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../theme/theme';
import { formatPrice } from '../../utils/formatters';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80';

export interface PropertyCardProps {
  property: any;
  onPress?: (property: any) => void;
}

export function PropertyCard({ property, onPress }: PropertyCardProps) {
  if (!property) return null;

  const id = property.id ?? property.id_inmueble;
  const fotoUrl =
    property.fotografias?.[0]?.url ??
    property.fotos?.[0]?.url ??
    property.portada_url ??
    FALLBACK_IMAGE;

  const titulo = property.titulo ?? 'Alojamiento Estudiantil';
  const precio = property.precio_mensual ?? property.precio ?? property.precio_numero ?? 0;
  const direccion =
    property.ubicacion?.direccion_referencial ??
    property.ubicacion?.sector ??
    property.direccion ??
    'Cerca del campus ULEAM';

  const distancia =
    property.ubicacion?.distancia_uleam_km !== undefined
      ? `${property.ubicacion.distancia_uleam_km} km de ULEAM`
      : property.distancia ?? 'A pocos minutos de ULEAM';

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={() => onPress && onPress(property)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: fotoUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {titulo}
        </Text>

        <View style={styles.locationRow}>
          <MapPin size={13} color={Colors.Gray500} style={{ marginRight: 4 }} />
          <Text style={styles.locationText} numberOfLines={1}>
            {direccion}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              ${formatPrice(precio)}
              <Text style={styles.period}> / mes</Text>
            </Text>
          </View>

          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>{distancia}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default PropertyCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.White,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.Gray200,
    ...Shadows.card,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: Colors.Gray100,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: Spacing.base,
  },
  title: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray900,
    marginBottom: Spacing.xs,
    lineHeight: 22,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  locationText: {
    fontSize: Typography.size.xs,
    color: Colors.Gray600,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.Gray100,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.black,
    color: Colors.WinePrimary,
  },
  period: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.regular,
    color: Colors.Gray500,
  },
  distanceBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  distanceText: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '600',
  },
});
