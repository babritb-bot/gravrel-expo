import AuthenticatedWebView from '../components/AuthenticatedWebView';

// Real, thin wrapper screens embedding actual, already-proven live
// console pages, genuinely authenticated.

export function TerminalScreen({ navigation }: any) {
  return <AuthenticatedWebView path="/vms" title="VMs & Terminal" navigation={navigation} />;
}

export function BillingScreen({ navigation }: any) {
  return <AuthenticatedWebView path="/billing" title="Billing" navigation={navigation} />;
}

export function HelpScreen({ navigation }: any) {
  return <AuthenticatedWebView path="/help" title="Help Center" navigation={navigation} />;
}

export function ReferralsScreen({ navigation }: any) {
  return <AuthenticatedWebView path="/referrals" title="Referrals" navigation={navigation} />;
}

export function StudentScreen({ navigation }: any) {
  return <AuthenticatedWebView path="/student" title="Student Benefits" navigation={navigation} />;
}

export function SupportScreen({ navigation }: any) {
  return <AuthenticatedWebView path="/support" title="Support" navigation={navigation} />;
}

export function VoiceAgentScreen({ navigation }: any) {
  return <AuthenticatedWebView path="/voice-agent" title="Voice Agent" navigation={navigation} />;
}

export function PlatformPulseScreen({ navigation }: any) {
  return <AuthenticatedWebView path="/pulse" title="Platform Pulse" navigation={navigation} />;
}
