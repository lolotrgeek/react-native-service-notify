import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { setHeartBeat, store, setProject, setTimer } from './service/LocalStore';
import useCounter from './hooks/useCounterNative'
import { getProjects, getRunningTimer, getRunningProject, getTimers, updateState } from './constants/Effects'
import { createProject, createTimer, finishTimer } from './constants/Data';

export default function App() {
  const { status, state, count, setCount, start, stop, startService, stopService } = useCounter()
  const [online, setOnline] = useState(0)
  const [projects, setProjects] = useState([])
  const [timers, setTimers] = useState([])
  const [current, setCurrent] = useState([])
  const [runningTimer, setRunningTimer] = useState([])
  const [runningProject, setRunningProject] = useState([])

  useEffect(() => stopService(), [])
  useEffect(() => getProjects({ setProjects }), [online])
  useEffect(() => getRunningTimer({ setCount, start, stop, setRunningTimer }), [online])
  useEffect(() => getRunningProject({ setRunningProject, runningTimer }), [runningTimer])
  useEffect(() => getTimers({ current, timers, setCurrent, setTimers }), [online])
  useEffect(() => {
    store.dispatch(setProject(runningProject))
    store.dispatch(setTimer(runningTimer))
  }, [runningTimer])

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
          let project = projects[0]
          let title = project && project[1] ? project[1].name : 'Title'
          createTimer(project[0])
          start(title)
        }
      }} />
      <Button title='Stop Timer' style={styles.button} onPress={() => {
        if (!runningTimer || runningTimer.length === 0) console.log('No Running Timer')
        else {
          finishTimer(runningTimer)
          let project = projects[0]
          let title = project && project[1] ? project[1].name : 'Title'
          stop(title)
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
