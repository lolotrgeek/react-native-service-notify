# Notify Native
Create a reboot tolerant persistent service for react native that runs in foreground or background with an updatable notification.

* Project is a Work In Progress, in Demo Mode for Testing

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

## Notes
Decoupling is achieved by using redux for the service state and useEffect for the app state. The Service state is accessed with a deviceEvent listener.

This allows for greater flexibility on the front-end and predictablity on the backend.

If decoupling doesn't matter then the Service state (defined in index.js) can shared with the app state by passing it via a prop.

## ToDo
- decouple HeartbeatModule from timer example
- rename things for clarity
- cleanup unused files in repo
- wrap into module form for re-use

## Reference 
[Article](https://medium.com/reactbrasil/how-to-create-an-unstoppable-service-in-react-native-using-headless-js-93656b6fd5d1)

[Github](https://github.com/mathias5r/rn-heartbeat)

[Notification Docs](https://developer.android.com/training/notify-user/build-notification.html#Updating)