import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, NativeEventEmitter, NativeModules } from 'react-native';

const { Heartbeat } = NativeModules;
const deviceEmitter = new NativeEventEmitter(Heartbeat)

export default function App() {

  const [status, setStatus] = useState('status')

  useEffect(() => {
    deviceEmitter.addListener("get", event => {
      console.log('[react] ', event)
      setStatus(event)
    })

    deviceEmitter.addListener("put", event => {
      console.log('[react] ', event)
      setStatus(event)
    })
  },[])

  return (
    <View style={styles.container}>
      <Text styles={styles.status}>{status}</Text>
      <Button title='Get' onPress={()=> Heartbeat.get('hello')} />
      <Button title='Put' onPress={()=> Heartbeat.put({key: 'hello,', value: 'world'})} />
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
  button: {
    margin: 20,
  },
  status: {
    fontSize: 30,
  }
});
