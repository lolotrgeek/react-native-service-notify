import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, NativeEventEmitter, NativeModules } from 'react-native';

const { Heartbeat } = NativeModules;
const deviceEmitter = new NativeEventEmitter(Heartbeat)

export default function App() {

  const [status, setStatus] = useState('status')

  useEffect(() => {
    deviceEmitter.addListener("done", event => {
      console.log('[react] ', event)
      setStatus(event)
    })

    return () => {
      deviceEmitter.removeAllListeners("done")
    }
  },[])

  return (
    <View style={styles.container}>
      <Text styles={styles.status}>{status}</Text>
      {/* <Button title='Get' onPress={()=> Heartbeat.get(JSON.stringify({hello: {node: ''}}))} /> */}
      <Button title='Get' onPress={()=> Heartbeat.get('hello/node')} />
      {/* <Button title='Put' onPress={()=> Heartbeat.put(JSON.stringify({ hello: {node: 'new'}}))} /> */}
      <Button title='Put' onPress={()=> Heartbeat.put('hello/node', 'native')} />
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
