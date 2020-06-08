import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, NativeEventEmitter, NativeModules, FlatList } from 'react-native';
import * as Data from './Data'

const { Heartbeat } = NativeModules;
const deviceEmitter = new NativeEventEmitter(Heartbeat)

const debug = false

export default function App() {

  const [online, setOnline] = useState([])
  const [status, setStatus] = useState([])
  const [projects, setProjects] = useState([])
  const [timers, setTimers] = useState([])
  const [count, setCount] = useState(0)

  const running = useRef({ id: 'none' })
  // const runningProject = useRef({})
  // const count = useRef(0)

  useEffect(() => Heartbeat.get('running'), [online])

  useEffect(() => {
    // Listens for Data 'done' events, filters them for display
    // OPTIMIZE, could remove listeners for running in favor of node's runningTimer()
    deviceEmitter.addListener("done", event => {
      let item = JSON.parse(event)
      debug && console.log('[react] Done.')
      item = Data.trimSoul(item)
      debug && console.log(typeof item + ' ', item)

      if (typeof item === 'object') {
        for (id in item) {
          try {
            let value = JSON.parse(item[id])
            // console.log(`item ${typeof value}`, value)
            if (value.type === 'project') {
              setProjects(projects => [...projects, value])
            }
          } catch (error) {
            console.log(error)
          }
        }

        if (item.id === running.current.project) {
          // runningProject.current = item
          running.current.color = item.color
          running.current.name = item.name
        }
      }
      if (item.type === 'timer') {
        debug && console.log('[react] timer.')
        if (item.status === 'running') {
          // setRunning(item)
          running.current = item
          debug && console.log('[react] running')
          debug && console.log(running)
          Data.getProject(item.project)
        }
        else if (item.status === 'done' && item.id === running.current.id) {
          debug && console.log('[react] STOP')
          debug && console.log(item)
          // setRunning(item)
          running.current = item
        }
        setTimers(timers => [...timers, item])
      }
    })

    return () => deviceEmitter.removeAllListeners("done")
  }, [])

  useEffect(() => {
    deviceEmitter.addListener("count", event => {
      setCount(event)
    })
    return () => deviceEmitter.removeAllListeners("count")

  }, [])

  useEffect(() => {
    deviceEmitter.addListener("running", event => {
      let item = JSON.parse(event)
      running.current = item
      debug && console.log('[react] running')
      debug && console.log(running)
    })
    return () => deviceEmitter.removeAllListeners("running")
  }, [])

  // useEffect(() => Data.createProject('react project', '#ccc'), [online])
  // useEffect(() => Data.createProject('test project', '#ccc'), [online])
  useEffect(() => Data.getProjects(), [online])

  const onRefresh = () => {

  };
  const renderRow = ({ item }) => {
    return (

      <Text style={{ color: 'red' }}>{item.id}</Text>

    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <Text styles={styles.status}>{status}</Text>
      {/* <Text>{projects.length > 0 ? projects[0].name : 'first project'}</Text> */}
      <Text>{running.current.name}</Text>
      <Text>{running.current.status === 'done' || running.current.id === 'none' ? 'Last Run: ' + running.current.id : 'Running: ' + running.current.id}</Text>
      <Text>{count}</Text>
      {running.current.status !== 'running' || running.current.id === 'none' ?
        <Button title='start' onPress={() => Data.createTimer(projects[0].id)} /> :
        <Button title='stop' onPress={() => Data.finishTimer(running.current)} />
      }
      {projects[1] && projects[1].id ?
        <Button title='test' onPress={() => Data.createTimer(projects[1].id)} /> :
        <Text>No Second project</Text>
      }
      <SafeAreaView style={styles.container}>
        {console.log(projects)}
        <FlatList
          data={projects}
          // refreshing={refresh}
          renderItem={renderRow}
          keyExtractor={project => project.id}
        // onRefresh={onRefresh()}
        />
      </SafeAreaView>

    </SafeAreaView>
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
