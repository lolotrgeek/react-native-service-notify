import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, NativeEventEmitter } from 'react-native';
import NotifService from './NotifService';
import useCounter from './useCounter'
import Heartbeat from './Heartbeat';

export default function App() {
  const { count, setCount, start, stop } = useCounter(1000, false);

  function onNotif(notif) {
    console.log(notif);
    // Alert.alert(notif.title, notif.message);
  }
  const notif = new NotifService(onNotif.bind());
  const deviceEmitter = new NativeEventEmitter

  useEffect(() => {
    if (deviceEmitter) {
      deviceEmitter.addListener('Heartbeat', event => {
        if (typeof event === 'number') setCount(count => count + event)
      })
    }
  })

  return (
    <View style={styles.container}>
      <Text>{count}</Text>
      <Button title='Start' style={styles.button} onPress={() => Heartbeat.startService()} />
      <Button title=' Stop Service' style={styles.button} onPress={() => Heartbeat.stopService()} />

      {/* <Button title='Start' onPress={() => {
        setCount(0)
        start()
        notif.localNotif('Hello')
      }} />
      <Button title='Stop' onPress={() => stop()} /> */}
      <Button title='Clear' onPress={() => { setCount(0); notif.cancelAll() }} />
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