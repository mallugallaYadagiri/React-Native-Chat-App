import React, {useState, useEffect, useCallback} from 'react';
import {StyleSheet, TextInput, View, Image} from 'react-native';
import {GiftedChat, Send} from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/FontAwesome';
import auth from '@react-native-firebase/auth';
import {firebase} from '@react-native-firebase/database';
import {launchImageLibrary} from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import {useRoute, useNavigation} from '@react-navigation/native';

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [caption, setCaption] = useState('');
  const [user, setUser] = useState(null);
  const [image, setImage] = useState();
  const {selectedUser} = useRoute().params;
  const navigation = useNavigation();

  const chatId = [auth().currentUser.uid, selectedUser.id].sort().join(':');

  // useEffect hook was created to fetch and display the chat messages between the current user and the selected user from the database
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
      const messagesObject = snapshot.val();
      if (messagesObject) {
        const messagesArray = Object.keys(messagesObject).map(key => {
          const data = messagesObject[key];
          return {
            _id: key,
            text: data.text,
            user: {
              _id: data.sender,
              name: data.senderName,
            },
            // createdAt: new Date(data.createdAt),
            createdAt: new Date(parseInt(data.createdAt)),

            image: data.image ? data.image : null,
          };
        });
        // setMessages(messagesArray.reverse());
        // setMessages(messagesArray);
        setMessages(messagesArray.sort((a, b) => b.createdAt - a.createdAt));
      } else {
        setMessages([]);
      }
    });

    return () => {
      reference.off('value', onValueChange);
    };
  }, []);
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

  const onSend = useCallback(
    async (messages = []) => {
      const newMessage = messages[0];
      const messageData = {
        text: newMessage.text,
        sender: user._id,
        senderName: user.name,
        // createdAt: newMessage.createdAt.getTime(),
        createdAt: new Date().getTime(),
      };
      if (newMessage.image) {
        const downloadUrl = await uploadImage(newMessage.image);
        messageData.image = downloadUrl;
      }
      const reference = firebase
        .app()
        .database(
          'https://mynewapp-df37f-default-rtdb.asia-southeast1.firebasedatabase.app/',
        )
        .ref(`/chats/${chatId}`)
        .push();
      await reference.set(messageData);
      setMessages(previousMessages => {
        return GiftedChat.append(previousMessages, newMessage);
      });

      setImage(null);
    },
    [chatId, user],
  );

  const hasImage = () => {
    return image !== undefined && image !== null && image !== '';
  };
  const handleImageUpload = async () => {
    let options = {mediaType: 'photo'};
    const result = await launchImageLibrary(options);
    if (!result.didCancel) {
      setImage(result.assets[0].uri);
    }
  };

  const renderSend = props => {
    const {text} = props;
    return (
      <View style={{flexDirection: 'row'}}>
        <Icon
          name="camera"
          size={25}
          color="#008aff"
          style={{margin: 10}}
          onPress={handleImageUpload}
        />
        {text.length > 0 && (
          <Send {...props} disabled={!text}>
            <Icon name="send" size={25} color="#008aff" style={{margin: 10}} />
          </Send>
        )}
      </View>
    );
  };
  const scrollToBottom = () => {
    return <Icon name="arrow-down" size={25} color="#008aff" />;
  };

  const renderChatFooter = () => {
    if (hasImage()) {
      const message = {
        _id: new Date().getTime(),
        image: image,
        user: {
          _id: auth().currentUser.uid,
          name: auth().currentUser.displayName,
        },
        createdAt: new Date(),
        text: caption,
      };

      return (
        <View style={styles.ChatFooter}>
          <Image
            source={{uri: image}}
            resizeMode="contain"
            style={styles.ChatFooterImg}
          />
          <View style={{flexDirection: 'row'}}>
            <TextInput
              placeholder="Add captions"
              style={styles.CaptionInput}
              value={caption}
              onChangeText={text => setCaption(text)}
            />
            <View style={styles.ChatFooterIcons}>
              <Icon
                name="close"
                size={25}
                color="#008aff"
                style={{margin: 10}}
                onPress={() => {
                  setImage(null);
                  setCaption('');
                }}
              />
              <Icon
                name="send"
                size={25}
                color="#008aff"
                style={{margin: 10}}
                onPress={() => {
                  onSend([message], true);
                  setCaption('');
                }}
              />
            </View>
          </View>
        </View>
      );
    } else {
      return null;
    }
  };
  return (
    <GiftedChat
      messages={messages}
      onSend={newMessages => onSend(newMessages)}
      user={{
        _id: auth().currentUser.uid,
        name: auth().currentUser.displayName,
      }}
      renderSend={renderSend}
      scrollToBottom
      scrollToBottomComponent={scrollToBottom}
      renderChatFooter={renderChatFooter}
    />
  );
}

