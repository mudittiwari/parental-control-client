import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export default function AuthHeader({ title, subtitle }) {
  return (
    <View style={styles.wrapper}>
      <Image
        source={require('../../assets/images/icon.png')}
        style={styles.icon}
      />

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', marginBottom: 30 },
  icon: { width: 350, height: 150, marginBottom: 10 },
  title: { fontSize: 26, fontWeight: '600', color: COLORS.darkText },
  subtitle: { fontSize: 14, color: COLORS.grayText },
});
