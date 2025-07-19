import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export default function AuthHeader({ title, subtitle }) {
  return (
    <View style={styles.wrapper}>
      <Image
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1077/1077012.png' }}
        style={styles.icon}
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', marginBottom: 30 },
  icon: { width: 80, height: 80, marginBottom: 10 },
  title: { fontSize: 26, fontWeight: '600', color: COLORS.darkText },
  subtitle: { fontSize: 14, color: COLORS.grayText },
});
