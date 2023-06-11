// import React, {useState, useEffect} from 'react';
// import {
//   StyleSheet,
//   TextInput,
//   View,
//   Image,
//   FlatList,
//   TouchableOpacity,
//   Text,
//   Modal,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import auth from '@react-native-firebase/auth';
// import {firebase} from '@react-native-firebase/firestore';
// import {launchImageLibrary} from 'react-native-image-picker';
// import storage from '@react-native-firebase/storage';
// import {useRoute, useNavigation} from '@react-navigation/native';

// export default function ChatScreen() {
//   const [messages, setMessages] = useState([]);
//   const [textMessage, setTextMessage] = useState('');
//   const [user, setUser] = useState(null);
//   const [image, setImage] = useState(null);
//   const [isImageModalVisible, setIsImageModalVisible] = useState(false);
//   const [selectedImage, setSelectedImage] = useState(null);
//   const {selectedUser} = useRoute().params;
//   const navigation = useNavigation();

//   const [selectedImagePreview, setSelectedImagePreview] = useState(null);

//   const chatId = [auth().currentUser.uid, selectedUser.id].sort().join(':');

//   useEffect(() => {
//     const unsubscribe = firebase
//       .firestore()
//       .collection('chats')
//       .doc(chatId)
//       .collection('messages')
//       .orderBy('createdAt', 'desc')
//       .onSnapshot(querySnapshot => {
//         const messagesArray = [];
//         querySnapshot.forEach(doc => {
//           const data = doc.data();
//           const message = {
//             _id: doc.id,
//             text: data.text,
//             user: {
//               _id: data.sender,
//               name: data.senderName,
//             },
//             createdAt: data.createdAt.toDate(),
//             image: data.image || null,
//           };
//           messagesArray.push(message);
//         });
//         setMessages(messagesArray);
//       });

//     return () => {
//       unsubscribe();
//     };
//   }, []);

//   useEffect(() => {
//     navigation.setOptions({
//       title: selectedUser.name,
//       headerTitleAlign: 'center',
//     });
//   }, [selectedUser]);

//   useEffect(() => {
//     const unsubscribe = auth().onAuthStateChanged(user => {
//       if (user) {
//         setUser({
//           _id: user.uid,
//           name: user.displayName,
//           avatar: user.photoURL,
//         });
//       } else {
//         setUser(null);
//       }
//     });

//     return () => {
//       unsubscribe();
//     };
//   }, []);

//   const uploadImage = async uri => {
//     const response = await fetch(uri);
//     const blob = await response.blob();
//     const fileName = `${Date.now()}-${blob._data.name}`;
//     const ref = storage().ref().child(`images/${fileName}`);
//     await ref.put(blob);
//     const downloadUrl = await ref.getDownloadURL();
//     return downloadUrl;
//   };

//   const handleImageUpload = async () => {
//     let options = {mediaType: 'photo'};
//     launchImageLibrary(options, async result => {
//       if (!result.didCancel) {
//         setImage(result.assets[0].uri);
//         setSelectedImagePreview(result.assets[0].uri);
//       }
//     });
//   };

//   const sendMessage = async () => {
//     if (textMessage.trim() === '') {
//       return;
//     }
//     const currentTime = new Date();
//     const newMessage = {
//       text: textMessage,
//       sender: user._id,
//       senderName: user.name,
//       createdAt: firebase.firestore.Timestamp.fromDate(currentTime),
//       image: image,
//     };

//     if (image) {
//       const downloadUrl = await uploadImage(image);
//       newMessage.image = downloadUrl;
//       setSelectedImagePreview(null);
//       setImage(null);
//     }

//     firebase
//       .firestore()
//       .collection('chats')
//       .doc(chatId)
//       .collection('messages')
//       .add(newMessage);

//     setTextMessage('');
//   };

//   const renderMessage = ({item}) => {
//     const isSender = item.user._id === user._id;
//     const messageContainerStyle = isSender
//       ? styles.senderMessageContainer
//       : styles.receiverMessageContainer;
//     const messageTextStyle = isSender
//       ? styles.senderMessageText
//       : styles.receiverMessageText;

