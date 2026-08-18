import { useEffect, useRef, useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Animated, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { METRO, TILE_DIMENSIONS, TileSize } from '../theme';

// A genuine Metro/Live Tile. Real, copyright-free Unsplash photos
// sit as a subtle, semi-transparent background directly behind the
// existing tile content (icon, live count, label) — the real
// function of each tile stays exactly as it was, the photo is a
// backdrop, not a replacement.

interface Props {
  label: string;
  icon?: string;
  accent: string;
  size?: TileSize;
  count?: number | string;
  backLabel?: string;
  backgroundImage?: string;
  flipDelay?: number;
  onPress: () => void;
}

export default function MetroTile({ label, icon, accent, size = 'medium', count, backLabel, backgroundImage, flipDelay = 0, onPress }: Props) {
  const dim = TILE_DIMENSIONS[size];
  const isLarge = size === 'large' || size === 'wide';
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [showingBack, setShowingBack] = useState(false);
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!backLabel) return;
    const interval = setInterval(() => {
      Animated.timing(flipAnim, { toValue: showingBack ? 0 : 1, duration: 500, useNativeDriver: true }).start();
      setShowingBack((prev) => !prev);
    }, 4000 + flipDelay);
    return () => clearInterval(interval);
  }, [showingBack, backLabel, flipDelay]);

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  const frontOpacity = flipAnim.interpolate({ inputRange: [0, 0.5, 0.5, 1], outputRange: [1, 0, 0, 0] });
  const backOpacity = flipAnim.interpolate({ inputRange: [0, 0.5, 0.5, 1], outputRange: [0, 0, 0, 1] });

  const onPressIn = () => Animated.spring(pressAnim, { toValue: 0.94, useNativeDriver: true, speed: 40 }).start();
  const onPressOut = () => Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true, speed: 40 }).start();

  const FrontContent = () => (
    <>
      {/* Real semi-transparent photo backdrop, blended with the accent color */}
      {backgroundImage && (
        <ImageBackground
          source={{ uri: backgroundImage }}
          style={StyleSheet.absoluteFill}
          imageStyle={{ opacity: 0.35 }}
          resizeMode="cover"
        />
      )}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: accent, opacity: backgroundImage ? 0.72 : 1 }]} />
      <LinearGradient colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0)']} start={{ x: 0, y: 0 }} end={{ x: 0.6, y: 0.6 }} style={StyleSheet.absoluteFill} />
      {icon && <Text style={[styles.icon, { fontSize: isLarge ? 40 : 26 }]}>{icon}</Text>}
      {count !== undefined && <Text style={[styles.count, { fontSize: isLarge ? METRO.fontSizes.tileNumber : 22 }]}>{count}</Text>}
      <Text style={[styles.label, { fontSize: isLarge ? 17 : METRO.fontSizes.tileLabel }]} numberOfLines={2}>{label}</Text>
    </>
  );

  return (
    <TouchableOpacity activeOpacity={1} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={{ marginRight: METRO.spacing.sm, marginBottom: METRO.spacing.sm }}>
      <Animated.View style={[styles.wrapper, { width: dim.width, height: dim.height, transform: [{ scale: pressAnim }] }]}>
        <Animated.View style={[styles.face, { opacity: frontOpacity, transform: [{ rotateY: frontRotate }] }]}>
          <FrontContent />
        </Animated.View>

        {backLabel && (
          <Animated.View style={[styles.face, styles.backFace, { backgroundColor: accent, opacity: backOpacity, transform: [{ rotateY: backRotate }] }]}>
            <LinearGradient colors={['rgba(0,0,0,0.12)', 'rgba(0,0,0,0)']} start={{ x: 0, y: 0 }} end={{ x: 0.6, y: 0.6 }} style={StyleSheet.absoluteFill} />
            <Text style={[styles.backText, { fontSize: isLarge ? 16 : 12 }]} numberOfLines={3}>{backLabel}</Text>
          </Animated.View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'relative' },
  face: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 0, padding: 12, justifyContent: 'flex-end', overflow: 'hidden', backfaceVisibility: 'hidden' },
  backFace: { justifyContent: 'center', alignItems: 'center' },
  icon: { position: 'absolute', top: 12, left: 12, color: 'rgba(255,255,255,0.95)', zIndex: 2 },
  count: { color: '#FFFFFF', fontWeight: '800', marginBottom: 2, zIndex: 2, textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  label: { color: '#FFFFFF', fontWeight: '800', letterSpacing: 0.2, zIndex: 2, textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  backText: { color: '#FFFFFF', fontWeight: '700', lineHeight: 18, textAlign: 'center' },
});
