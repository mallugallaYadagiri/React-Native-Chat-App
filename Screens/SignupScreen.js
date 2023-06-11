import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {useNavigation} from '@react-navigation/native';

export default function SignupPage() {
  //States for setting up name, email, password, confirm password
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  //States for setting up errors with name, email, password, confirm password
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [message, setMessage] = useState('');

  const navigation = useNavigation();

  const handleSignup = async () => {
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    if (!name) {
      setNameError('Please enter the Name');
    }

    if (!email) {
      setEmailError('Please enter the Email');
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError('Please enter a valid email address.');
    }

    if (!password) {
      setPasswordError('Please enter the password');
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm the password');
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
    }

    if (!name || !email || !password || !confirmPassword) {
      return;
    }

    try {
      const {user} = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );

      await user.updateProfile({displayName: name});
      console.log(user);
      const userRef = firestore().collection('users').doc(user.uid);
      await userRef.set({
        email: email,
        displayName: name,
        uid: user.uid,
      });

      Alert.alert('Sign up successful', `Welcome ${name}!`);
      navigation.navigate('HomePage');
    } catch (err) {
      console.log(err);
      setMessage(
        `The email address is already in use by another account.

        Please login/use another Email`,
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={{fontSize: 20, textAlign: 'center', marginBottom: 10}}>
        Please Enter the below Details
      </Text>

      <View>
        <TextInput
          style={styles.inputField}
          placeholder="Name"
          value={name}
          onChangeText={text => setName(text)}
        />
        {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
        <TextInput
          style={styles.inputField}
          placeholder="Email"
          autoCapitalize="words"
          keyboardType="email-address"
          value={email}
          onChangeText={text => setEmail(text)}
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        <TextInput
          style={styles.inputField}
          placeholder="Create Password"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={true}
          textContentType="password"
          value={password}
          onChangeText={text => setPassword(text)}
        />
        {passwordError ? (
          <Text style={styles.errorText}>{passwordError}</Text>
        ) : null}
        <TextInput
          style={styles.inputField}
          placeholder="Re-Enter Password"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={true}
          textContentType="password"
          value={confirmPassword}
          onChangeText={text => setConfirmPassword(text)}
        />
        {confirmPasswordError ? (
          <Text style={styles.errorText}>{confirmPasswordError}</Text>
        ) : null}
      </View>
      <Text style={styles.errorText}>{message}</Text>
      <TouchableOpacity style={styles.signBtn} onPress={handleSignup}>
        <Text style={styles.loginText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#569DAA',
    height: '100%',
  },

  inputField: {
    width: 350,
    height: 50,
    fontSize: 20,
    borderWidth: 1,
    borderColor: 'white',
    backgroundColor: '#F6F1F1',
    color: 'black',
    borderRadius: 10,
    margin: 10,
    marginBottom: 20,
    padding: 10,
  },

  loginText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 20,
  },

  signBtn: {
    backgroundColor: '#0B2447',
    padding: 10,
    borderRadius: 10,
    marginVertical: 20,
    width: 160,
    height: 50,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#40513B',
    marginTop: -10,
    marginBottom: 8,
    paddingHorizontal: 10,
  },
});
