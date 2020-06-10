# NodeJS Notify Native
Create a reboot tolerant persistent service for react native that runs a nodeJS instance in foreground or background with an updatable notification.

* Project is a Work In Progress, in Demo Mode for Testing

## Features
- runs a service in a separate thread
- service spawns a persistent notification
- service restarts on reboot
- service task defined in JS

## Future
* Heavily integrated with timer, could decouple and create build process...


## Install
```
npm i
```

## Running 
```
react-native run-android
```

## Notes
When testing remote with android emulator use `adb forward tcp:8765 tcp:8765` 

## ToDo
- decouple HeartbeatModule from timer example
- rename things for clarity
- cleanup unused files in repo
- wrap into module form for re-use

## Reference 
[Article](https://medium.com/reactbrasil/how-to-create-an-unstoppable-service-in-react-native-using-headless-js-93656b6fd5d1)

[Github](https://github.com/mathias5r/rn-heartbeat)

[Notification Docs](https://developer.android.com/training/notify-user/build-notification.html#Updating)