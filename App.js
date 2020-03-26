import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, NativeEventEmitter, EventEmitter } from 'react-native';
import Heartbeat from './Heartbeat';

export default function App() {
  const [count, setCount] = useState(0)


  const deviceEmitter = new NativeEventEmitter

  useEffect(() => {
    if (deviceEmitter) {
      console.log('listening...')
      deviceEmitter.addListener("Heartbeat", event => {
        console.log('device Event: ', event)
        if (event) setCount(event)
      })
    }
  })

  return (
    <View style={styles.container}>
      <Text>{count}</Text>
      <Button title='Start' style={styles.button} onPress={() => Heartbeat.startService()} />
      <Button title=' Stop Service' style={styles.button} onPress={() => Heartbeat.stopService()} />
      <Button title='Clear' onPress={() => { setCount(0); }} />
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