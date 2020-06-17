import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, NativeEventEmitter, NativeModules, FlatList } from 'react-native';
import { parse, dateToday, totalOver, totalTime } from './Functions'
import * as Data from './Data'
import { putHandler, projectHandler, projectsHandler, timersHandler, runningHandler, timerHistoryHandler } from './Handlers'

const { Heartbeat } = NativeModules;
const deviceEmitter = new NativeEventEmitter(Heartbeat)

const debug = false
const test = false

export default function App() {

  const [online, setOnline] = useState(false)
  const [projects, setProjects] = useState([])
  const [timers, setTimers] = useState([])
  const [timerHistory, setTimerHistory] = useState([])
  const [count, setCount] = useState(0)

  const running = useRef({ id: 'none', name: 'none', project: 'none' })
  // const projects = useRef(projects[0])

  useEffect(() => Heartbeat.get('running'), [online])

  useEffect(() => {
    deviceEmitter.addListener("put", event => putHandler(event, { running, setTimers }))
    return () => deviceEmitter.removeAllListeners("put")
  }, [])

  useEffect(() => {
    deviceEmitter.addListener("count", event => setCount(event))
    return () => deviceEmitter.removeAllListeners("count")
  }, [])

  useEffect(() => {
    deviceEmitter.addListener("running", event => runningHandler(event, { running: running }))
    return () => deviceEmitter.removeAllListeners("running")
  }, [])

  useEffect(() => {
    deviceEmitter.addListener("projects", event => projectsHandler(event, { projects, setProjects, running }))
    deviceEmitter.addListener("timers", event => timersHandler(event, { timers, setTimers, running }))
    deviceEmitter.addListener(`history/timers/${running.current.id}`, event => timerHistoryHandler(event, { timerHistory, setTimerHistory }))
    return () => {
      deviceEmitter.removeAllListeners("projects")
      deviceEmitter.removeAllListeners("timers")
      deviceEmitter.removeAllListeners(`history/timers/${running.current.id}`)
    }
  }, [online])

  useEffect(() => {
    // TEST GENERATOR
    let amount = 100
    if (test && projects.length > 0 && timers.length < amount) {
      let i = 0
      while (i < amount) {
        Data.generateTimer(projects)
        i++
      }
    }
  }, [online])

  useEffect(() => {
    console.log('Get projects...')
    Data.getProjects()
    console.log('Get timers...')
    Data.getTimers()

    Data.getTimerHistory(running.current.id)
    // if (projects.length > 0 && typeof projects[0] === 'object' && projects[0].id) {
    //   Data.getProjectTimers(projects[0].id)
    // }
    // Data.getDayTimers()
  }, [online])

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
            setOnline(!online)
          }} />
        </View>
      </View>
    );
  };

  const renderTimer = ({ item }) => {
    return (
      <View style={{ flexDirection: 'row', margin: 10 }}>
        <View style={{ width: '30%' }}>
          <Text style={{ color: 'red' }}>{item.id}</Text>
        </View>
        <View style={{ width: '30%' }}>
          <Text style={{ color: 'red' }}>{JSON.stringify(item.project)}</Text>
        </View>
        <View style={{ width: '30%' }}>
          <Text style={{ color: 'red' }}>{totalTime(item.started, item.ended)}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flexDirection: 'row', margin: 10 }}>
        {projects.length === 0 ? <Button title='Begin' onPress={() => {
          Data.createProject('react project', '#ccc')
          Data.createProject('test project', '#ccc')
          setOnline(!online)
        }} /> : <Button title='Refresh' onPress={() => setOnline(!online)} />}
        <Button title='Clear' onPress={() => {
          running.current = { id: 'none', name: 'none', project: 'none' }
          setTimers([])
          setTimerHistory([])
          setOnline(!online)
          }} />
      </View>


      <View style={{ flexDirection: 'row', margin: 10 }}>
        <View style={{ width: '25%' }}>
          <Text>{'Project: ' + running.current.project ? running.current.project : ''}</Text>
          <Text>{running.current.name ? running.current.name : ''}</Text>
        </View>
        <View style={{ width: '25%' }}>
          <Text>{running.current.status === 'done' || running.current.id === 'none' ? 'Last Run: ' + running.current.id : 'Running: ' + running.current.id}</Text>
        </View>
        <View style={{ width: '25%' }}>
          <Text>{count}</Text>
        </View>
        <View style={{ width: '25%' }}>
          {!running.current || running.current.id === 'none' ?
            <Text>No Running Timer</Text> : running.current.status === 'done' ?
              //TODO: assuming that project exists on start... needs validation
              <Button title='start' onPress={() => { Data.createTimer(running.current.project); setOnline(!online) }} /> :
              <Button title='stop' onPress={() => { Data.finishTimer(running.current); setOnline(!online) }} />
          }
        </View>
      </View>

      <View style={styles.list}>
        <FlatList
          data={projects}
          renderItem={renderRow}
          keyExtractor={project => project.id}
        />
      </View>
      <Text>Running Timer History: </Text>
      <View style={styles.list}>
        <FlatList
          data={timerHistory}
          style={{ height: 150 }}
          renderItem={renderTimer}
          keyExtractor={timer => timer.key}
        />
      </View>
      <Text>Timers: </Text>
      <View style={styles.list}>
        <FlatList
          data={timers}
          style={{ height: 150 }}
          renderItem={renderTimer}
          keyExtractor={timer => timer.id}
        />
      </View>

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
    flexDirection: 'row',
    backgroundColor: '#ccc'
  },
  button: {
    margin: 20,
  },
  status: {
    fontSize: 30,
  }
});
