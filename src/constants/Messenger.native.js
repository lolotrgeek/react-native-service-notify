/* eslint-disable no-undef */
import { NativeModules, NativeEventEmitter } from 'react-native';
const { Heartbeat } = NativeModules;
export default messenger = new NativeEventEmitter(Heartbeat)
