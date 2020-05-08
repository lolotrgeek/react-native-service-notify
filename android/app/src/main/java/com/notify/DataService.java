package com.notify;

import android.app.Service;
import android.app.PendingIntent;
import android.content.Intent;
import android.os.IBinder;
import android.os.Bundle;
import androidx.annotation.Nullable;
import android.app.Notification;
import androidx.core.app.NotificationCompat;
import android.app.NotificationManager;
import android.app.NotificationChannel;
import android.os.Build;
import android.util.Log;
import java.text.DecimalFormat;

import org.liquidplayer.javascript.JSValue;
import org.liquidplayer.javascript.JSContext;

public class DataService extends Service {
    private static final int SERVICE_NOTIFICATION_ID = 54321;
    private static final String CHANNEL_ID = "DATATASK";
    private static String TAG = "DataService";

    JSContext context = new JSContext();

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    Runnable conn = new Runnable() {
        public void run() {
            context.evaluateScript("a = 10");
            JSValue newAValue = context.property("a");
            DecimalFormat df = new DecimalFormat(".#");
            Log.i(TAG, df.format(newAValue.toNumber())); // 10.0
        }
    };

    @Override
    public void onCreate() {
        super.onCreate();
        new Thread(conn).start();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.i(TAG, "Killing Listener...");
    }

    private void createNotificationChannel() {
        // Create the NotificationChannel, but only on API 26+ because
        // the NotificationChannel class is new and not in the support library
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            int importance = NotificationManager.IMPORTANCE_LOW;
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "DATATASK", importance);
            channel.setDescription("CHANEL DESCRIPTION");
            channel.setSound(null, null);
            channel.setShowBadge(false);
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.i(TAG, "Starting Listener...");
        createNotificationChannel();
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent contentIntent = PendingIntent.getActivity(this, 0, notificationIntent,
                PendingIntent.FLAG_CANCEL_CURRENT);
        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID).setContentTitle("Listener Task")
                .setContentText("Ready...").setSmallIcon(R.mipmap.ic_launcher).setContentIntent(contentIntent)
                .setOnlyAlertOnce(true).setPriority(NotificationCompat.PRIORITY_HIGH).setOngoing(true).build();
        startForeground(SERVICE_NOTIFICATION_ID, notification);
        return START_STICKY;
    }
}