//     const messageTime = item.createdAt.toLocaleTimeString([], {
//       hour: '2-digit',
//       minute: '2-digit',
//       timeZone: 'Asia/Kolkata',
//     });

//     return (
//       <View style={[styles.messageContainer, messageContainerStyle]}>
//         {item.image && (
//           <TouchableOpacity
//             onPress={() => {
//               setIsImageModalVisible(true);
//               setSelectedImage(item.image);
//             }}>
//             <Image style={styles.imageMessage} source={{uri: item.image}} />
//           </TouchableOpacity>
//         )}
//         <View style={styles.messageContent}>
//           <Text style={[styles.messageText, messageTextStyle]}>
//             {item.text}
//           </Text>
//         </View>
//         <Text style={styles.messageTime}>{messageTime}</Text>
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <FlatList
//         inverted
//         data={messages}
//         renderItem={renderMessage}
//         keyExtractor={item => item._id}
//       />
//       <View style={styles.inputContainer}>
//         <TouchableOpacity onPress={handleImageUpload}>
//           <Icon
//             name="camera"
//             size={30}
//             color="#fff"
//             style={styles.cameraIcon}
//           />
//         </TouchableOpacity>
//         {selectedImagePreview && (
//           <Image
//             source={{uri: selectedImagePreview}}
//             style={styles.selectedImagePreview}
//           />
//         )}
//         <TextInput
//           style={styles.textInput}
//           placeholder="Type your message..."
//           value={textMessage}
//           onChangeText={setTextMessage}
//           multiline
//         />
//         <TouchableOpacity onPress={sendMessage}>
//           <Icon name="send" size={30} color="#fff" style={styles.sendIcon} />
//         </TouchableOpacity>
//       </View>
//       <Modal
//         animationType="fade"
//         transparent
//         visible={isImageModalVisible}
//         onRequestClose={() => setIsImageModalVisible(false)}>
//         <View style={styles.modalContainer}>
//           <TouchableOpacity
//             style={styles.closeButton}
//             onPress={() => setIsImageModalVisible(false)}>
//             <Icon name="close" size={30} color="white" />
//           </TouchableOpacity>
//           <Image
//             source={{uri: selectedImage}}
//             style={styles.modalImage}
//             resizeMode="contain"
//           />
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#577D86',
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 5,
//     borderTopWidth: 1,
//     borderTopColor: '#ccc',
//     paddingLeft: 5,
//   },
//   cameraIcon: {
//     marginHorizontal: 6,
//   },
//   sendIcon: {
//     marginRight: 10,
//   },
//   textInput: {
//     flex: 1,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     maxHeight: 100,
//   },
//   messageContainer: {
//     maxWidth: '70%',
//     borderRadius: 10,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     marginVertical: 5,
//   },
//   senderMessageContainer: {
//     alignSelf: 'flex-end',
//     backgroundColor: '#0B2447',
//     padding: 10,
//     borderRadius: 10,
//     marginVertical: 2,
//   },
//   receiverMessageContainer: {
//     alignSelf: 'flex-start',
//     backgroundColor: '#0B2447',
//     padding: 10,
//     borderRadius: 10,
//     marginVertical: 2,
//   },
//   messageContent: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     marginBottom: 5,
//   },
//   senderName: {
//     fontWeight: 'bold',
//     marginRight: 5,
//   },
//   messageText: {
//     fontSize: 16,
//   },
//   senderMessageText: {
//     color: '#fff',
//   },
//   receiverMessageText: {
//     color: '#fff',
//   },
//   messageTime: {
//     fontSize: 12,
//     alignSelf: 'flex-end',
//     color: 'gray',
//   },
//   imageMessage: {
//     width: 150,
//     height: 180,
//     borderRadius: 10,
//     marginBottom: 5,
//     resizeMode: 'stretch',
//   },
//   selectedImagePreview: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     marginRight: 10,
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.7)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 20,
//     right: 20,
//     zIndex: 1,
//   },
//   modalImage: {
//     width: '90%',
//     height: '90%',
//   },
// });

