import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DashboardScreen from './src/screens/DashboardScreen';
import MealLogScreen from './src/screens/MealLogScreen';
import MealDetailScreen from './src/screens/MealDetailScreen';
import ActivityScreen from './src/screens/ActivityScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { colors } from './src/theme';

const Tab = createBottomTabNavigator();
const MealStack = createNativeStackNavigator();

// The meal log is the only area with a second level, so it is the only
// tab that gets a stack.
function MealStackNavigator() {
  return (
    <MealStack.Navigator screenOptions={header}>
      <MealStack.Screen name="MealLog" component={MealLogScreen} options={{ title: 'Meals' }} />
      <MealStack.Screen
        name="MealDetail"
        component={MealDetailScreen}
        options={({ route }) => ({
          title: route.params && route.params.meal ? 'Edit meal' : 'Add meal',
        })}
      />
    </MealStack.Navigator>
  );
}

const header = {
  headerStyle: { backgroundColor: colors.card },
  headerTitleStyle: { color: colors.text, fontSize: 16 },
  headerTintColor: colors.accent,
};

const ICONS = { Dashboard: '◆', Meals: '▤', Activity: '▲', Settings: '⚙' };

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          ...header,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 16 }}>{ICONS[route.name]}</Text>
          ),
        })}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ headerTitle: 'Health Track' }}
        />
        <Tab.Screen name="Meals" component={MealStackNavigator} options={{ headerShown: false }} />
        <Tab.Screen name="Activity" component={ActivityScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
