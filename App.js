import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

import { AppProvider } from './contexts/AppContext';
import CaptureScreen from './screens/CaptureScreen';
import ArchiveScreen from './screens/ArchiveScreen';

const Tab = createBottomTabNavigator();

function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === '数据录入') {
            iconName = focused ? 'add-box' : 'add-circle-outline';
          } else if (route.name === '数据管理') {
            iconName = focused ? 'inventory' : 'list-alt';
          }
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
            backgroundColor: '#F9F9F9',
            borderBottomWidth: 1,
            borderBottomColor: '#E0E0E0',
        },
        headerTitleStyle: {
            fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="数据录入" component={CaptureScreen} />
      <Tab.Screen name="数据管理" component={ArchiveScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AppProvider>
  );
}
