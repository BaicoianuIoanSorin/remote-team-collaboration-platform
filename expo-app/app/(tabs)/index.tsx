import React, { useEffect, useState, useCallback } from 'react';
import { Button, StyleSheet, TextInput, View } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import WebSocketClient from "@/api/websocket/WebSocketClient";

const MOCK_MESSAGES: IMessage[] = [
  {
    _id: 1,
    text: 'Hello, World!',
    createdAt: new Date(),
    user: {
      _id: 2,
      name: 'Simple Chatter',
      avatar: 'https://cdn.pixabay.com/photo/2016/11/18/23/38/child-1837375__340.png',
    },
  },
];

const TabOneScreen: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [isEnter, setIsEnter] = useState<boolean>(false);
  const [messages, setMessages] = useState<IMessage[]>([]);

  useEffect(() => {
    WebSocketClient.onReceiveMessage = (newMessage: IMessage) => {
      setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, [newMessage])
      );
    };

    return () => {
      WebSocketClient.close();
    };
  }, []);

  const onSend = useCallback((newMessages: IMessage[] = []) => {
    newMessages.forEach((message) => {
      WebSocketClient.send(message);
    });
    setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, newMessages)
    );
  }, []);

  if (!isEnter) {
    return (
        <View style={styles.container}>
          <TextInput
              style={styles.textInput}
              textAlign="center"
              value={name}
              placeholder="Name"
              onChangeText={(text) => setName(text)}
          />
          <Button title="Enter" onPress={() => setIsEnter(true)} />
        </View>
    );
  } else {
    const user = {
      _id: name,
      name,
      avatar: 'https://cdn.pixabay.com/photo/2016/11/18/23/38/child-1837375__340.png',
    };

    return (
        <View style={{ flex: 1 }}>
          <GiftedChat
              messages={messages}
              onSend={(newMessages) => onSend(newMessages)}
              user={user}
              renderUsernameOnMessage
          />
        </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '50%',
  },
});

export default TabOneScreen;