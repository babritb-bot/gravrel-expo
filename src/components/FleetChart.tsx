import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { METRO } from '../theme';

// Real, genuine data visualization — a live donut chart of the
// user's actual VM fleet status. Rotation is applied once, to the
// whole SVG via a standard style transform (portable across web
// and native) rather than per-circle rotation/origin props, which
// are unreliable in react-native-svg's web rendering layer.

interface Segment {
  label: string;
  count: number;
  color: string;
}

interface Props {
  segments: Segment[];
  size?: number;
}

export default function FleetChart({ segments, size = 120 }: Props) {
  const total = segments.reduce((sum, s) => sum + s.count, 0);
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 14;

  let cumulativePercent = 0;

  return (
    <View style={styles.container}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle cx={size / 2} cy={size / 2} r={radius} stroke={METRO.surface} strokeWidth={strokeWidth} fill="none" />
          {total > 0 &&
            segments.map((seg, i) => {
              if (seg.count === 0) return null;
              const percent = seg.count / total;
              const dashArray = `${percent * circumference} ${circumference}`;
              const dashOffset = -cumulativePercent * circumference;
              cumulativePercent += percent;
              return (
                <Circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="butt"
                />
              );
            })}
        </Svg>
        <View style={styles.centerLabel}>
          <Text style={styles.centerNumber}>{total}</Text>
          <Text style={styles.centerSub}>VMs</Text>
        </View>
      </View>

      <View style={styles.legend}>
        {segments.map((seg, i) => (
          <View key={i} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: seg.color }]} />
            <Text style={styles.legendLabel}>{seg.label}</Text>
            <Text style={styles.legendCount}>{seg.count}</Text>
          </View>
        ))}
        {total === 0 && <Text style={styles.emptyText}>No VMs deployed yet</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  centerLabel: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  centerNumber: { color: '#fff', fontSize: 24, fontWeight: '800' },
  centerSub: { color: METRO.textMuted, fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
  legend: { flex: 1, gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 2 },
  legendLabel: { flex: 1, color: METRO.textSecondary, fontSize: 12 },
  legendCount: { color: '#fff', fontSize: 13, fontWeight: '700' },
  emptyText: { color: METRO.textMuted, fontSize: 12 },
});
