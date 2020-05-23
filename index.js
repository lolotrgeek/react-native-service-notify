import React from 'react';
import { AppRegistry, Platform } from 'react-native';
import App from './src/App';

import { name as appName } from './src/app.json';

AppRegistry.registerComponent('Notify', () => App);

if (Platform.OS === 'web') {
  const rootTag = document.getElementById('root') || document.getElementById('main');
  AppRegistry.runApplication('Notify', { rootTag });
}
