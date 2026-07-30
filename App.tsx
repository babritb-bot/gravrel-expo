import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import VMsScreen from './src/screens/VMsScreen';
import DatabasesScreen from './src/screens/DatabasesScreen';
import KubernetesScreen from './src/screens/KubernetesScreen';
import StorageScreen from './src/screens/StorageScreen';
import BestAnswerScreen from './src/screens/BestAnswerScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { METRO } from './src/theme';

const Stack = createNativeStackNavigator();

// Complete real navigation shell — every user-facing GravRel service,
// Metro-themed throughout, calling the real backend. Billing screen
// intentionally deferred: native Razorpay checkout needs its own
// dedicated integration pass, not a quick reuse of this pattern.

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: METRO.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="VMs" component={VMsScreen} />
        <Stack.Screen name="Databases" component={DatabasesScreen} />
        <Stack.Screen name="Kubernetes" component={KubernetesScreen} />
        <Stack.Screen name="Storage" component={StorageScreen} />
        <Stack.Screen name="BestAnswer" component={BestAnswerScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