const styles = StyleSheet.create({
  ChatFooter: {
    backgroundColor: 'gray',
    margin: 15,
    borderRadius: 10,
    padding: 10,
  },
  CaptionInput: {
    backgroundColor: 'white',
    color: 'black',
    borderRadius: 10,
    fontSize: 20,
    width: 260,
    marginTop: 10,
  },
  ChatFooterImg: {
    width: 340,
    height: 150,
  },
  ChatFooterIcons: {
    flexDirection: 'row',
    marginTop: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    marginTop: 10,
  },
});

// import React, {useState, useCallback, useEffect} from 'react';
// import {
//   GiftedChat,
//   Send,
//   Message,
//   Avatar,
//   Bubble,
// } from 'react-native-gifted-chat';

// import auth from '@react-native-firebase/auth';
// import {
//   StyleSheet,
//   Text,
//   TextInput,
//   View,
//   TouchableOpacity,
//   Image,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

// import database from '@react-native-firebase/database';
// import storage from '@react-native-firebase/storage';
// import {firebase} from '@react-native-firebase/database';

// export default function ChatScreen() {
//   const [messages, setMessages] = useState([]);
//   const [user, setUser] = useState(null);
//   const [image, setImage] = useState();

//   useEffect(() => {
//     const reference = firebase
//       .app()
//       .database(
//         'https://mynewapp-df37f-default-rtdb.asia-southeast1.firebasedatabase.app/',
//       )
//       .ref('/chats')
//       .orderByChild('createdAt')
//       .limitToLast(100);

//     const onValueChange = reference.on('value', snapshot => {
//       const messagesObject = snapshot.val();
//       if (messagesObject) {
//         const messagesArray = Object.keys(messagesObject).map(key => {
//           const data = messagesObject[key];
//           return {
//             _id: key,
//             text: data.text,
//             user: {
//               _id: data.sender,
//               name: data.senderName,
//             },
//             createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
//             image: data.image ? data.image : null,
//           };
//         });
//         setMessages(messagesArray);
//       } else {
//         setMessages([]);
//       }
//     });

//     return () => {
//       reference.off('value', onValueChange);
//     };
//   }, []);

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

//   const onSend = useCallback(
//     async (messages = []) => {
//       const newMessage = messages[0];
//       const messageData = {
//         text: newMessage.text,
//         sender: user._id,
//         senderName: user.name,
//         createdAt: new Date().getTime(),
//       };
//       if (newMessage.image) {
//         const downloadUrl = await uploadImage(newMessage.image);
//         messageData.image = downloadUrl;
//       }
//       const reference = firebase
//         .app()
//         .database(
//           'https://mynewapp-df37f-default-rtdb.asia-southeast1.firebasedatabase.app/',
//         )
//         .ref('/chats')
//         .push();
//       await reference.set(messageData);
//       setMessages(previousMessages =>
//         GiftedChat.append(previousMessages, [newMessage]),
//       );
//     },
//     [user],
//   );

//   const scrollToBottom = () => {
//     return <Icon name="arrow-down" size={25} color="#008aff" />;
//   };

//   const hasImage = () => {
//     return image !== undefined && image !== null && image !== '';
//   };

//   const handleImageUpload = async () => {
//     let options = {mediaType: 'photo'};
//     const result = await launchImageLibrary(options);
//     if (!result.didCancel) {
//       setImage(result.assets[0].uri);
//     }
//   };

//   const renderSend = props => {
//     const {text} = props;
//     return (
//       <View style={{flexDirection: 'row'}}>
//         <Icon
//           name="camera"
//           size={25}
//           color="#008aff"
//           style={{margin: 10}}
//           onPress={handleImageUpload}
//         />
//         {text.length > 0 && (
//           <Send {...props} disabled={!text}>
//             <Icon name="send" size={25} color="#008aff" style={{margin: 10}} />
//           </Send>
//         )}
//       </View>
//     );
//   };

