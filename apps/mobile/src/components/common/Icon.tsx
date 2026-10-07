import React from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export type IconType = 'feather' | 'ionicons' | 'mci';

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
  type?: IconType;
  style?: StyleProp<ViewStyle>;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  color = '#ffffff',
  type = 'feather',
  style,
}) => {
  if (type === 'ionicons') {
    return <Ionicons name={name as any} size={size} color={color} style={style as any} />;
  }
  if (type === 'mci') {
    return <MaterialCommunityIcons name={name as any} size={size} color={color} style={style as any} />;
  }
  return <Feather name={name as any} size={size} color={color} style={style as any} />;
};
