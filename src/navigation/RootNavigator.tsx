import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { TabNavigator } from '@/navigation/TabNavigator';
import { ChatScreen } from '@/screens/ChatScreen';
import { RootStackParamList } from '@/types/navigation';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
};
