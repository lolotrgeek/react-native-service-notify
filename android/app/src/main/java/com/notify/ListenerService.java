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

import java.io.BufferedReader;
import java.net.ServerSocket;
import java.net.Socket;
import java.io.InputStreamReader;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;

public class ListenerService extends Service {

    private static final int SERVICE_NOTIFICATION_ID = 54321;
    private static final String CHANNEL_ID = "DATATASK";
    private static String TAG = "ServerSocketTest";
    public static String SERVER_IP = "192.168.1.109";
    public static final int SERVER_PORT = 8765;

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private Socket socket = null;

    Runnable conn = new Runnable() {
        public void run() {
            try {
                socket = new Socket(SERVER_IP, SERVER_PORT);
                Log.i(TAG, "Connected!");
                while (true) {
                    ObjectInputStream in = new InputStream(socket.getInputStream());

                    String msg = (String) in.readObject();

                    Log.i(TAG, msg);

                    in.close();
                    // socket.close();
                }
            } catch (IOException e) {
                Log.e(TAG, e.getMessage());
            } catch (Exception e) {
                Log.e(TAG, e.getMessage());
            }
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
        socket = null;
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