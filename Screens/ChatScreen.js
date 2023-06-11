import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Text,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import auth from '@react-native-firebase/auth';
import {firebase} from '@react-native-firebase/firestore';
import {launchImageLibrary} from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import {useRoute, useNavigation} from '@react-navigation/native';

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [textMessage, setTextMessage] = useState('');
  const [user, setUser] = useState(null);
  const [image, setImage] = useState(null);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState(null);
  const {selectedUser} = useRoute().params;
  const navigation = useNavigation();

  const chatId = [auth().currentUser.uid, selectedUser.id].sort().join(':');

  //Listener for changes in the messages collection in firestore
  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .onSnapshot(querySnapshot => {
        const messagesArray = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          const message = {
            _id: doc.id,
            text: data.text,
            user: {
              _id: data.sender,
              name: data.senderName,
            },
            createdAt: data.createdAt.toDate(),
            image: data.image || null,
          };
          messagesArray.push(message);
        });
        setMessages(messagesArray); //it will set the messages to render in Flat list
      });

    return () => {
      unsubscribe();
    };
  }, []);

  //For chaning title of header into the Selected User name in chat list
  useEffect(() => {
    navigation.setOptions({
      title: selectedUser.name,
      headerTitleAlign: 'center',
    });
  }, [selectedUser]);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        setUser({
          _id: user.uid,
          name: user.displayName,
          avatar: user.photoURL,
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  //async function to handle image uploads to the firebase storage
  const uploadImage = async uri => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileName = `${Date.now()}-${blob._data.name}`;
    const ref = storage().ref().child(`images/${fileName}`);
    await ref.put(blob);
    const downloadUrl = await ref.getDownloadURL();
    return downloadUrl;
  };

  //async function to handle the image upload from the gallery
  const handleImageUpload = async () => {
    let options = {mediaType: 'photo'};
    const result = await launchImageLibrary(options);
    if (!result.didCancel) {
      setImage(result.assets[0].uri);
      setSelectedImagePreview(result.assets[0].uri);
    }
  };

  const sendMessage = async () => {
    if (textMessage.trim() === '') {
      return;
    }
    const currentTime = new Date();
    const newMessage = {
      text: textMessage,
      sender: user._id,
      senderName: user.name,
      createdAt: firebase.firestore.Timestamp.fromDate(currentTime),
      image: image,
    };

    //for checking if the image is attached
    if (image) {
      const downloadUrl = await uploadImage(image);
      newMessage.image = downloadUrl;
      setSelectedImagePreview(null);
      setImage(null);
    }

    //For saving the message to the firestore
    firebase
      .firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .add(newMessage);

    setTextMessage(''); //Clears text input after sending
  };

  const renderMessage = ({item}) => {
    const isSender = item.user._id === user._id;

    const messageContainerStyle = isSender
      ? styles.senderMessageContainer
      : styles.receiverMessageContainer;

    const messageTimeContainerStyle = {
      alignSelf: isSender ? 'flex-end' : 'flex-start',
    };

    const handleImageClick = () => {
      setSelectedImage(item.image);
      setIsImageModalVisible(true);
    };

    //For showing the time HH:MM only
    const messageTime = item.createdAt.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata',
    });

    return (
      <View style={[styles.messageContainer, messageContainerStyle]}>
        {item.image && (
          <TouchableOpacity onPress={handleImageClick}>
            <Image style={styles.imageMessage} source={{uri: item.image}} />
          </TouchableOpacity>
        )}
        <Text style={styles.messageText}>{item.text}</Text>
        <View style={messageTimeContainerStyle}>
          <Text style={styles.messageTime}>{messageTime}</Text>
        </View>
      </View>
    );
  };

  const handleCloseImageModal = () => {
    setSelectedImage(null);
    setIsImageModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.contentContainer}
        inverted
      />
      <View style={styles.imagePreviewContainer}>
        {selectedImagePreview && (
          <>
            <Image
              source={{uri: selectedImagePreview}}
              style={styles.imagePreview}
            />
            <TouchableOpacity
              style={styles.cancelIcon}
              onPress={() => {
                setSelectedImagePreview(null);
                setImage(null);
              }}>
              <Icon name="times" size={20} color="#fff" />
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={textMessage}
          onChangeText={setTextMessage}
          multiline
        />
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={handleImageUpload}>
          <Icon name="camera" size={25} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Icon name="send" size={25} color="#fff" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isImageModalVisible}
        transparent={true}
        onRequestClose={handleCloseImageModal}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeIconContainer}
            onPress={handleCloseImageModal}>
            <Icon name="times" size={25} color="#fff" />
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{uri: selectedImage}}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#577D86',
  },
  contentContainer: {
    padding: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingLeft: 5,
  },
  cameraButton: {
    marginHorizontal: 6,
  },
  sendButton: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 20,
    maxHeight: 100,
    color: 'black',
    fontSize: 16,
  },
  messageContainer: {
    alignSelf: 'flex-start',
    maxWidth: '70%',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 5,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 10,
  },

  senderMessageContainer: {
    alignSelf: 'flex-end',
    // backgroundColor: '#008aff',
    backgroundColor: '#0B2447',
    padding: 10,
    borderRadius: 10,
    marginVertical: 2,
  },

  receiverMessageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#0B2447',
    padding: 10,
    borderRadius: 10,
    marginVertical: 2,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  imageMessage: {
    width: 150,
    height: 180,
    borderRadius: 10,
    resizeMode: 'stretch',
    marginBottom: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  closeIconContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  modalImage: {
    width: '95%',
    height: '95%',
    resizeMode: 'contain',
  },
  messageTime: {
    color: '#ccc',
    fontSize: 10,
    marginTop: 2,
  },
  imagePreviewContainer: {
    backgroundColor: 'gray',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: '10%',
    borderRadius: 10,
  },
  imagePreview: {
    width: 250,
    height: 200,
    margin: 5,
    resizeMode: 'stretch',
    borderRadius: 10,
  },
  cancelIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 5,
  },
});
