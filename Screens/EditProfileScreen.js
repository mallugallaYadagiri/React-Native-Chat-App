import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import {launchImageLibrary} from 'react-native-image-picker';
import {useNavigation} from '@react-navigation/native';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const [displayName, setDisplayName] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    setDisplayName(auth().currentUser.displayName);
  }, []);

  const handleSaveChanges = async () => {
    try {
      await auth().currentUser.updateProfile({
        displayName,
      });
      console.log('User profile updated!');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  const handleChooseProfilePicture = () => {
    const options = {
      mediaType: 'photo',
    };
    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        setProfilePicture(null); // Set profilePicture to null
      } else if (response.errorCode) {
        console.error(response.errorMessage);
      } else {
        setProfilePicture(response);
      }
    });
  };
  const handleUploadProfilePicture = async () => {
    if (!profilePicture || !profilePicture.uri) {
      return;
    }

    const storageRef = storage().ref(
      `profilePictures/${auth().currentUser.uid}`,
    );
    console.log('Storage reference:', storageRef);

    const response = await fetch(profilePicture.uri);
    const blob = await response.blob();

    const task = storageRef.put(blob);
    console.log('Upload task:', task);

    task.on(
      'state_changed',
      snapshot => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        // Update the UI with the current upload progress
      },
      error => {
        console.log(error);
        throw error;
      },
      async () => {
        const url = await storageRef.getDownloadURL();
        console.log('Download URL:', url);
        await auth().currentUser.updateProfile({
          photoURL: url,
        });
        console.log('User profile picture updated!');
        navigation.goBack();
      },
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>
      <TouchableOpacity onPress={handleChooseProfilePicture}>
        {profilePicture && profilePicture.uri ? (
          <Image
            source={{uri: profilePicture.uri}}
            style={styles.profilePicture}
          />
        ) : (
          <Image
            source={{
              uri: auth().currentUser.photoURL
                ? auth().currentUser.photoURL
                : 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50',
            }}
            style={styles.profilePicture}
            defaultSource={require('../assets/profile-pic-1.jpg')} // add a default profile picture
          />
        )}
        <Text style={styles.uploadProfilePicture}>Upload Profile Picture</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.displayNameInput}
        placeholder="Display Name"
        value={displayName}
        onChangeText={text => setDisplayName(text)}
      />
      <TouchableOpacity
        style={styles.saveChangesButton}
        onPress={handleSaveChanges}>
        <Text style={styles.saveChangesButtonText}>Save Changes</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={handleUploadProfilePicture}>
        <Text style={styles.uploadButtonText}>Upload Picture</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  profilePicture: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  uploadProfilePicture: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  displayNameInput: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginVertical: 20,
    width: '100%',
  },
  saveChangesButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  saveChangesButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: 'gray',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
