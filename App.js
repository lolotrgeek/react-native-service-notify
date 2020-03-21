import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { Notifications } from 'expo';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';

export default function App() {
  const onSubmit = () => {
    const localNotification = {
      title: 'Title',
      body: 'Body'
    };

    const schedulingOptions = {
      time: (new Date()).getTime()
    }

    Notifications.presentLocalNotificationAsync(localNotification);
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

  return (
    <View style={styles.container}>
      <Text>Hello!</Text>
      <Button title='Notify' onPress={() => onSubmit()} />
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
