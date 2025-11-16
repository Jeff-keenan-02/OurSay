// src/navigation/DiscussionsNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DiscussionsListScreen from '../screens/DiscussionsListScreen';
import DiscussionDetailScreen from '../screens/DiscussionDetailScreen';

export type DiscussionsStackParamList = {
  DiscussionsList: undefined;
  DiscussionDetail: { id: number; title: string };
};

const Stack = createNativeStackNavigator<DiscussionsStackParamList>();

export default function DiscussionsNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DiscussionsList"
        component={DiscussionsListScreen}
        options={{ title: 'Discussions' }}
      />
      <Stack.Screen
        name="DiscussionDetail"
        component={DiscussionDetailScreen}
        options={({ route }) => ({ title: route.params.title })}
      />
    </Stack.Navigator>
  );
}