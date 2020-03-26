package com.notify;

import android.content.Intent;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import android.app.PendingIntent;
import android.app.NotificationManager;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import android.R.mipmap;

import javax.annotation.Nonnull;

public class HeartbeatModule extends ReactContextBaseJavaModule {

    public static final String REACT_CLASS = "Heartbeat";
    private static ReactApplicationContext reactContext;
    private static final int SERVICE_NOTIFICATION_ID = 12345;
    private static final String CHANNEL_ID = "HEARTBEAT";

    public HeartbeatModule(@Nonnull ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Nonnull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @ReactMethod
    public void startService() {
        this.reactContext.startService(new Intent(this.reactContext, HeartbeatService.class));
    }

    @ReactMethod
    public void stopService() {
        this.reactContext.stopService(new Intent(this.reactContext, HeartbeatService.class));
    }

    @ReactMethod
    public void notificationUpdate(String tick) {
        // send tick event
        this.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("Heartbeat", tick);
        // set Intent for what happens when tapping notification
        Intent notificationIntent = new Intent(this.reactContext, MainActivity.class);
        PendingIntent contentIntent = PendingIntent.getActivity(this.reactContext, 0, notificationIntent,
                PendingIntent.FLAG_CANCEL_CURRENT);

        // Build the notification
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this.reactContext, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher).setContentTitle(getName()).setContentText(tick)
                .setContentIntent(contentIntent).setPriority(NotificationCompat.PRIORITY_DEFAULT);

        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(this.reactContext);

        // send notification
        // SERVICE_NOTIFICATION_ID is a unique int for each notification that you must define
        notificationManager.notify(SERVICE_NOTIFICATION_ID, builder.build());

    }
}