// import React, {useState, useEffect} from 'react';
// import {
//   StyleSheet,
//   TextInput,
//   View,
//   Image,
//   FlatList,
//   TouchableOpacity,
//   Text,
//   Modal,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import auth from '@react-native-firebase/auth';
// import {firebase} from '@react-native-firebase/firestore';
// import {launchImageLibrary} from 'react-native-image-picker';
// import storage from '@react-native-firebase/storage';
// import {useRoute, useNavigation} from '@react-navigation/native';

// export default function ChatScreen() {
//   const [messages, setMessages] = useState([]);
//   const [textMessage, setTextMessage] = useState('');
//   const [user, setUser] = useState(null);
//   const [image, setImage] = useState(null);
//   const [isImageModalVisible, setIsImageModalVisible] = useState(false);
//   const [selectedImage, setSelectedImage] = useState(null);
//   const {selectedUser} = useRoute().params;
//   const navigation = useNavigation();

//   const [selectedImagePreview, setSelectedImagePreview] = useState(null);

//   const chatId = [auth().currentUser.uid, selectedUser.id].sort().join(':');

//   useEffect(() => {
//     const unsubscribe = firebase
//       .firestore()
//       .collection('chats')
//       .doc(chatId)
//       .collection('messages')
//       .orderBy('createdAt', 'desc')
//       .onSnapshot(querySnapshot => {
//         const messagesArray = [];
//         querySnapshot.forEach(doc => {
//           const data = doc.data();
//           const message = {
//             _id: doc.id,
//             text: data.text,
//             user: {
//               _id: data.sender,
//               name: data.senderName,
//             },
//             createdAt: data.createdAt.toDate(),
//             image: data.image || null,
//           };
//           messagesArray.push(message);
//         });
//         setMessages(messagesArray.reverse());
//       });

//     return () => {
//       unsubscribe();
//     };
//   }, []);

//   useEffect(() => {
//     navigation.setOptions({
//       title: selectedUser.name,
//       headerTitleAlign: 'center',
//     });
//   }, [selectedUser]);

//   useEffect(() => {
//     const unsubscribe = auth().onAuthStateChanged(user => {
//       if (user) {
//         setUser({
//           _id: user.uid,
//           name: user.displayName,
//           avatar: user.photoURL,
//         });
//       } else {
//         setUser(null);
//       }
//     });

//     return () => {
//       unsubscribe();
//     };
//   }, []);

//   const uploadImage = async uri => {
//     const response = await fetch(uri);
//     const blob = await response.blob();
//     const fileName = `${Date.now()}-${blob._data.name}`;
//     const ref = storage().ref().child(`images/${fileName}`);
//     await ref.put(blob);
//     const downloadUrl = await ref.getDownloadURL();
//     return downloadUrl;
//   };

//   const handleImageUpload = async () => {
//     let options = {mediaType: 'photo'};
//     launchImageLibrary(options, async result => {
//       if (!result.didCancel) {
//         setImage(result.assets[0].uri);
//         setSelectedImagePreview(result.assets[0].uri);
//       }
//     });
//   };

//   const sendMessage = async () => {
//     if (textMessage.trim() === '') {
//       return;
//     }
//     const currentTime = new Date();
//     const newMessage = {
//       text: textMessage,
//       sender: user._id,
//       senderName: user.name,
//       createdAt: firebase.firestore.Timestamp.fromDate(currentTime),
//       image: image,
//     };

//     if (image) {
//       const downloadUrl = await uploadImage(image);
//       newMessage.image = downloadUrl;
//       setSelectedImagePreview(null);
//       setImage(null);
//     }

//     firebase
//       .firestore()
//       .collection('chats')
//       .doc(chatId)
//       .collection('messages')
//       .add(newMessage);

//     setTextMessage('');
//   };

