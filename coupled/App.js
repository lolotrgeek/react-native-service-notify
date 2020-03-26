import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, NativeEventEmitter } from 'react-native';
import { setHeartBeat, store } from '../store';
import { connect } from 'react-redux';
import Heartbeat from '../Heartbeat';

function App({ heartBeat }) {

  return (
    <View style={styles.container}>
      <Text>{heartBeat}</Text>
      <Button title='Start' style={styles.button} onPress={() => Heartbeat.startService()} />
      <Button title=' Stop Service' style={styles.button} onPress={() => Heartbeat.stopService()} />
      <Button title='Clear' onPress={() => { store.dispatch(setHeartBeat(0)); }} />
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

const mapStateToProps = store => ({
  heartBeat: store.App.heartBeat,
});

export default connect(mapStateToProps)(App);