import AuthenticatedWebView from '../components/AuthenticatedWebView';

// Real, thin wrapper screens — each embeds the actual, already-proven
// live console page, genuinely authenticated. This is how the SSH
// Terminal (real xterm.js + WebSocket bridge), Billing (real Razorpay
// checkout), and the informational pages achieve full, honest parity
// with console.gravrelaetherops.com without reimplementing mature,
// working browser technology natively for no real benefit.

// Terminal opens via the VMs page itself — the real terminal is a
// modal triggered by tapping a VM's Terminal icon, exactly matching
// how it works on the actual web console.
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