//   const renderMessage = ({item}) => {
//     return (
//       <View style={styles.messageContainer}>
//         {item.image && (
//           <TouchableOpacity
//             onPress={() => {
//               setIsImageModalVisible(true);
//               setSelectedImage(item.image);
//             }}>
//             <Image style={styles.image} source={{uri: item.image}} />
//           </TouchableOpacity>
//         )}
//         <View style={styles.messageContent}>
//           <Text style={styles.senderName}>{item.user.name}</Text>
//           <Text style={styles.messageText}>{item.text}</Text>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <FlatList
//         inverted
//         data={messages}
//         renderItem={renderMessage}
//         keyExtractor={item => item._id}
//       />
//       <View style={styles.inputContainer}>
//         <TouchableOpacity onPress={handleImageUpload}>
//           <Icon
//             name="camera"
//             size={30}
//             color="gray"
//             style={styles.cameraIcon}
//           />
//         </TouchableOpacity>
//         {selectedImagePreview && (
//           <Image
//             source={{uri: selectedImagePreview}}
//             style={styles.selectedImagePreview}
//           />
//         )}
//         <TextInput
//           style={styles.textInput}
//           placeholder="Type your message..."
//           value={textMessage}
//           onChangeText={setTextMessage}
//           multiline
//         />
//         <TouchableOpacity onPress={sendMessage}>
//           <Icon name="send" size={30} color="gray" style={styles.sendIcon} />
//         </TouchableOpacity>
//       </View>
//       <Modal
//         animationType="fade"
//         transparent
//         visible={isImageModalVisible}
//         onRequestClose={() => setIsImageModalVisible(false)}>
//         <View style={styles.modalContainer}>
//           <TouchableOpacity
//             style={styles.closeButton}
//             onPress={() => setIsImageModalVisible(false)}>
//             <Icon name="close" size={30} color="white" />
//           </TouchableOpacity>
//           <Image
//             source={{uri: selectedImage}}
//             style={styles.modalImage}
//             resizeMode="contain"
//           />
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#577D86',
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 5,
//     borderTopWidth: 1,
//     borderTopColor: '#ccc',
//     paddingLeft: 5,
//   },
//   // inputContainer: {
//   //   flexDirection: 'row',
//   //   alignItems: 'center',
//   //   paddingVertical: 10,
//   //   paddingHorizontal: 15,
//   //   borderTopWidth: 1,
//   //   borderColor: 'lightgray',
//   //   backgroundColor: 'white',
//   // },
//   textInput: {
//     flex: 1,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     maxHeight: 100,
//     // flex: 1,

