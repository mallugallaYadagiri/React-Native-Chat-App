import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React, {useEffect} from 'react';
import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function Home() {
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
  const handleProfile = () => {
    navigation.navigate('Profile');
  };

  const handleChat = () => {
    navigation.navigate('Users');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.homeText}>Home Screen</Text>
      <Text style={styles.welcomeText}>Welcome</Text>
      <Text style={styles.userEmail}>{auth().currentUser?.displayName}</Text>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomBarButton} onPress={handleChat}>
          <Icon name="comments" size={40} color="#fff" light />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleProfile}>
          <Icon name="user" size={40} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBarButton} onPress={handleLogOut}>
          {/* <Text style={styles.loginText}>Log Out</Text> */}
          <Icon name="sign-out" size={40} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0E8388',
  },
  homeText: {
    fontSize: 20,
    marginBottom: 20,
    color: 'white',
  },
  welcomeText: {
    fontSize: 18,
    marginBottom: 20,
    color: 'white',
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 20,
    color: 'white',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2E4F4F',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  bottomBarButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    color: 'white',
    fontSize: 20,
  },
});
