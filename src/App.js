import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { setHeartBeat, store } from './store';
import useCounter from './useCounterNative'
import {gun} from './Data'

export default function App() {
  const { status, count, setCount, start, stop, startService, stopService } = useCounter()
  return (
    <View style={styles.container}>
      <Text style={{color: status === "STARTED" ? 'green' : 'red' }}>{status}</Text>
      <Text>{count}</Text>
      <Button title='Start Service' style={styles.button} onPress={() => {startService()}} />
      <Button title='Start Counter' style={styles.button} onPress={() => {start()}} />
      <Button title='Stop Counter' style={styles.button} onPress={() => stop()} />
      <Button title='Stop Service' style={styles.button} onPress={() => stopService()} />
      <Button title='Clear' style={styles.button} onPress={() => { store.dispatch(setHeartBeat(0)); setCount(0); }} />
      <Button title='Data' style={styles.button} onPress={() => gun.get('test').put({test: 'dataApp'})} />
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
  status : {
    
    fontSize: 30,
  }
});
