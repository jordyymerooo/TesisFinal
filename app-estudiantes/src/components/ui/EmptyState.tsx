import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme/theme';

export interface EmptyStateProps {
  icon?: React.ComponentType<{ size: number; color: string; strokeWidth?: number }> | React.ReactNode;
  title: string;
  description?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  actionIcon?: React.ComponentType<{ size: number; color: string; strokeWidth?: number }> | React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  message,
  actionText,
  onAction,
  actionIcon: ActionIcon,
  style,
}: EmptyStateProps) {
  const descText = description || message || '';

  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) {
      return Icon;
    }
    const IconComponent = Icon as React.ComponentType<{
      size: number;
      color: string;
      strokeWidth?: number;
    }>;
    return <IconComponent size={40} color={Colors.WinePrimary} strokeWidth={2} />;
  };

  const renderActionIcon = () => {
    if (!ActionIcon) return null;
    if (React.isValidElement(ActionIcon)) {
      return ActionIcon;
    }
    const ActionIconComponent = ActionIcon as React.ComponentType<{
      size: number;
      color: string;
      strokeWidth?: number;
    }>;
    return <ActionIconComponent size={18} color={Colors.White} strokeWidth={2.4} />;
  };

  return (
    <View style={[styles.container, style]}>
      {Icon ? <View style={styles.iconCircle}>{renderIcon()}</View> : null}

      <Text style={styles.title}>{title}</Text>
      {descText ? <Text style={styles.description}>{descText}</Text> : null}

      {actionText && onAction ? (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onAction}
          activeOpacity={0.85}
        >
          {renderActionIcon()}
          <Text style={styles.actionButtonText}>{actionText}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.WineLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  title: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.Gray900,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: Typography.size.sm,
    color: Colors.Gray500,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
    maxWidth: 320,
  },
  actionButton: {
    backgroundColor: Colors.WinePrimary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.pill,
    ...Shadows.primary,
  },
  actionButtonText: {
    color: Colors.White,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
  },
});

export default EmptyState;
