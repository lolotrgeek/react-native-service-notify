package com.notify;

import android.content.Intent;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import android.app.PendingIntent;
import android.app.NotificationManager;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import android.R.mipmap;

import android.widget.Toast;

import javax.annotation.Nonnull;

public class HeartbeatModule extends ReactContextBaseJavaModule {

    public static final String REACT_CLASS = "Heartbeat";
    private static ReactApplicationContext reactContext;
    private static final int SERVICE_NOTIFICATION_ID = 12345;
    private static final String CHANNEL_ID = "HEARTBEAT";
    private static String TITLE = "Title";
    private static String STATUS = "STOPPED";
    private static String COUNT = "PAUSED";
    private static String TICK;
    private static HeartbeatModule instance;

    public HeartbeatModule(@Nonnull ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    public static HeartbeatModule getInstance() {
        return instance;
    }

    @Nonnull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    public void setStatus(String status) {
        STATUS = status;
        // Toast.makeText(this.reactContext,STATUS,Toast.LENGTH_SHORT).show();
    }

    public void notificationPaused() {
        // set Intent for what happens when tapping notification
        Intent notificationIntent = new Intent(this.reactContext, MainActivity.class);
        PendingIntent contentIntent = PendingIntent.getActivity(this.reactContext, 0, notificationIntent,
                PendingIntent.FLAG_CANCEL_CURRENT);
        // Intend and Build Action Buttons
        Intent startIntent = new Intent(this.reactContext, HeartbeatActionReceiver.class);
        startIntent.putExtra("ACTION", "start");
        PendingIntent startPendingIntent = PendingIntent.getBroadcast(this.reactContext, 1, startIntent,
                PendingIntent.FLAG_UPDATE_CURRENT);

        NotificationCompat.Action buttonAction = new NotificationCompat.Action.Builder(R.mipmap.ic_launcher, "Start",
                startPendingIntent).build();

        // Build the notification
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this.reactContext, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher).setContentTitle(TITLE).setContentText(TICK)
                .setContentIntent(contentIntent).setPriority(NotificationCompat.PRIORITY_LOW).setOnlyAlertOnce(true)
                .setOngoing(false).addAction(buttonAction);
        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(this.reactContext);

        // send notification
        // SERVICE_NOTIFICATION_ID is a unique int for each notification that you must
        // define
        notificationManager.notify(SERVICE_NOTIFICATION_ID, builder.build());
    }

    @ReactMethod
    public void configService(String title) {
        TITLE = title;
    }

    @ReactMethod
    public void getStatus(Callback successCallback) {
        try {
            successCallback.invoke(instance.STATUS);
        } catch (Exception e) {

        }
    }

    @ReactMethod
    public void getCountStatus(Callback successCallback) {
        try {
            successCallback.invoke(instance.COUNT);
        } catch (Exception e) {

        }
    }

    @ReactMethod
    public void startService() {
        instance = this;
        if (STATUS == "STOPPED") {
            try {
                this.reactContext
                        .startService(new Intent(this.reactContext, HeartbeatService.class).putExtra("TITLE", TITLE));
                STATUS = "STARTED";
                this.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("STATUS",
                        STATUS);
            } catch (Exception e) {
                // TODO: handle exception, consider callback
            }
        }
    }

    @ReactMethod
    public void stopService() {
        if (STATUS == "STARTED") {
            try {
                this.reactContext.stopService(new Intent(this.reactContext, HeartbeatService.class));
                STATUS = "STOPPED";
                COUNT = "PAUSED";
                // notificationPaused();
                this.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("STATUS", STATUS);
            } catch (Exception e) {
                // TODO: handle exception, consider callback
            }
        }
    }

    @ReactMethod
    public void startAction() {
        if (STATUS == "STOPPED") {
            startService();
        }
        if (COUNT == "PAUSED" & STATUS == "STARTED") {
            try {
                HeartbeatService.getInstance().resume();
                this.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("ACTION", "start");
                COUNT = "RUNNING";
            } catch (Exception e) {
                // TODO: handle exception
            }
        }
    }

    @ReactMethod
    public void stopAction() {
        if (STATUS == "STOPPED") {
            startService();
        }
        if (COUNT == "RUNNING" & STATUS == "STARTED") {
            try {
                HeartbeatService.getInstance().pause();
                notificationPaused();
                this.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("ACTION", "stop");
                COUNT = "PAUSED";
            } catch (Exception e) {
                // TODO: handle exception
            }
        } 
    }

    @ReactMethod
    public void startActionRemote() {
        if (STATUS == "STOPPED") {
            startService();
        }
        if (COUNT == "PAUSED" & STATUS == "STARTED") {
            try {
                HeartbeatService.getInstance().resume();
                COUNT = "RUNNING";
            } catch (Exception e) {
                // TODO: handle exception
            }
        }
    }

    @ReactMethod
    public void stopActionRemote() {
        if (STATUS == "STOPPED") {
            startService();
        }
        if (COUNT == "RUNNING" & STATUS == "STARTED") {
            try {
                HeartbeatService.getInstance().pause();
                COUNT = "PAUSED";
            } catch (Exception e) {
                // TODO: handle exception
            }
        }
    }

    @ReactMethod
    public void notificationUpdate(int tick) {
        TICK = Integer.toString(tick);
        // send tick event
        this.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("Heartbeat", tick);
        // set Intent for what happens when tapping notification
        Intent notificationIntent = new Intent(this.reactContext, MainActivity.class);
        PendingIntent contentIntent = PendingIntent.getActivity(this.reactContext, 0, notificationIntent,
                PendingIntent.FLAG_CANCEL_CURRENT);
        // Intend and Build Action Buttons
        Intent actionIntent = new Intent(this.reactContext, HeartbeatActionReceiver.class);
        actionIntent.putExtra("ACTION", "stop");
        PendingIntent actionPendingIntent = PendingIntent.getBroadcast(this.reactContext, 1, actionIntent,
                PendingIntent.FLAG_UPDATE_CURRENT);

        NotificationCompat.Action buttonAction = new NotificationCompat.Action.Builder(R.mipmap.ic_launcher, "Stop",
                actionPendingIntent).build();

        // Build the notification
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this.reactContext, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher).setContentTitle(TITLE).setContentText(TICK)
                .setContentIntent(contentIntent).setPriority(NotificationCompat.PRIORITY_LOW).setOnlyAlertOnce(true)
                .setOngoing(true).addAction(buttonAction);
        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(this.reactContext);

        // send notification
        // SERVICE_NOTIFICATION_ID is a unique int for each notification that you must
        // define
        notificationManager.notify(SERVICE_NOTIFICATION_ID, builder.build());

    }
}