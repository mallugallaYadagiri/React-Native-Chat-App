import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginPage from './Screens/LoginScreen';
import HomeScreen from './Screens/HomeScreen';
import ChatScreen from './Screens/ChatScreen';
import ProfileScreen from './Screens/ProfileScreen';
import SignupScreen from './Screens/SignupScreen';
import EditProfileScreen from './Screens/EditProfileScreen';
import UserScreen from './Screens/UsersScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerTitleAlign: 'center',
          headerStyle: {backgroundColor: '#245953'},
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            textAlign: 'center',
          },
        }}>
        <Stack.Screen name="SignUp" component={SignupScreen} />
        <Stack.Screen
          options={{headerShown: false}}
          name="Login"
          component={LoginPage}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="HomePage"
          component={HomeScreen}
        />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Users" component={UserScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
