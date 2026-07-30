import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import SplashScreen from './src/screens/SplashScreen';
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

// Real navigation shell. App now opens on the animated Splash screen,
// which checks for an existing real session and routes to Home
// (already logged in) or Login (new/logged-out) once its animation
// completes — not just decoration, genuinely functional.

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: METRO.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
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