//     // height: 40,
//     // borderRadius: 20,
//     // paddingHorizontal: 15,
//     // marginRight: 10,
//     // backgroundColor: '#f2f2f2',
//   },
//   sendIcon: {
//     marginHorizontal: 6,
//   },
//   cameraIcon: {
//     marginHorizontal: 6,
//   },
//   messageContainer: {
//     alignSelf: 'flex-start',
//     maxWidth: '70%',
//     borderRadius: 10,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     marginBottom: 5,
//     backgroundColor: '#f0f0f0',
//     marginHorizontal: 10,
//     // flexDirection: 'row',
//     // alignItems: 'flex-start',
//     // paddingHorizontal: 15,
//     // paddingTop: 10,
//   },
//   messageContent: {
//     marginLeft: 10,
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     borderRadius: 10,
//     backgroundColor: '#f2f2f2',
//   },
//   senderName: {
//     fontWeight: 'bold',
//     marginBottom: 5,
//   },
//   messageText: {},
//   image: {
//     width: 100,
//     height: 100,
//     borderRadius: 10,
//   },
//   selectedImagePreview: {
//     width: 100,
//     height: 100,
//     borderRadius: 10,
//     marginLeft: 10,
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.7)',
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 40,
//     right: 20,
//     zIndex: 1,
//   },
//   modalImage: {
//     width: '95%',
//     height: '95%',
//     resizeMode: 'contain',
//   },
// });

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
import {firebase} from '@react-native-firebase/database';
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
  const {selectedUser} = useRoute().params;
  const navigation = useNavigation();

  const [selectedImagePreview, setSelectedImagePreview] = useState(null);

  const chatId = [auth().currentUser.uid, selectedUser.id].sort().join(':');

  useEffect(() => {
    const reference = firebase
      .app()
      .database(
        'https://mynewapp-df37f-default-rtdb.asia-southeast1.firebasedatabase.app/',
      )
      .ref(`/chats/${chatId}`)
      .orderByChild('createdAt')
      .limitToLast(100);

    const onValueChange = reference.on('value', snapshot => {
      const messagesArray = [];
      snapshot.forEach(childSnapshot => {
        const key = childSnapshot.key;
        const data = childSnapshot.val();
        const message = {
          _id: key,
          text: data.text,
          user: {
            _id: data.sender,
            name: data.senderName,
          },
          createdAt: new Date(parseInt(data.createdAt)),
          image: data.image ? data.image : null,
        };
        messagesArray.push(message);
      });

      setMessages(messagesArray.sort((a, b) => b.createdAt - a.createdAt));
    });

    return () => {
      reference.off('value', onValueChange);
    };
  }, []);

  // useEffect(() => {
  //   const reference = firebase
  //     .app()
  //     .database(
  //       'https://mynewapp-df37f-default-rtdb.asia-southeast1.firebasedatabase.app/',
  //     )
  //     .ref(`/chats/${chatId}`)
  //     .orderByChild('createdAt')
  //     .limitToLast(100);

  //   const onValueChange = reference.on('value', snapshot => {
  //     const messagesObject = snapshot.val();
  //     if (messagesObject) {
  //       const messagesArray = Object.keys(messagesObject).map(key => {
  //         const data = messagesObject[key];
  //         return {
  //           _id: key,
  //           text: data.text,
  //           user: {
  //             _id: data.sender,
  //             name: data.senderName,
  //           },
  //           createdAt: new Date(parseInt(data.createdAt)),
  //           image: data.image ? data.image : null,
  //         };
  //       });
  //       setMessages(messagesArray.sort((a, b) => b.createdAt - a.createdAt));
  //     } else {
  //       setMessages([]);
  //     }
  //   });

  //   return () => {
  //     reference.off('value', onValueChange);
  //   };
  // }, []);

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

  const uploadImage = async uri => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileName = `${Date.now()}-${blob._data.name}`;
    const ref = firebase.storage().ref().child(`images/${fileName}`);
    await ref.put(blob);
    const downloadUrl = await ref.getDownloadURL();
    return downloadUrl;
  };

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
      _id: Date.now().toString(),
      text: textMessage,
      user: {
        _id: user._id,
        name: user.name,
      },
      createdAt: currentTime,
      image: image,
    };

    if (image) {
      const downloadUrl = await uploadImage(image);
      newMessage.image = downloadUrl;
      setImage(null);
      setSelectedImagePreview(null);
    }

    const reference = firebase
      .app()
      .database(
        'https://mynewapp-df37f-default-rtdb.asia-southeast1.firebasedatabase.app/',
      )
      .ref(`/chats/${chatId}`)
      .push();
    await reference.set({
      text: newMessage.text,
      sender: newMessage.user._id,
      senderName: newMessage.user.name,
      createdAt: newMessage.createdAt.getTime(),
      image: newMessage.image || null,
    });

    setMessages(prevMessages => [...prevMessages, newMessage]);
    setTextMessage('');
  };

  const renderItem = ({item}) => {
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

    const messageTime = item.createdAt.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata',
    });

    return (
      <View style={[styles.messageContainer, messageContainerStyle]}>
        {item.image && (
          <TouchableOpacity onPress={handleImageClick}>
            <Image source={{uri: item.image}} style={styles.imageMessage} />
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
    setIsImageModalVisible(false);
    setSelectedImage(null);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderItem}
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
    backgroundColor: '#008aff',
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
    margin: 5,
    borderRadius: 10,
  },
  imagePreview: {
    width: 150,
    height: 200,

    resizeMode: 'contain',
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