//   const renderBubble = props => {
//     const {currentMessage, position} = props;
//     const isSender = position === 'right';

//     if (currentMessage.image) {
//       return (
//         <View style={{flex: 1}}>
//           <Bubble
//             {...props}
//             wrapperStyle={{
//               [position]: {
//                 backgroundColor: isSender ? '#0084ff' : '#f0f0f0',
//               },
//             }}
//             textStyle={{
//               [position]: {
//                 color: isSender ? '#fff' : '#000',
//               },
//             }}
//           />
//           <Image
//             source={{uri: currentMessage.image}}
//             style={{
//               width: 200,
//               height: 200,
//               alignSelf: isSender ? 'flex-end' : 'flex-start',
//               marginVertical: 10,
//               borderRadius: 10,
//               resizeMode: 'contain',
//             }}
//           />
//         </View>
//       );
//     }

//     return <Bubble {...props} />;
//   };

//   const renderChatFooter = () => {
//     if (hasImage()) {
//       return (
//         <View style={styles.ChatFooter}>
//           <Image source={{uri: image}} style={styles.ChatFooterImg} />
//           <View style={{flexDirection: 'row'}}>
//             <TextInput
//               placeholder="Add captions"
//               style={styles.ChatFooterInput}
//             />
//             <View style={styles.ChatFooterIcons}>
//               <Icon
//                 name="close"
//                 size={25}
//                 color="#008aff"
//                 style={{margin: 10}}
//                 onPress={() => setImage(null)}
//               />
//               <Icon
//                 name="send"
//                 size={25}
//                 color="#008aff"
//                 style={{margin: 10}}
//                 onPress={() => onSend([{image}], true)}
//               />
//             </View>
//           </View>
//         </View>
//       );
//     } else {
//       return null;
//     }
//   };

//   const renderMessageImage = () => {};

//   return (
//     <GiftedChat
//       messages={messages}
//       onSend={messages => onSend(messages)}
//       user={user}
//       renderSend={renderSend}
//       scrollToBottom
//       scrollToBottomComponent={scrollToBottom}
//       // renderMessageImage={renderMessageImage}
//       renderChatFooter={renderChatFooter}
//       renderBubble={renderBubble}
//     />
//   );
// }

// const styles = StyleSheet.create({
//   ChatFooter: {
//     backgroundColor: 'gray',
//     margin: 15,
//     borderRadius: 10,
//     padding: 10,
//   },
//   ChatFooterInput: {
//     backgroundColor: 'white',
//     color: 'black',
//     borderRadius: 10,
//     fontSize: 20,
//     width: 260,
//     marginTop: 10,
//   },
//   ChatFooterImg: {
//     width: 340,
//     borderRadius: 10,
//     height: 150,
//   },
//   ChatFooterIcons: {
//     flexDirection: 'row',
//     marginTop: 5,
//     backgroundColor: 'white',
//     borderRadius: 10,
//     marginTop: 10,
//   },
// });

// // const renderBubble = props => {
// //   if (props.currentMessage.image) {
// //     return (
// //       <View style={{flex: 1}}>
// //         <Bubble
// //           {...props}
// //           wrapperStyle={{
// //             right: {
// //               backgroundColor: '#0084ff',
// //             },
// //             left: {
// //               backgroundColor: '#f0f0f0',
// //             },
// //           }}
// //           textStyle={{
// //             right: {
// //               color: '#fff',
// //             },
// //           }}
// //         />

// //         <Image
// //           source={{uri: props.currentMessage.image}}
// //           style={{
// //             width: 200,
// //             height: 200,
// //             alignSelf: 'flex-end',
// //             marginVertical: 10,
// //             borderRadius: 10,
// //             resizeMode: 'contain',
// //           }}
// //         />
// //       </View>
// //     );
// //   }
// //   return <Bubble {...props} />;
// // };

