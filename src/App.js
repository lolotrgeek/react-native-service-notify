import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Button, NativeEventEmitter, NativeModules, FlatList } from 'react-native';
import * as Data from './Data'
import { timeRules } from './Functions';

const { Heartbeat } = NativeModules;
const deviceEmitter = new NativeEventEmitter(Heartbeat)

export default function App() {

  const [online, setOnline] = useState([])
  const [status, setStatus] = useState([])
  const [projects, setProjects] = useState([])
  const [timers, setTimers] = useState([])
  const [running, setRunning] = useState([{ id: 'none' }])

  // const running = useRef({ id: 'none' })

  useEffect(() => {
    deviceEmitter.addListener("done", event => {
      let item = JSON.parse(event)
      console.log('[react] Item' + typeof item + ' ', item)
      if (item.type === 'project') {
        setProjects(projects => [...projects, item])
      }
      if (item.type === 'timer') {
        if (item.status === 'running') {
          console.log('[react] running')
          setRunning(item)
        }
        setTimers(timers => [...timers, item])
      }
    })

    return () => deviceEmitter.removeAllListeners("done")
  }, [])

  useEffect(() => Data.getProjects(), [online])

  return (
    <View style={styles.container}>
      <Text styles={styles.status}>{status}</Text>
      <Text>Running: {running.id}</Text>
      {/* <Text>Projects:</Text>
      <Button title='create' onPress={() => Data.createProject('test2', '#000')}></Button>
      <FlatList
        data={projects}
        renderItem={item => <Text >{item.name}</Text>}
        keyExtractor={item => item.id}
      /> */}
      <Button title='start' onPress={() => { Data.createTimer('testproject') }} />
      <Button title='stop' onPress={() => { Data.finishTimer(running) }} />
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
