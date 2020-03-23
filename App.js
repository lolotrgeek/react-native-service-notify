import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import NotifService from './NotifService';
import useCounter from './useCounter'

export default function App() {
  const { count, setCount, start, stop } = useCounter(1000, false);

  function onNotif(notif) {
    console.log(notif);
    // Alert.alert(notif.title, notif.message);
  }

  const notif = new NotifService(onNotif.bind());

  useEffect(() => {
    if(count) notif.localNotif('Count : ' + count)
  }, [count])

  return (
    <View style={styles.container}>
      <Text>{count}</Text>
      <Button title='Start' onPress={() => {
        setCount(0)
        start()
      }} />
      <Button title='Stop' onPress={() => stop()} />
      <Button title='Clear' onPress={() => { setCount(0); notif.cancelAll() }} />
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