// // const renderBubble = props => {
// //   if (props.currentMessage.image) {
// //     return (
// //       <View style={{flex: 1}}>
// //         <Bubble
// //           {...props}
// //           wrapperStyle={{
// //             right: {
// //               backgroundColor: '#0084ff',
// //             },
// //             left: {
// //               backgroundColor: '#f0f0f0',
// //             },
// //           }}
// //           textStyle={{
// //             right: {
// //               color: '#fff',
// //             },
// //           }}
// //         />
// //         <Image
// //           source={{uri: props.currentMessage.image}}
// //           style={{
// //             width: 200,
// //             height: 200,
// //             alignSelf: 'flex-end',
// //             marginVertical: 10,
// //             borderRadius: 10,
// //           }}
// //         />
// //       </View>
// //     );
// //   }
// //   return <Bubble {...props} />;
// // };
// // import React, {useState, useCallback, useEffect} from 'react';
// // import {GiftedChat, Send, Message, Avatar} from 'react-native-gifted-chat';
// // // import firestore from '@react-native-firebase/firestore';
// // import auth from '@react-native-firebase/auth';
// // import {
// //   StyleSheet,
// //   Text,
// //   TextInput,
// //   View,
// //   TouchableOpacity,
// //   Image,
// // } from 'react-native';
// // import Icon from 'react-native-vector-icons/FontAwesome';
// // import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
// // import storage from '@react-native-firebase/storage';
// // import database from '@react-native-firebase/database';
// // import {firebase} from '@react-native-firebase/database';

// // import {onValue, ref} from '@react-native-firebase/database';

// // function ChatScreen() {
// //   const [messages, setMessages] = useState([]);
// //   const [user, setUser] = useState(null);
// //   const [image, setImage] = useState();

// //   // useEffect(() => {
// //   //   const messagesRef = firestore()
// //   //     .collection('chats')
// //   //     .orderBy('createdAt', 'desc');
// //   //   const unsubscribe = messagesRef.onSnapshot(snapshot => {
// //   //     const messagesArray = snapshot.docs.map(doc => {
// //   //       const data = doc.data();
// //   //       return {
// //   //         _id: doc.id,
// //   //         text: data.text,
// //   //         user: {
// //   //           _id: data.sender,
// //   //           name: data.senderName,
// //   //         },
// //   //         createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
// //   //         image: data.image ? data.image : null,
// //   //       };
// //   //     });
// //   //     setMessages(messagesArray);
// //   //   });

// //   //   return () => {
// //   //     unsubscribe();
// //   //   };
// //   // }, []);

// //   // useEffect(() => {
// //   //   const reference = firebase
// //   //     .app()
// //   //     .database(
// //   //       'https://mynewapp-df37f-default-rtdb.asia-southeast1.firebasedatabase.app/',
// //   //     )
// //   //     .ref('/chats')
// //   //     .orderByChild('createdAt')
// //   //     .limitToLast(100);

// //   //   const onValueChange = reference.on('value', snapshot => {
// //   //     const messagesObject = snapshot.val();
// //   //     if (messagesObject) {
// //   //       const messagesArray = Object.keys(messagesObject).map(key => {
// //   //         const data = messagesObject[key];
// //   //         return {
// //   //           _id: key,
// //   //           text: data.text,
// //   //           user: {
// //   //             _id: data.sender,
// //   //             name: data.senderName,
// //   //           },
// //   //           createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
// //   //           image: data.image ? data.image : null,
// //   //         };
// //   //       });
// //   //       setMessages(messagesArray.reverse());
// //   //     } else {
// //   //       setMessages([]);
// //   //     }
// //   //   });

// //   //   return () => {
// //   //     reference.off('value', onValueChange);
// //   //   };
// //   // }, []);

// //   useEffect(() => {
// //     const unsubscribe = auth().onAuthStateChanged(user => {
// //       if (user) {
// //         setUser({
// //           _id: user.uid,
// //           name: user.displayName,
// //           avatar: user.photoURL,
// //         });
// //       } else {
// //         setUser(null);
// //       }
// //     });

// //     return () => {
// //       unsubscribe();
// //     };
// //   }, []);

// //   const onSend = useCallback(
// //     async (messages = []) => {
// //       const newMessage = messages[0];
// //       const messageData = {
// //         text: newMessage.text,
// //         sender: user._id,
// //         senderName: user.name,
// //         // createdAt: firestore.FieldValue.serverTimestamp(),
// //         createdAt: new Date().getTime(),
// //         image: newMessage.image ? newMessage.image : null,
// //       };

// //       const reference = firebase
// //         .app()
// //         .database(
// //           'https://mynewapp-df37f-default-rtdb.asia-southeast1.firebasedatabase.app/',
// //         )
// //         .ref('/chats')
// //         .push();

// //       await reference.set(messageData);

