import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { SharedOSMMap } from '../../../components/SharedOSMMap';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  Camera,
  ImagePlus,
  MapPin,
  Check,
  X,
  Droplets,
  Zap,
  Wifi,
  Home,
  Sparkles,
  Wind,
  CheckCircle2,
  Clock,
  Lock,
  MailCheck,
} from 'lucide-react-native';

import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme/theme';
import { CustomInput } from '../../../components/ui/CustomInput';
import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { createInmueble, updateProperty } from '../../services/api';
import { formatPrice } from '../../utils/formatters';


interface PublishPropertyScreenProps {
  route?: any;
  navigation?: any;
  onBack?: () => void;
  onPublished?: () => void;
}

// Servicios predefinidos para la ULEAM
const AVAILABLE_SERVICES = [
  { id: 'agua', label: 'Agua Potable', icon: Droplets },
  { id: 'luz', label: 'Energía Eléctrica', icon: Zap },
  { id: 'internet', label: 'Internet Fibra Óptica', icon: Wifi },
  { id: 'amoblado', label: 'Amoblado Completo', icon: Home },
  { id: 'bano_privado', label: 'Baño Privado', icon: Sparkles },
  { id: 'ac', label: 'Aire Acondicionado', icon: Wind },
];

export function PublishPropertyScreen({
  route,
  navigation,
  onBack,
  onPublished,
}: PublishPropertyScreenProps) {
  const { user } = useAuth();
  const editMode = Boolean(route?.params?.editMode);
  const propertyData = route?.params?.propertyData;

  // ── Paso actual (1: Información, 2: Fotos, 3: Servicios) ──
  const [currentStep, setCurrentStep] = useState<number>(1);

  // ── Paso 1: Información ──
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState({
    latitude: -0.9537,
    longitude: -80.7483,
    latitudeDelta: 0.008,
    longitudeDelta: 0.008,
  });

  // ── Paso 2: Fotos ──
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
  ]);
  const [deletedPhotoIds, setDeletedPhotoIds] = useState<number[]>([]);

  // ── Paso 3: Servicios & Normas ──
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'agua',
    'luz',
    'internet',
  ]);
  const [normas, setNormas] = useState('');

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  // ── Modo Edición: Rellenar el formulario si viene data existente ──
  useEffect(() => {
    if (editMode && propertyData) {
      if (propertyData.titulo) {
        setTitle(propertyData.titulo);
      }
      if (propertyData.precio !== undefined && propertyData.precio !== null) {
        setPrice(String(propertyData.precio));
      }
      if (propertyData.descripcion) {
        setDescription(propertyData.descripcion);
      }
      if (propertyData.normas) {
        setNormas(propertyData.normas);
      }
      if (
        propertyData.ubicacion?.latitud &&
        propertyData.ubicacion?.longitud
      ) {
        setLocation({
          latitude: Number(propertyData.ubicacion.latitud),
          longitude: Number(propertyData.ubicacion.longitud),
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        });
      }
      if (
        propertyData.fotografias &&
        Array.isArray(propertyData.fotografias) &&
        propertyData.fotografias.length > 0
      ) {
        const fotoUrls = propertyData.fotografias
          .map((f: any) => f.url)
          .filter(Boolean);
        if (fotoUrls.length > 0) {
          setImages(fotoUrls);
        }
      }
      if (propertyData.servicios && Array.isArray(propertyData.servicios) && propertyData.servicios.length > 0) {
        const loadedServices = propertyData.servicios
          .map((s: any) => (typeof s === 'string' ? s : (s.clave ?? s.nombre?.toLowerCase())))
          .filter(Boolean);
        if (loadedServices.length > 0) {
          setSelectedServices(loadedServices);
        }
      }
    }
  }, [editMode, propertyData]);

  // Manejador de retroceso
  const handleBackPress = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      if (onBack) {
        onBack();
      } else if (navigation?.canGoBack?.()) {
        navigation.goBack();
      }
    }
  };

  // Selector de fotos con ImagePicker
  const handlePickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso Denegado',
          'Se necesita acceso a la galería para subir fotografías del alojamiento estudiantil.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newUris = result.assets.map((asset) => asset.uri);
        setImages((prev) => [...prev, ...newUris]);
      }
    } catch (err) {
      console.warn('[ImagePicker] Error al seleccionar imagen:', err);
    }
  };

  // Eliminar foto seleccionada
  const handleRemoveImage = (indexToRemove: number) => {
    const photoToRemove = images[indexToRemove];

    // Si estamos en modo edición y la foto proviene de las fotos existentes en el servidor
    if (editMode && propertyData?.fotografias && Array.isArray(propertyData.fotografias)) {
      const match = propertyData.fotografias.find(
        (f: any) =>
          f.url === photoToRemove ||
          photoToRemove.includes(f.url) ||
          f.url?.includes(photoToRemove)
      );
      if (match) {
        const photoId = match.id_foto ?? match.id ?? match.id_fotografia;
        if (photoId) {
          setDeletedPhotoIds((prev) => [...prev, Number(photoId)]);
        }
      }
    }

    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Toggle de servicios (chips)
  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  // Finalizar publicación conectando con Laravel API
  const handleFinalPublish = async () => {
    if (!title.trim()) {
      Alert.alert('Datos requeridos', 'Por favor ingresa un título para el alojamiento.');
      return;
    }
    if (!price.trim()) {
      Alert.alert('Datos requeridos', 'Por favor ingresa la tarifa mensual.');
      return;
    }
    if (!images.length) {
      Alert.alert('Datos requeridos', 'Por favor selecciona al menos una fotografía.');
      return;
    }

    try {
      setIsPublishing(true);

      const formData = new FormData();
      formData.append('titulo', title.trim());
      formData.append('precio', price.trim());
      formData.append('descripcion', description.trim() || 'Alojamiento para estudiantes cerca de la ULEAM');
      formData.append('normas', normas.trim());
      formData.append('tipo', 'mini_departamento');
      formData.append('capacidad', '1');
      formData.append('servicios_incluidos', selectedServices.length > 0 ? '1' : '0');
      // Adjuntar arreglo de servicios seleccionados
      selectedServices.forEach((s) => {
        formData.append('servicios[]', s);
      });
      formData.append('servicios', JSON.stringify(selectedServices));
      formData.append('latitud', location.latitude.toString());
      formData.append('longitud', location.longitude.toString());
      formData.append('sector', 'Barbasquillo / ULEAM');
      formData.append('direccion_referencial', 'Cerca de la entrada principal de la ULEAM');

      // Adjuntar IDs de fotos eliminadas si estamos en modo edición
      if (editMode && deletedPhotoIds.length > 0) {
        deletedPhotoIds.forEach((id) => {
          formData.append('deleted_photos[]', id.toString());
        });
        formData.append('deleted_photos', JSON.stringify(deletedPhotoIds));
      }

      // Iterar sobre las fotos seleccionadas: solo enviar archivos nuevos al array 'fotos[]'
      images.forEach((uri, index) => {
        if (uri.startsWith('http://') || uri.startsWith('https://')) {
          // Foto ya existente en el servidor, no se reenvía como archivo binario
          return;
        }

        const filename = uri.split('/').pop() || `foto_${index}.jpg`;
        const extension = filename.split('.').pop()?.toLowerCase();
        let mimeType = 'image/jpeg';
        if (extension === 'png') {
          mimeType = 'image/png';
        } else if (extension === 'webp') {
          mimeType = 'image/webp';
        }

        formData.append('fotos[]', {
          uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
          name: filename.includes('.') ? filename : `${filename}.jpg`,
          type: mimeType,
        } as any);
      });

      if (editMode && propertyData?.id_inmueble) {
        await updateProperty(propertyData.id_inmueble, formData);

        Alert.alert(
          '¡Inmueble Actualizado!',
          'Los datos de la propiedad se han modificado exitosamente.',
          [
            {
              text: 'Aceptar',
              onPress: () => {
                if (onPublished) {
                  onPublished();
                } else if (navigation?.canGoBack?.()) {
                  navigation.goBack();
                } else if (navigation?.navigate) {
                  try {
                    navigation.navigate('MisPropiedades');
                  } catch {
                    navigation.navigate('MainTabs');
                  }
                }
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        await createInmueble(formData);

        Alert.alert(
          '¡Publicación Exitosa!',
          'Propiedad publicada correctamente, en revisión.',
          [
            {
              text: 'Aceptar',
              onPress: () => {
                if (onPublished) {
                  onPublished();
                } else if (navigation?.navigate) {
                  try {
                    navigation.navigate('Home');
                  } catch {
                    try {
                      navigation.navigate('MisPropiedades');
                    } catch {
                      navigation.navigate('MainTabs');
                    }
                  }
                }
              },
            },
          ],
          { cancelable: false }
        );

        setPublishedSuccess(true);
      }
    } catch (error: any) {
      console.error('[PublishPropertyScreen] Error al publicar:', error);
      Alert.alert(
        'Error al publicar',
        error?.message || 'No se pudo conectar con el servidor para registrar el inmueble.'
      );
    } finally {
      setIsPublishing(false);
    }
  };

  // ── Pantalla de éxito tras publicar ──
  if (publishedSuccess) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.successContainer}>
          <View style={styles.successIconCircle}>
            <CheckCircle2 size={56} color={Colors.Success} />
          </View>
          <Text style={styles.successTitle}>¡Alojamiento Publicado!</Text>
          <Text style={styles.successSubtitle}>
            Tu propiedad ha sido registrada exitosamente en la red ULEAM. Nuestro equipo de administración verificará los datos en breve.
          </Text>

          <View style={styles.successPreviewCard}>
            <Text style={styles.previewCardTitle}>{title || 'Suite Barbasquillo ULEAM'}</Text>
            <Text style={styles.previewCardPrice}>
              ${formatPrice(price || 180)}<Text style={styles.previewCardPerMonth}> / mes</Text>
            </Text>
            <Text style={styles.previewCardMeta}>
              {images.length} fotos • {selectedServices.length} servicios incluidos
            </Text>
          </View>

          <PrimaryButton
            title="Volver al Menú Principal"
            style={{ width: '100%', marginTop: Spacing.xl }}
            onPress={() => {
              if (onPublished) {
                onPublished();
              } else if (navigation?.navigate) {
                navigation.navigate('MainTabs');
              }
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ── Pantalla de Bloqueo 1: Correo sin verificar ──
  if (!user?.email_verified_at) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={handleBackPress}
              activeOpacity={0.7}
            >
              <ArrowLeft size={22} color={Colors.Gray900} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>
                {editMode ? 'Editar Alojamiento' : 'Publicar Alojamiento'}
              </Text>
            </View>
            <View style={{ width: 40 }} />
          </View>
        </View>
        <View style={styles.blockedCenterContainer}>
          <EmptyState
            icon={MailCheck}
            title="Verifica tu correo"
            message="Revisa tu bandeja de entrada para activar tu cuenta antes de publicar."
            actionText="Verificar correo ahora"
            onAction={() => {
              if (navigation?.navigate) {
                navigation.navigate('VerifyEmail', { email: user?.correo });
              }
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ── Pantalla de Bloqueo 2: Cuenta en revisión por el Administrador (KYC) ──
  if (user?.estado !== 'activo') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={handleBackPress}
              activeOpacity={0.7}
            >
              <ArrowLeft size={22} color={Colors.Gray900} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>
                {editMode ? 'Editar Alojamiento' : 'Publicar Alojamiento'}
              </Text>
            </View>
            <View style={{ width: 40 }} />
          </View>
        </View>
        <View style={styles.blockedCenterContainer}>
          <EmptyState
            icon={Clock}
            title="Cuenta en revisión"
            message="Estamos revisando tu perfil. Te enviaremos un correo cuando seas aprobado para publicar."
            actionText="Volver al Menú"
            onAction={handleBackPress}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Cabecera y Barra de Progreso (Paso 2) ── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <ArrowLeft size={22} color={Colors.Gray900} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              {editMode ? 'Editar Alojamiento' : 'Publicar Alojamiento'}
            </Text>
            <Text style={styles.headerStepText}>
              Paso {currentStep} de 3:{' '}
              {currentStep === 1
                ? 'Información'
                : currentStep === 2
                ? 'Fotos'
                : 'Servicios'}
            </Text>
          </View>

          <View style={{ width: 40 }} />
        </View>

        {/* Barra de Progreso Visual */}
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width:
                  currentStep === 1
                    ? '33.3%'
                    : currentStep === 2
                    ? '66.6%'
                    : '100%',
              },
            ]}
          />
        </View>
      </View>

      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ══════════════════════════════════════════════════
            PASO 1: INFORMACIÓN BÁSICA & UBICACIÓN EN EL MAPA
            ══════════════════════════════════════════════════ */}
        {currentStep === 1 && (
          <View>
            <Text style={styles.sectionHeading}>Detalles Principales</Text>
            <Text style={styles.sectionSubtitle}>
              Ingresa el nombre atractivo para los estudiantes y la tarifa mensual.
            </Text>

            {/* CustomInput para Título del anuncio */}
            <CustomInput
              label="Título del anuncio"
              placeholder="Ej. Suite amoblada frente a Facultad de Ingeniería"
              value={title}
              onChangeText={setTitle}
            />

            {/* CustomInput para Precio mensual */}
            <CustomInput
              label="Precio mensual ($USD)"
              placeholder="Ej. 180"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
              leftIcon={<Text style={styles.currencySymbol}>$</Text>}
            />

            {/* CustomInput para Descripción breve */}
            {/* CustomInput para Descripción del alojamiento */}
            <CustomInput
              label="Descripción del alojamiento"
              placeholder="Describe cercanías al campus, ambiente de estudio, etc."
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
              inputStyle={{ minHeight: 100, textAlignVertical: 'top', paddingTop: 6 }}
            />

            {/* MapView de 200px con Marcador */}
            <View style={styles.mapSection}>
              <View style={styles.mapLabelRow}>
                <MapPin size={16} color={Colors.WinePrimary} />
                <Text style={styles.mapLabelText}>Fijar ubicación en el mapa</Text>
              </View>
              <Text style={styles.mapHintText}>
                Toca sobre el mapa para ubicar el pin en la posición exacta del inmueble.
              </Text>

              <View style={styles.mapContainer}>
                <SharedOSMMap
                  style={styles.mapView}
                  provider={PROVIDER_DEFAULT}
                  initialRegion={location}
                  onPress={(e) => {
                    const newCoordinate = e?.nativeEvent?.coordinate;
                    if (newCoordinate) {
                      setLocation({
                        latitude: newCoordinate.latitude,
                        longitude: newCoordinate.longitude,
                        latitudeDelta: 0.008,
                        longitudeDelta: 0.008,
                      });
                    }
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: location.latitude,
                      longitude: location.longitude,
                    }}
                    title="Ubicación de tu Inmueble"
                    description="Punto visible para estudiantes ULEAM"
                    pinColor={Colors.WinePrimary}
                  />
                </SharedOSMMap>
              </View>
            </View>

            {/* Botón Siguiente Paso */}
            <PrimaryButton
              title="Siguiente paso"
              style={styles.bottomActionButton}
              onPress={() => setCurrentStep(2)}
            />
          </View>
        )}

        {/* ══════════════════════════════════════════════════
            PASO 2: FOTOGRAFÍAS DEL INMUEBLE
            ══════════════════════════════════════════════════ */}
        {currentStep === 2 && (
          <View>
            <Text style={styles.sectionHeading}>Fotos del Alojamiento</Text>
            <Text style={styles.sectionSubtitle}>
              Sube fotos claras de la habitación, baño y áreas comunes. La primera imagen será tu portada principal.
            </Text>

            {/* Área con borde punteado que ejecuta ImagePicker */}
            <TouchableOpacity
              style={styles.dashedUploadArea}
              onPress={handlePickImages}
              activeOpacity={0.8}
            >
              <View style={styles.dashedUploadIconCircle}>
                <ImagePlus size={28} color={Colors.WinePrimary} />
              </View>
              <Text style={styles.dashedUploadTitle}>
                Toca para abrir la galería del celular
              </Text>
              <Text style={styles.dashedUploadSubtitle}>
                Sube fotos en formato JPG o PNG de alta resolución
              </Text>
            </TouchableOpacity>

            {/* Lista Horizontal de Fotos Seleccionadas */}
            <View style={styles.photosSection}>
              <View style={styles.photosSectionHeader}>
                <Text style={styles.photosCountText}>
                  Fotos seleccionadas ({images.length})
                </Text>
                <TouchableOpacity onPress={handlePickImages} activeOpacity={0.7}>
                  <Text style={styles.addMorePhotosText}>+ Añadir más</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalPhotosScroll}
              >
                {images.map((uri, index) => (
                  <View key={index} style={styles.photoCard}>
                    <Image source={{ uri }} style={styles.photoImage} />

                    {/* Badge Amarillo de PORTADA en la primera foto */}
                    {index === 0 && (
                      <View style={styles.portadaBadge}>
                        <Text style={styles.portadaBadgeText}>PORTADA</Text>
                      </View>
                    )}

                    {/* Botón para eliminar foto */}
                    <TouchableOpacity
                      style={styles.removePhotoBtn}
                      onPress={() => handleRemoveImage(index)}
                      activeOpacity={0.8}
                    >
                      <X size={14} color={Colors.White} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Botón Siguiente Paso */}
            <PrimaryButton
              title="Siguiente paso"
              style={styles.bottomActionButton}
              onPress={() => setCurrentStep(3)}
            />
          </View>
        )}

        {/* ══════════════════════════════════════════════════
            PASO 3: SERVICIOS & COMODIDADES INCLUIDAS
            ══════════════════════════════════════════════════ */}
        {currentStep === 3 && (
          <View>
            <Text style={styles.sectionHeading}>Servicios Incluidos</Text>
            <Text style={styles.sectionSubtitle}>
              Selecciona qué servicios y comodidades incluye la tarifa mensual para los estudiantes.
            </Text>

            {/* Grid de botones seleccionables (chips) */}
            <View style={styles.servicesGrid}>
              {AVAILABLE_SERVICES.map((service) => {
                const isSelected = selectedServices.includes(service.id);
                const IconComponent = service.icon;

                return (
                  <TouchableOpacity
                    key={service.id}
                    style={[
                      styles.serviceChip,
                      isSelected && styles.serviceChipSelected,
                    ]}
                    onPress={() => toggleService(service.id)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.serviceIconContainer,
                        isSelected && styles.serviceIconContainerSelected,
                      ]}
                    >
                      <IconComponent
                        size={20}
                        color={isSelected ? Colors.WinePrimary : Colors.Gray600}
                      />
                    </View>

                    <Text
                      style={[
                        styles.serviceChipLabel,
                        isSelected && styles.serviceChipLabelSelected,
                      ]}
                    >
                      {service.label}
                    </Text>

                    {isSelected && (
                      <View style={styles.selectedCheckBadge}>
                        <Check size={12} color={Colors.White} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── Sección de Normas del Alojamiento (Paso 3) ── */}
            <View style={styles.normasSection}>
              <Text style={styles.sectionHeading}>Normas del Alojamiento</Text>
              <Text style={styles.sectionSubtitle}>
                Escribe las reglas de tu alojamiento (ej. No mascotas, Silencio a las 10PM). Separa cada norma con un salto de línea.
              </Text>

              <CustomInput
                placeholder={'• No fumar en áreas interiores\n• No se admiten mascotas\n• Silencio a partir de las 22:00\n• Cuidar el mobiliario y electrodomésticos'}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                value={normas}
                onChangeText={setNormas}
                inputStyle={{ minHeight: 100, textAlignVertical: 'top', paddingTop: 8 }}
              />
            </View>

            {/* Tarjeta de Resumen Pre-Publicación */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardHeading}>Resumen del Alojamiento</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Título:</Text>
                <Text style={styles.summaryValue} numberOfLines={1}>
                  {title || 'Suite amoblada Barbasquillo ULEAM'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Precio mensual:</Text>
                <Text style={[styles.summaryValue, { color: Colors.WinePrimary, fontWeight: '800' }]}>
                  ${formatPrice(price || 180)} / mes
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Fotografías:</Text>
                <Text style={styles.summaryValue}>{images.length} fotos cargadas</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Servicios:</Text>
                <Text style={styles.summaryValue}>{selectedServices.length} incluidos</Text>
              </View>
              {normas.trim().length > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Normas:</Text>
                  <Text style={styles.summaryValue} numberOfLines={1}>
                    {normas.split('\n').filter(Boolean).length} reglas definidas
                  </Text>
                </View>
              )}
            </View>

            {/* Botón Finalizar y Publicar */}
            <PrimaryButton
              title={
                editMode
                  ? (isPublishing ? 'Guardando cambios...' : 'Guardar Cambios')
                  : (isPublishing ? 'Publicando en ULEAM...' : 'Finalizar y Publicar')
              }
              loading={isPublishing}
              style={styles.bottomActionButton}
              onPress={handleFinalPublish}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.LightBG,
  },
  header: {
    backgroundColor: Colors.White,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Gray200,
    paddingHorizontal: Spacing.base,
    paddingTop: Platform.OS === 'android' ? 36 : Spacing.sm,
    paddingBottom: Spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.Gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.size.base + 1,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray900,
  },
  headerStepText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    color: Colors.WinePrimary,
    marginTop: 2,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: Colors.Gray200,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.WinePrimary,
    borderRadius: 2,
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.base,
    paddingBottom: 40,
  },
  sectionHeading: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray900,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: Typography.size.sm,
    color: Colors.Gray500,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  currencySymbol: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray600,
  },
  mapSection: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  mapLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  mapLabelText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.Gray800,
  },
  mapHintText: {
    fontSize: Typography.size.xs,
    color: Colors.Gray500,
    marginBottom: Spacing.sm,
  },
  mapContainer: {
    height: 200,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.Gray200,
    ...Shadows.soft,
  },
  mapView: {
    width: '100%',
    height: '100%',
  },
  dashedUploadArea: {
    borderWidth: 2,
    borderColor: Colors.WinePrimary,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.xl,
    backgroundColor: '#FFF8F8',
    paddingVertical: 28,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  dashedUploadIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(140, 21, 21, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  dashedUploadTitle: {
    fontSize: Typography.size.sm + 1,
    fontWeight: Typography.weight.bold,
    color: Colors.WinePrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  dashedUploadSubtitle: {
    fontSize: Typography.size.xs,
    color: Colors.Gray500,
    textAlign: 'center',
  },
  photosSection: {
    marginBottom: Spacing.xl,
  },
  photosSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  photosCountText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.Gray800,
  },
  addMorePhotosText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    color: Colors.WinePrimary,
  },
  horizontalPhotosScroll: {
    paddingVertical: 6,
    gap: 12,
  },
  photoCard: {
    width: 130,
    height: 130,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.Gray200,
    ...Shadows.soft,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  portadaBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    ...Shadows.soft,
  },
  portadaBadgeText: {
    color: Colors.White,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: Spacing.xl,
  },
  normasSection: {
    marginBottom: Spacing.xl,
  },
  serviceChip: {
    width: '48%',
    backgroundColor: Colors.White,
    borderWidth: 1.5,
    borderColor: Colors.Gray200,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    ...Shadows.soft,
  },
  serviceChipSelected: {
    borderColor: Colors.WinePrimary,
    backgroundColor: 'rgba(140, 21, 21, 0.05)',
  },
  serviceIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.Gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  serviceIconContainerSelected: {
    backgroundColor: 'rgba(140, 21, 21, 0.12)',
  },
  serviceChipLabel: {
    flex: 1,
    fontSize: Typography.size.xs + 1,
    fontWeight: Typography.weight.semibold,
    color: Colors.Gray700,
  },
  serviceChipLabelSelected: {
    color: Colors.WinePrimary,
    fontWeight: Typography.weight.bold,
  },
  selectedCheckBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.WinePrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    backgroundColor: Colors.White,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.Gray200,
    marginBottom: Spacing.xl,
    ...Shadows.card,
  },
  summaryCardHeading: {
    fontSize: Typography.size.sm + 1,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray900,
    marginBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Gray100,
    paddingBottom: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  summaryLabel: {
    fontSize: Typography.size.xs + 1,
    color: Colors.Gray500,
  },
  summaryValue: {
    fontSize: Typography.size.xs + 1,
    fontWeight: Typography.weight.semibold,
    color: Colors.Gray800,
    maxWidth: '65%',
  },
  bottomActionButton: {
    width: '100%',
    marginTop: Spacing.sm,
  },
  successContainer: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.SuccessLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  successTitle: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray900,
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: Typography.size.sm,
    color: Colors.Gray600,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  successPreviewCard: {
    width: '100%',
    backgroundColor: Colors.White,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.Gray200,
    ...Shadows.card,
  },
  previewCardTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray900,
    marginBottom: 4,
  },
  previewCardPrice: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.WinePrimary,
    marginBottom: 6,
  },
  previewCardPerMonth: {
    fontSize: Typography.size.xs,
    color: Colors.Gray500,
    fontWeight: 'normal',
  },
  previewCardMeta: {
    fontSize: Typography.size.xs,
    color: Colors.Gray500,
  },
  blockedCenterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
});
