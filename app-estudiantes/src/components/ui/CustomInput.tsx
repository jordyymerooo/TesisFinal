import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, BorderRadius, Typography, Spacing } from '../../theme/theme';

interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export function CustomInput({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  onFocus,
  onBlur,
  ...rest
}: CustomInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View
        style={[
          styles.inputContainer,
          rest.multiline && styles.inputContainerMultiline,
          isFocused && styles.inputContainerFocused,
          error ? styles.inputContainerError : undefined,
        ]}
      >
        {leftIcon ? <View style={styles.leftIconWrapper}>{leftIcon}</View> : null}

        <TextInput
          style={[styles.input, inputStyle]}
          placeholderTextColor={Colors.Gray400}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />

        {rightIcon ? <View style={styles.rightIconWrapper}>{rightIcon}</View> : null}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.Gray700,
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1.5,
    borderColor: Colors.Gray200,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.White,
    paddingHorizontal: Spacing.md,
  },
  inputContainerMultiline: {
    height: undefined,
    minHeight: 100,
    alignItems: 'flex-start',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  inputContainerFocused: {
    borderColor: Colors.WinePrimary,
    backgroundColor: '#FFFDFD',
  },
  inputContainerError: {
    borderColor: Colors.Error,
    backgroundColor: Colors.ErrorLight,
  },
  leftIconWrapper: {
    marginRight: Spacing.sm,
  },
  rightIconWrapper: {
    marginLeft: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.size.base,
    color: Colors.Gray900,
    paddingVertical: Spacing.xs,
  },
  errorText: {
    fontSize: Typography.size.xs,
    color: Colors.Error,
    marginTop: Spacing.xs,
    fontWeight: Typography.weight.medium,
  },
});
