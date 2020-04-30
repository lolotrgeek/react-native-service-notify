import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { setHeartBeat, store } from './service/LocalStore';
import useCounter from './hooks/useCounterNative'
import { getProjects, getRunningTimer, getRunningProject, getTimers, updateState } from './constants/Effects'
import { createProject, createTimer, finishTimer } from './constants/Data';

export default function App() {
  const { status, state, count, setCount, start, stop, startService, stopService } = useCounter()
  const [online, setOnline] = useState(0)
  const [projects, setProjects] = useState([])
  const [timers, setTimers] = useState([])
  const [current, setCurrent] = useState([])
  const [runningTimer, setRunningTimer] = useState('')
  const [runningProject, setRunningProject] = useState('')

  useEffect(() => getProjects({ setProjects }), [online])
  useEffect(() => getRunningTimer({ setCount, start, stop, setRunningTimer }), [online])
  useEffect(() => getRunningProject({ setRunningProject, runningTimer }), [runningTimer])
  useEffect(() => getTimers({ current, timers, setCurrent, setTimers }), [online])

  return (
    <View style={styles.container}>
      <Text style={{ color: status === "STARTED" ? 'green' : 'red' }}>{status}</Text>
      {/* <Text style={{ color: state === "PAUSED" ? 'red' : 'green' }}>{store.App}</Text> */}
      <Text>{`Running Project: ${runningProject[1] ? runningProject[1].name : ''}`}</Text>
      <Text>{count}</Text>
      <Button title='Start Service' style={styles.button} onPress={() => { startService() }} />
      <Button title='Stop Service' style={styles.button} onPress={() => stopService()} />
      <Button title='New Project' style={styles.button} onPress={() => { createProject('test', '#000') }} />
      <Button title='New Timer' style={styles.button} onPress={() => {
        if (projects.length === 0) console.log('No Projects')
        else {
          createTimer(projects[0][0])
        }
      }} />
      <Button title='Stop Timer' style={styles.button} onPress={() => {
        if (runningTimer.length === 0) console.log('No Running Timer')
        else {
          finishTimer(runningTimer)
        }
      }}
      />
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
