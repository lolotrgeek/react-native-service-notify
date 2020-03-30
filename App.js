import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, NativeEventEmitter } from 'react-native';
import { setHeartBeat, store } from './store';
import Heartbeat from './Heartbeat';

const deviceEmitter = new NativeEventEmitter

export default function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (deviceEmitter) {
      console.log('listening...')
      deviceEmitter.addListener("Heartbeat", event => {
        console.log('device Event: ', event)
        if (event) setCount(event)
      })
    }
    return () => { setCount(0); console.log('stop listening')}
  },[])

  return (
    <View style={styles.container}>
      <Text>{count}</Text>
      <Button title='Start Service' style={styles.button} onPress={() => {Heartbeat.startService()}} />
      <Button title='Stop Service' style={styles.button} onPress={() => Heartbeat.stopService()} />
      <Button title='Clear' onPress={() => { store.dispatch(setHeartBeat(0)); setCount(0); }} />
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
