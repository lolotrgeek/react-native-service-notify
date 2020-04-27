import React, { useEffect, useState } from 'react';
import { NativeEventEmitter } from 'react-native';
import Heartbeat from './HeartbeatModule';
import { store } from './store';
import { gun } from './Data'


const deviceEmitter = new NativeEventEmitter(Heartbeat)

export default function useCounter(countdown) {
  const [count, setCount] = useState(0)
  const [status, setStatus] = useState('Waiting...')
  const [state, setState] = useState('PAUSED')

  useEffect(() => {
    let state = store.getState()
    if (state.App.heartBeat > 0) {
      setCount(state.App.heartBeat)
    }
    console.log('listening...')
    deviceEmitter.addListener("Heartbeat", event => {
      console.log('Device Event: ', event)
      setCount(event)
    })
    return () => { setCount(0); deviceEmitter.removeAllListeners("Heartbeat"); console.log('stop listening') }
  }, [])

  useEffect(() => {
    Heartbeat.getStatus(state => setStatus(state))
    deviceEmitter.addListener("STATUS", event => {
      console.log('Service Status: ', event)
      setStatus(event)
    })
    return () => { setStatus(''); deviceEmitter.removeAllListeners("STATUS") }
  }, [])

  useEffect(() => {
    Heartbeat.getCountStatus(state => setState(state))
    deviceEmitter.addListener("ACTION", event => {
      console.log('Action: ', event)
      Heartbeat.getCountStatus(state => setState(state))
    })
    return () => { setStatus(''); deviceEmitter.removeAllListeners("ACTION") }
  }, [])

  const startService = () => Heartbeat.startService()
  const start = () => gun.get('test').get('running').put("RUNNING") 
  const stop = () => gun.get('test').get('running').put("PAUSED")  
  const stopService = () => Heartbeat.stopService()
  const reset = () => { stop; setCount(0) }

  return { status, state, count, setCount, start, stop, reset, startService, stopService };
}