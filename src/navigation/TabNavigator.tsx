import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { DiscoverScreen } from '@/screens/DiscoverScreen';
import { LikesScreen } from '@/screens/LikesScreen';
import { MessagesScreen } from '@/screens/MessagesScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { colors } from '@/theme';

const Tab = createBottomTabNavigator();

type IconProps = { color: string };

const DiscoverIcon = ({ color }: IconProps) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx={11} cy={11} r={7} />
    <Line x1={21} y1={21} x2={16.65} y2={16.65} />
  </Svg>
);

const HeartIcon = ({ color }: IconProps) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </Svg>
);

const MessageIcon = ({ color }: IconProps) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </Svg>
);

const ProfileIcon = ({ color }: IconProps) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <Circle cx={12} cy={7} r={4} />
  </Svg>
);

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgBase,
          borderTopColor: colors.borderSoft,
          borderTopWidth: 1,
          height: 74,
          paddingBottom: 14,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.white,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: {
          fontSize: 9,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          fontWeight: '500',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{ tabBarIcon: DiscoverIcon }}
      />
      <Tab.Screen
        name="Likes"
        component={LikesScreen}
        options={{ tabBarIcon: HeartIcon }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{ tabBarIcon: MessageIcon }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ProfileIcon }}
      />
    </Tab.Navigator>
  );
};
