# Notify Native
Create a reboot tolerant persistent service for react native that runs in foreground or background with an updatable notification.

## Features
- uses HeadlessJS
- runs a service in a separate thread
- service spawns a persistent notification
- service restarts on reboot
- service task defined in JS
- uses redux for headless data store

## Running 
```
react-native run-android
```

## ToDo
- decouple HeartbeatModule from timer example

## Reference 
[Article](https://medium.com/reactbrasil/how-to-create-an-unstoppable-service-in-react-native-using-headless-js-93656b6fd5d1)
[Github](https://github.com/mathias5r/rn-heartbeat)
[Notification Docs](https://developer.android.com/training/notify-user/build-notification.html#Updating)