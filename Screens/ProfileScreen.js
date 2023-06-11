import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';

export default function ProfileScreen() {
  const navigation = useNavigation();

  const handleLogOut = async () => {
    try {
      await auth().signOut();
      navigation.navigate('Login');
      console.log('User signed out!');
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity>
        <Image
          source={require('../assets/profile-pic-1.jpg')}
          style={{borderRadius: 100, width: 150, height: 150, margin: 20}}
        />
      </TouchableOpacity>
      <View style={styles.profileSection}>
        <Text style={styles.profileLabel}>User Name:</Text>
        <Text style={styles.profileValue}>
          {auth().currentUser?.displayName}
        </Text>
      </View>
      <View style={styles.profileSection}>
        <Text style={styles.profileLabel}>Email: </Text>
        <Text style={styles.profileValue}>{auth().currentUser?.email}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogOut}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4E6E81',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  profileSection: {
    flexDirection: 'row',
    marginVertical: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  profileLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  profileValue: {
    fontSize: 18,
    color: 'white',
  },
  logoutButton: {
    marginTop: 24,
    backgroundColor: '#0B2447',
    padding: 15,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  editProfileText: {
    fontSize: 20,
    backgroundColor: 'green',
    margin: 10,
    padding: 10,
    color: 'white',
    borderRadius: 10,
  },
});
