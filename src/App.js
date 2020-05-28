import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, NativeEventEmitter, NativeModules } from 'react-native';
import * as Data from './Data'

const { Heartbeat } = NativeModules;
const deviceEmitter = new NativeEventEmitter(Heartbeat)

export default function App() {

  const [status, setStatus] = useState('event')

  useEffect(() => {
    deviceEmitter.addListener("done", event => {
      console.log('[react] ', event)
      let parsed = JSON.parse(event)
      if(parsed.gotAll) {
        setStatus(event)
      }
    })

    return () => {
      deviceEmitter.removeAllListeners("done")
    }
  },[])
  useEffect(() => Data.createProject('test', '#000'), [])
  useEffect(() => Data.getProjects(),[])

  return (
    <View style={styles.container}>
      <Text>Events:</Text>
      <Text styles={styles.status}>{status}</Text>
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
