import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, NativeEventEmitter, NativeModules, FlatList } from 'react-native';
import { parse, dateToday } from './Functions'
import * as Data from './Data'
import { putHandler, projectHandler, projectsHandler, timersHandler, runningHandler } from './Handlers'

const { Heartbeat } = NativeModules;
const deviceEmitter = new NativeEventEmitter(Heartbeat)

const debug = true
const test = false

export default function App() {

  const [online, setOnline] = useState(false)
  const [status, setStatus] = useState([])
  const [projects, setProjects] = useState([])
  const [timers, setTimers] = useState([])
  const [count, setCount] = useState(0)

  const running = useRef({ id: 'none', name: 'none', project: 'none' })
  // const projects = useRef(projects[0])

  useEffect(() => Heartbeat.get('running'), [online])

  useEffect(() => {
    deviceEmitter.addListener("put", event => putHandler(event, {running, setTimers, running}))
    return () => deviceEmitter.removeAllListeners("put")
  }, [])

  useEffect(() => {
    deviceEmitter.addListener("count", event => setCount(event))
    return () => deviceEmitter.removeAllListeners("count")
  }, [])

  useEffect(() => {
    deviceEmitter.addListener("running", event => runningHandler(event, {running}))
    return () => deviceEmitter.removeAllListeners("running")
  }, [])

  useEffect(() => {
    deviceEmitter.addListener("projects", event => projectsHandler(event, {projects, setProjects, running}))
    deviceEmitter.addListener("project", event => projectHandler(event, {projects, setProjects, running}))
    deviceEmitter.addListener("timers", event => timersHandler(event, {timers, setTimers, running }))
    deviceEmitter.addListener("timer", event => timersHandler(event, {timers, setTimers, running }))
    return () => {
      deviceEmitter.removeAllListeners("projects")
      deviceEmitter.removeAllListeners("project")
      deviceEmitter.removeAllListeners("timers")
      deviceEmitter.removeAllListeners("timer")
    }
  }, [online])

  useEffect(() => {
    // TEST GENERATOR
    if (test && projects.length > 0 && typeof projects[0] === 'object' && projects[0].id && timers.length < 10) {
      let i = 0
      while (i < 50) {
        Data.generateTimer(projects)
        i++
      }
    }
  }, [])

  useEffect(() => {
    console.log('Get projects...')
    Data.getProjects()
    console.log('Get timers...')
    Data.getTimers()
    // if (projects.length > 0 && typeof projects[0] === 'object' && projects[0].id) {
    //   Data.getProjectTimers(projects[0].id)
    // }
    // Data.getDayTimers()
  }, [online])


  const onRefresh = () => {

  };

  const renderRow = ({ item }) => {
    return (
      <View style={{ flexDirection: 'row', margin: 10 }}>
        <View style={{ width: '50%' }}>
          <Text style={{ color: 'red' }}>{item.id}</Text>
        </View>
        <View style={{ width: '50%' }}>
          <Button title='start' onPress={() => {
            Data.finishTimer(running.current)
            Data.createTimer(item.id)
          }} />
        </View>
      </View>
    );
  };

  const renderTimer = ({ item }) => {
    return (
      <View style={{ flexDirection: 'row', margin: 10 }}>
        <Text style={{ color: 'red' }}>{item.id}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {projects.length === 0 ? <Button title='Begin' onPress={() => {
        Data.createProject('react project', '#ccc')
        Data.createProject('test project', '#ccc')
        setOnline(!online)
      }} /> : <Button title='Refresh' onPress={() => setOnline(!online)} />}
      <Text>{running.current.name ? running.current.name : ''}</Text>
      <Text>{'Project: ' + running.current.project ? running.current.project : ''}</Text>
      <Text>{running.current.status === 'done' || running.current.id === 'none' ? 'Last Run: ' + running.current.id : 'Running: ' + running.current.id}</Text>
      <Text>{count}</Text>
      {running.current.status === 'done' || running.current.id === 'none' ?
        <Text >Not Running</Text> :
        <Button title='stop' onPress={() => { Data.finishTimer(running.current); setOnline(!online) }} />
      }


      <SafeAreaView style={styles.list}>
        <FlatList
          data={projects}
          // refreshing={refresh}
          renderItem={renderRow}
          keyExtractor={project => project.id}
          onEndReached={() => {

          }}
        // onRefresh={onRefresh()}
        />
      </SafeAreaView>
      <Text>Timers: </Text>
      <SafeAreaView style={styles.list}>
        {/* <FlatList
          data={timers}
          // refreshing={refresh}
          renderItem={renderTimer}
          keyExtractor={timer => timer.id}
        // onRefresh={onRefresh()}
        /> */}
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
  list: {
    flexDirection: 'row'
  },
  button: {
    margin: 20,
  },
  status: {
    fontSize: 30,
  }
});
