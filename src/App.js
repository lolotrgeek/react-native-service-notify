import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, NativeEventEmitter, NativeModules, FlatList } from 'react-native';
import { parse, dateToday } from './Functions'
import * as Data from './Data'

const { Heartbeat } = NativeModules;
const deviceEmitter = new NativeEventEmitter(Heartbeat)

const debug = true

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
    deviceEmitter.addListener("put", event => {
      if (!event) return
      debug && console.log('[react] successful put.')
      let item = parse(event)
      item = Data.trimSoul(item)
      debug && console.log('put ' + typeof item + ' ', item)
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
        // setTimers(timers => [...timers, item])
      }
    })

    return () => deviceEmitter.removeAllListeners("put")

  }, [])

  useEffect(() => {

    deviceEmitter.addListener("projects", event => {
      if (!event) return
      debug && console.log('[react] successful projects get.')
      let item = parse(event)
      debug && console.log('get ' + typeof item + ' ', item)
      if (typeof item === 'object') {
        for (id in item) {
          try {
            let value = JSON.parse(item[id])
            // console.log(`item ${typeof value}`, value)
            if (value.type === 'project') {
              let alreadyInProjects = projects.some(project => project.id === value.id)
              if (!alreadyInProjects) {
                setProjects(projects => [...projects, value])
              }
              // if (running.current.project && item.id === running.current.project) {
              //   running.current.color = item.color
              //   running.current.name = item.name
              // }
            }
          } catch (error) {
            console.log(error)
          }

        }
      }
    })
    return () => deviceEmitter.removeAllListeners("projects")
  }, [online])

  const timerParse = (found) => {
    try {
      // console.log(`item ${typeof value}`, value)
      if (found.type === 'timer') {
        let alreadyFound = timers.some(timer => timer.id === found.id)
        if (!alreadyFound) {
          setTimers(timers => [...timers, found])
        }
        if (timer.status === 'running') {
          // setRunning(item)
          running.current = timer
          debug && console.log('[react] running')
          debug && console.log(running)
          // Data.getProject(item.project)
        }
        else if (timer.status === 'done' && timer.id === running.current.id) {
          debug && console.log('[react] STOP')
          debug && console.log(timer)
          // setRunning(item)
          running.current = timer
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    console.log(`msg listener : timers`)
    deviceEmitter.addListener("timers", event => {
      if (!event) return
      debug && console.log('[react] msg timers get.')
      let item = parse(event)
      debug && console.log('timers get ' + typeof item + ' ', item)
      if (Array.isArray(item)) {
        item.map(found => {
          timerParse(parse(found))
        })
      }
      else if (typeof item === 'object') {
        for (id in item) {
          let found = parse(item[id])
          timerParse(parse(found))
        }

      }
    })

    return () => deviceEmitter.removeAllListeners("timers")
  }, [online])

  // useEffect(() => {
  //   if (projects.length > 0 && typeof projects[0] === 'object' && projects[0].id) {
  //     console.log(`msg listener : timers/project/${projects[0].id}`)
  //     deviceEmitter.addListener(`timers/project/${projects[0].id}`, event => {
  //       debug && console.log('[react] msg timers get.')
  //       let item = parse(event)
  //       debug && console.log('timers/project get ' + typeof item + ' ', item)

  //       // handle getting a set from gun
  //       let timerIds = Object.values(item)
  //       timerIds.map(timerId => {
  //         Data.getTimer(timerId)
  //       })
  //     })

  //     return () => deviceEmitter.removeAllListeners(`timers/project/${projects[0].id}`)
  //   }
  // }, [online])

  useEffect(() => {
    deviceEmitter.addListener("count", event => {
      setCount(event)
    })
    return () => deviceEmitter.removeAllListeners("count")

  }, [])

  useEffect(() => {
    deviceEmitter.addListener("running", event => {
      let item = JSON.parse(event)
      if (item && typeof item === 'object' && typeof item === 'object' && item.status === 'running') {
        running.current = item
      }
      debug && console.log('[react] running')
      debug && console.log(running)
    })
    return () => deviceEmitter.removeAllListeners("running")
  }, [])

  useEffect(() => {
    if (projects.length > 0 && typeof projects[0] === 'object' && projects[0].id && timers.length < 10) {
      let i = 0
      while (i < 50) {
        Data.generateTimer(projects)
        i++
      }
    }
  }, [online])

  useEffect(() => {
    console.log('Get projects...')
    Data.getProjects()
  }, [online])


  useEffect(() => {
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
        <FlatList
          data={timers}
          // refreshing={refresh}
          renderItem={renderTimer}
          keyExtractor={timer => timer.id}
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
