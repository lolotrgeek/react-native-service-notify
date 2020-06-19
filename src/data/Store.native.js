import { NativeModules } from 'react-native';
const { Heartbeat } = NativeModules;

// this spans between React and HearbeatModule.java
export const store = Heartbeat

/**
 * HeartbeatModule.java does the Object mapping for this function for node Store.putAll(msg)
 * @param {string} key 
 * @param {*} value 
 */
export function put(key, value) {
    // do validation here...
    store.put(key, JSON.stringify(value))
}

/**
 * HeartbeatModule.java does the Object mapping for this function for node Store.putAll(msg)
 * @param {string} key 
 * @param {*} value 
 */
export function set(key, value) {
    // do validation here...
    store.set(key, JSON.stringify(value))
}

/**
 * 
 * @param {string} key 
 */
export function get(key) {
    // do validation here...
    store.get(key)
}

/**
 * 
 * @param {string} key
 * @param {object} filter removes data that does not match given key/value pair
 * @param {string} filter.key 
 * @param {*} filter.value
 * @issue gets all data then filters, would be better to ignore while getting not after
 */
export function getAll(key, filter) {
    // do validation here...
    store.getAll(key, JSON.stringify(filter))
}
