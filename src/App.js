import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Button, NativeEventEmitter, NativeModules, FlatList } from 'react-native';
import * as Data from './Data'
import useCounter from './useCounter'


const { Heartbeat } = NativeModules;
const deviceEmitter = new NativeEventEmitter(Heartbeat)

export default function App() {

  const [online, setOnline] = useState([])
  const [status, setStatus] = useState([])
  const [projects, setProjects] = useState([])
  const [timers, setTimers] = useState([])
  const { count, setCount, start, stop } = useCounter(1000, false)
  // const [running, setRunning] = useState({ id: 'none' })

  const running = useRef({ id: 'none' })

  useEffect(() => {
    // Listens for Data 'done' events, filters them for display
    deviceEmitter.addListener("done", event => {
      let item = JSON.parse(event)
      console.log('[react] Done.')
      console.log(typeof item + ' ', item)
      if (item.type === 'project') {
        setProjects(projects => [...projects, item])
      }
      if (item.type === 'timer') {
        console.log('[react] timer.')
        if (item.status === 'running') {
          // setRunning(item)
          running.current = item
          setCount(0)
          start()
          console.log('[react] running')
          console.log(running)
        }
        else if (item.status === 'done' && item.id === running.current.id) {
          console.log('[react] STOP')
          console.log(item)
          // setRunning(item)
          running.current = item
          stop()
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
      <Text>{running.current.status === 'done' || running.current.id === 'none' ? 'Last Run: ' + running.current.id : 'Running: ' + running.current.id}</Text>
      <Text>{count}</Text>
      {running.current.status !== 'running' || running.current.id === 'none' ?
        <Button title='start' onPress={() => Data.createTimer('testproject')} /> :
        <Button title='stop' onPress={() => Data.finishTimer(running.current)} />
      }
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
