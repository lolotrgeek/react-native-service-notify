package com.notify;

import android.app.Notification;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.os.IBinder;
import androidx.core.app.NotificationCompat;
import android.app.NotificationManager;
import android.app.NotificationChannel;
import android.os.Build;
import android.os.Message;

import com.facebook.react.HeadlessJsTaskService;

public class HeartbeatService extends Service {

    private static final int SERVICE_NOTIFICATION_ID = 12345;
    private static final String CHANNEL_ID = "HEARTBEAT";
    private static int INTERVAL = 1000;
    private static HeartbeatService instance;
    // private int CURRENT_TICK = 0;

    private Handler countHandler = new Handler();
    private Handler msgHandler = new Handler();
    private Handler dataHandler = new Handler();
    private Runnable runnableCode = new Runnable() {
        @Override
        public void run() {
            Context context = getApplicationContext();
            Intent myIntent = new Intent(context, HeartbeatEventService.class);
            context.startService(myIntent);
            HeadlessJsTaskService.acquireWakeLockNow(context);
            // Here is the 'actual' logic of the service
            countHandler.postDelayed(this, INTERVAL);
        }
    };
    private Runnable runnableDataCode = new Runnable() {
        @Override
        public void run() {
            Context context = getApplicationContext();
            Intent myIntent = new Intent(context, DataEventService.class);
            context.startService(myIntent);
            HeadlessJsTaskService.acquireWakeLockNow(context);
            // Here is the 'actual' logic of the service
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

    public void postInt(int num) {
        Message message = new Message();
        message.what = SERVICE_NOTIFICATION_ID;
        message.arg1 = num;
        this.msgHandler.sendMessage(message);
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

    @Override
    public void onCreate() {
        instance = this;
        super.onCreate();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        this.countHandler.removeCallbacks(this.runnableCode);
        this.dataHandler.removeCallbacks(this.runnableDataCode);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        this.dataHandler.post(this.runnableDataCode);
        createNotificationChannel();
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent contentIntent = PendingIntent.getActivity(this, 0, notificationIntent, PendingIntent.FLAG_CANCEL_CURRENT);

        String title = intent.getStringExtra("TITLE");
        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText("Ready...")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(contentIntent)
            .setOnlyAlertOnce(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .build();
        startForeground(SERVICE_NOTIFICATION_ID, notification);
        return START_STICKY;
    }
}