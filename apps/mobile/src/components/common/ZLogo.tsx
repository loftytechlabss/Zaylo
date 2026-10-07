import React from 'react';
import { Image, ImageStyle, StyleProp, View, ViewStyle, StyleSheet } from 'react-native';

export interface ZLogoProps {
  size?: number;
  tintColor?: string;
  variant?: 'dark' | 'blue' | 'white' | 'auto';
  withContainer?: boolean;
  containerBg?: string;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export const ZLogo: React.FC<ZLogoProps> = ({
  size = 28,
  tintColor,
  variant = 'dark',
  withContainer = false,
  containerBg = '#f1f5f9',
  style,
  containerStyle,
}) => {
  let source = require('../../../assets/logo-dark.png');
  if (variant === 'blue') {
    source = require('../../../assets/logo-blue.png');
  } else if (variant === 'white') {
    source = require('../../../assets/logo-white.png');
  }

  const imageElement = (
    <Image
      source={source}
      style={[
        {
          width: size,
          height: size,
          resizeMode: 'contain',
        },
        tintColor ? { tintColor } : null,
        style,
      ]}
    />
  );

  if (withContainer) {
    const containerSize = size * 1.45;
    return (
      <View
        style={[
          styles.container,
          {
            width: containerSize,
            height: containerSize,
            borderRadius: containerSize * 0.28,
            backgroundColor: containerBg,
          },
          containerStyle,
        ]}
      >
        {imageElement}
      </View>
    );
  }

  return imageElement;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
