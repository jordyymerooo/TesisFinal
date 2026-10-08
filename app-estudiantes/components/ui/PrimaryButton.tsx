import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { Colors, BorderRadius, Typography, Shadows, Spacing } from '../../src/theme/theme';

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function PrimaryButton({
  title,
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  onPress,
  ...rest
}: PrimaryButtonProps) {
  const isInactive = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isInactive && styles.buttonDisabled,
        style,
      ]}
      disabled={isInactive}
      onPress={onPress}
      activeOpacity={0.85}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={Colors.White} size="small" />
      ) : (
        <>
          {icon ? <>{icon}</> : null}
          <Text
            style={[
              styles.buttonText,
              icon ? { marginLeft: Spacing.sm } : undefined,
              isInactive && styles.buttonTextDisabled,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.WinePrimary,
    borderRadius: BorderRadius.pill,
    height: 50,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.primary,
  },
  buttonDisabled: {
    backgroundColor: Colors.Gray300,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: Colors.White,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    letterSpacing: 0.2,
  },
  buttonTextDisabled: {
    color: Colors.Gray500,
  },
});
