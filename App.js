import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { Notifications } from 'expo';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import useCounter from './useCounter'


export default function App() {
  const { count, setCount, start, stop } = useCounter(1000, false);
  const [ids, setId] = useState([])

  const onSubmit = () => {
    const localNotification = {
      title: 'Title',
      body: 'New ',
      android: {
        sticky: true
      }
    };

    const schedulingOptions = {
      time: (new Date()).getTime()
    }

    Notifications.presentLocalNotificationAsync(localNotification).then(notifcationId => setId([...ids, notifcationId]))
  }

  const clear = () => {
    if (ids && ids.length > 0) {
      ids.map((id, index) => Notifications.dismissNotificationAsync(id).then(() => setId(ids.splice(index, 1))))
    }
  }

  const handleNotification = () => {
    console.warn('ok! got your notif');
  }


  useEffect(() => {
    async function getPermission() {
      // We need to ask for Notification permissions for ios devices
      let result = await Permissions.askAsync(Permissions.NOTIFICATIONS);

      if (Constants.isDevice && result.status === 'granted') {
        console.log('Notification permissions granted.')
      }
      // If we want to do something with the notification when the app
      // is active, we need to listen to notification events and 
      // handle them in a callback
      Notifications.addListener(handleNotification);
    }
    getPermission()

  }, [])

  useEffect(() => {
    // onSubmit()
  }, [count])

  useEffect(() => {
    console.log(ids)
  }, [ids])

  return (
    <View style={styles.container}>
      <Text>{count}</Text>
      <Button title='Start' onPress={() => {
        setCount(0)
        start()
        onSubmit()
      }} />
      <Button title='Stop' onPress={() => stop()} />
      <Button title='Clear' onPress={() => clear()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
