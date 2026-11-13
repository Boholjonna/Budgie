import { Tabs } from 'expo-router';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { router } from 'expo-router';

function AddButton() {
  return (
    <TouchableOpacity
      style={styles.addBtn}
      onPress={() => router.push('/add-expense')}
      activeOpacity={0.85}
    >
      <Ionicons name="add" size={30} color="#fff" />
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown:          false,
        tabBarActiveTintColor: Colors.primary,
        tabBarStyle: {
          backgroundColor:  '#e6e2ff',
          borderTopColor:   Colors.border,
          height:           68,
          paddingBottom:    100,
          paddingTop:       10,
        },
        tabBarLabelStyle: {
          fontSize:   11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-placeholder"
        options={{
          title: '',
          tabBarButton: () => (
            <View style={styles.addWrapper}>
              <AddButton />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color as string} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  addWrapper: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
  },
  addBtn: {
    width:           55,
    height:          55,
    borderRadius:    31,
    backgroundColor: Colors.primary,
    alignItems:      'center',
    justifyContent:  'center',
    shadowColor:     Colors.primary,
    shadowOpacity:   0.5,
    shadowRadius:    16,
    shadowOffset:    { width: 0, height: 6 },
    elevation:       10,
  },
});
