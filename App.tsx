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
import {
  TerminalScreen, BillingScreen, HelpScreen,
  ReferralsScreen, StudentScreen, SupportScreen,
  VoiceAgentScreen, PlatformPulseScreen,
} from './src/screens/WebScreens';
import { METRO } from './src/theme';

const Stack = createNativeStackNavigator();

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
        <Stack.Screen name="Terminal" component={TerminalScreen} />
        <Stack.Screen name="Billing" component={BillingScreen} />
        <Stack.Screen name="Help" component={HelpScreen} />
        <Stack.Screen name="Referrals" component={ReferralsScreen} />
        <Stack.Screen name="Student" component={StudentScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
        <Stack.Screen name="VoiceAgent" component={VoiceAgentScreen} />
        <Stack.Screen name="PlatformPulse" component={PlatformPulseScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
