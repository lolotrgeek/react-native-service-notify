import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { setHeartBeat, store } from './store';
import useCounter from './useCounterNative'

export default function App() {
  const { count, setCount, start, stop, startService, stopService } = useCounter()

  return (
    <View style={styles.container}>
      <Text>{count}</Text>
      <Button title='Start Service' style={styles.button} onPress={() => {startService()}} />
      <Button title='Start Counter' style={styles.button} onPress={() => {start()}} />
      <Button title='Stop Counter' style={styles.button} onPress={() => stop()} />
      <Button title='Stop Service' style={styles.button} onPress={() => stopService()} />
      <Button title='Clear' onPress={() => { store.dispatch(setHeartBeat(0)); setCount(0); }} />
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
});
