import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View, FlatList, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export default function UsersScreen() {
  const [users, setUsers] = useState([]);
  const navigation = useNavigation();
  const {uid} = auth().currentUser;

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('users')
      .where('uid', '!=', uid)
      .onSnapshot(snapshot => {
        const usersArray = snapshot.docs?.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.displayName,
            email: data.email,
          };
        });
        const sortedUsers = usersArray.sort((a, b) =>
          a.name.localeCompare(b.name),
        );

        setUsers(sortedUsers || []);
      });

    return () => {
      unsubscribe();
    };
  }, [uid]);

  const handleUserSelect = user => {
    navigation.navigate('Chat', {selectedUser: user});
  };

  const renderUser = ({item}) => {
    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => handleUserSelect(item)}>
        {/* <Text style={styles.userEmail}>{item.email}</Text> */}
        <Text style={styles.userName}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={item => item.id}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: '#408E91',
  },
  userItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
    textDecorationLine: 'none',
  },
  userNameHover: {
    textDecorationLine: 'underline',
    color: '#666',
  },
});
