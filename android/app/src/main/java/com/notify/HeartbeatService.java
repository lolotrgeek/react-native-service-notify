package com.notify;

import android.app.Notification;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.os.IBinder;

import androidx.annotation.RequiresApi;
import androidx.core.app.NotificationCompat;
import android.app.NotificationManager;
import android.app.NotificationChannel;
import android.os.Build;


public class HeartbeatService extends DataService {

    private static final int SERVICE_NOTIFICATION_ID = 12345;
    private static final String CHANNEL_ID = "HEARTBEAT";
    private static int INTERVAL = 1000;
    private static HeartbeatService instance;
    // private int CURRENT_TICK = 0;

    private Handler countHandler = new Handler();
    private Runnable runnableCode = new Runnable() {
        @Override
        public void run() {
            countHandler.postDelayed(this, INTERVAL);
        }
    };

    public static HeartbeatService getInstance() {
        return instance;
    }
    public void setRunnableInterval(int ms) {
        INTERVAL = ms;
    }

    // resumes the countHandler, use carefully, can cause service to step on itself
    // TODO: make this a closure
    public void resume() {
        this.countHandler.post(this.runnableCode);
    }

    // suspends the countHandler, use carefully, can cause service to step on itself
    // TODO: make this a closure
    public void pause() {
        this.countHandler.removeCallbacks(this.runnableCode);
    }


    private void createNotificationChannel() {
        // Create the NotificationChannel, but only on API 26+ because
        // the NotificationChannel class is new and not in the support library
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            int importance = NotificationManager.IMPORTANCE_LOW;
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "HEARTBEAT", importance);
            channel.setDescription("CHANEL DESCRIPTION");
            channel.setSound(null, null);
            channel.setShowBadge(false);
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    @Override
    public void onCreate() {
        instance = this;
        super.onCreate();
    }

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    @Override
    public void onDestroy() {
        super.onDestroy();
        this.countHandler.removeCallbacks(this.runnableCode);
    }

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        createNotificationChannel();
        super.init();
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent contentIntent = PendingIntent.getActivity(this, 0, notificationIntent,
                PendingIntent.FLAG_CANCEL_CURRENT);

        String title = intent.getStringExtra("Timer");
        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID).setContentTitle(title)
                .setContentText("Ready...").setSmallIcon(R.mipmap.ic_launcher).setContentIntent(contentIntent)
                .setOnlyAlertOnce(true).setPriority(NotificationCompat.PRIORITY_HIGH).setOngoing(true).build();
        startForeground(SERVICE_NOTIFICATION_ID, notification);
        return START_STICKY;
    }
}