// //       // await firestore().collection('chats').add(messageData);
// //       setMessages(previousMessages =>
// //         GiftedChat.append(previousMessages, messages),
// //       );
// //     },
// //     [user],
// //   );

// //   const scrollToBottom = () => {
// //     return <Icon name="arrow-down" size={25} color="#008aff" />;
// //   };

// //   const hasImage = () => {
// //     return image !== undefined && image !== null && image !== '';
// //   };

// //   const handleImageUpload = async () => {
// //     let options = {mediaType: 'photo'};
// //     // console.warn('Please choose the image');
// //     const result = await launchImageLibrary(options);
// //     if (!result.didCancel) {
// //       setImage(result.assets[0].uri);
// //     }
// //   };

// //   const renderSend = props => {
// //     const {text} = props;
// //     return (
// //       <View style={{flexDirection: 'row'}}>
// //         <Icon
// //           name="camera"
// //           size={25}
// //           color="#008aff"
// //           style={{margin: 10}}
// //           onPress={handleImageUpload}
// //         />
// //         {text.length > 0 && (
// //           <Send {...props} disabled={!text}>
// //             <Icon name="send" size={25} color="#008aff" style={{margin: 10}} />
// //           </Send>
// //         )}
// //       </View>
// //     );
// //   };

// //   const renderChatFooter = () => {
// //     if (hasImage()) {
// //       return (
// //         <View style={styles.ChatFooter}>
// //           <Image source={{uri: image}} style={styles.ChatFooterImg} />
// //           <View style={{flexDirection: 'row'}}>
// //             <TextInput
// //               placeholder="Add captions"
// //               style={styles.ChatFooterInput}
// //             />
// //             <View style={styles.ChatFooterIcons}>
// //               <Icon
// //                 name="close"
// //                 size={25}
// //                 color="#008aff"
// //                 style={{margin: 10}}
// //               />
// //               <Icon
// //                 name="send"
// //                 size={25}
// //                 color="#008aff"
// //                 style={{margin: 10}}
// //               />
// //             </View>
// //           </View>
// //         </View>
// //       );
// //     } else {
// //       return null;
// //     }
// //   };

// //   // const renderChatFooter = () => {
// //   //   return (
// //   //     <View style={styles.ChatFooter}>
// //   //       {hasImage() && (
// //   //         <Image source={{uri: image}} style={styles.ChatFooterImg} />
// //   //       )}
// //   //       {/* <Image source={{uri: image}} style={styles.ChatFooterImg} /> */}
// //   //       <View style={{flexDirection: 'row'}}>
// //   //         <TextInput
// //   //           placeholder="Add captions"
// //   //           style={styles.ChatFooterInput}
// //   //         />
// //   //         <View style={styles.ChatFooterIcons}>
// //   //           <Icon name="close" size={25} color="#008aff" style={{margin: 10}} />
// //   //           <Icon name="send" size={25} color="#008aff" style={{margin: 10}} />
// //   //         </View>
// //   //       </View>
// //   //     </View>
// //   //   );
// //   // };

// //   const renderMessageImage = () => {};

// //   return (
// //     <GiftedChat
// //       messages={messages}
// //       onSend={messages => onSend(messages)}
// //       user={user}
// //       renderSend={renderSend}
// //       scrollToBottom
// //       scrollToBottomComponent={scrollToBottom}
// //       renderMessageImage={renderMessageImage}
// //       renderChatFooter={renderChatFooter}
// //       // renderBubble={renderBubble}
// //     />
// //   );
// // }

// // export default ChatScreen;

// // const styles = StyleSheet.create({
// //   ChatFooter: {
// //     backgroundColor: 'gray',
// //     margin: 15,
// //     borderRadius: 10,
// //     padding: 10,
// //   },
// //   ChatFooterInput: {
// //     backgroundColor: 'white',
// //     color: 'black',
// //     borderRadius: 10,
// //     fontSize: 20,
// //     width: 260,
// //     marginTop: 10,
// //   },
// //   ChatFooterImg: {
// //     width: 340,
// //     borderRadius: 10,
// //     height: 150,
// //   },
// //   ChatFooterIcons: {
// //     flexDirection: 'row',
// //     marginTop: 5,
// //     backgroundColor: 'white',
// //     borderRadius: 10,
// //     marginTop: 10,
// //   },
// // });
