// import React, {useState} from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   TouchableOpacity,
// } from 'react-native';
// import auth from '@react-native-firebase/auth';
// import {useNavigation} from '@react-navigation/native';

// export default function LoginPage() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [emailError, setEmailError] = useState('');
//   const [passwordError, setPasswordError] = useState('');

//   const navigation = useNavigation();

//   const handleLogin = async () => {
//     setEmailError('');
//     setPasswordError('');

//     if (!email) {
//       setEmailError('Please enter an email.');
//     } else if (!/^\S+@\S+\.\S+$/.test(email)) {
//       setEmailError('Please enter a valid email address.');
//     }

//     if (!password) {
//       setPasswordError('Please enter a password.');
//     }
//     if (!email || !password) {
//       return;
//     }

//     try {
//       const userCredential = await auth().signInWithEmailAndPassword(
//         email,
//         password,
//       );

//       // Clear email and password fields
//       setEmail('');
//       setPassword('');

//       navigation.navigate('HomePage');
//     } catch (error) {
//       if (
//         error.code === 'auth/user-not-found' ||
//         error.code === 'auth/wrong-password'
//       ) {
//         setPasswordError(
//           'Invalid credentials. \n Please check your email and password.',
//         );
//       } else {
//         setPasswordError(error.message);
//       }
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={{fontSize: 25, textAlign: 'center'}}>Welcome</Text>
//       <View>
//         <TextInput
//           style={styles.inputField}
//           placeholder="Enter email"
//           autoCapitalize="none"
//           keyboardType="email-address"
//           value={email}
//           onChangeText={text => setEmail(text)}
//         />
//         {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
//       </View>
//       <View>
//         <TextInput
//           style={styles.inputField}
//           placeholder="Password"
//           autoCapitalize="none"
//           autoCorrect={false}
//           secureTextEntry={true}
//           textContentType="password"
//           value={password}
//           onChangeText={text => setPassword(text)}
//         />
//         {passwordError ? (
//           <Text style={styles.errorText}>{passwordError}</Text>
//         ) : null}
//       </View>
//       <TouchableOpacity style={styles.logBtn} onPress={handleLogin}>
//         <Text style={styles.loginText}>Login</Text>
//       </TouchableOpacity>
//       <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
//         <Text style={styles.highlightedText}>
//           New here, please <Text style={styles.linkText}>Sign Up</Text>
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// }
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {useNavigation, CommonActions} from '@react-navigation/native';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const navigation = useNavigation();

  useEffect(() => {
    // Check if the user is already authenticated
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        // User is authenticated, navigate to the Home page
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: 'HomePage'}],
          }),
        );
      }
    });

    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, [navigation]);

  const handleLogin = async () => {
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError('Please enter an email.');
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError('Please enter a valid email address.');
    }

    if (!password) {
      setPasswordError('Please enter a password.');
    }
    if (!email || !password) {
      return;
    }

    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password,
      );

      // Clear email and password fields
      setEmail('');
      setPassword('');

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: 'HomePage'}],
        }),
      );
    } catch (error) {
      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password'
      ) {
        setPasswordError(
          'Invalid credentials. \n Please check your email and password.',
        );
      } else {
        setPasswordError(error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={{fontSize: 25, textAlign: 'center'}}>Welcome</Text>
      <View>
        <TextInput
          style={styles.inputField}
          placeholder="Enter email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={text => setEmail(text)}
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
      </View>
      <View>
        <TextInput
          style={styles.inputField}
          placeholder="Password"
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
      </View>
      <TouchableOpacity style={styles.logBtn} onPress={handleLogin}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.highlightedText}>
          New here, please <Text style={styles.linkText}>Sign Up</Text>
        </Text>
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
  flex: {
    display: 'flex',
    flexDirection: 'row',
  },
  btgContainer: {
    marginTop: 20,
    margin: 20,
    justifyContent: 'space-around',
  },
  logBtn: {
    backgroundColor: '#0B2447',
    padding: 10,
    borderRadius: 10,
    width: 160,
    height: 50,
  },
  signBtn: {
    backgroundColor: '#0B2447',
    padding: 10,
    borderRadius: 10,
    width: 160,
    height: 50,
  },
  passForgot: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 60,
  },
  highlightedText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 30,
  },
  linkText: {
    color: 'blue',
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
