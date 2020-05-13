package com.notify;

import android.app.Service;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.Context;
import android.os.AsyncTask;
import android.os.IBinder;

import android.app.Notification;
import androidx.core.app.NotificationCompat;
import android.app.NotificationManager;
import android.app.NotificationChannel;
import android.os.Build;
import android.util.Log;


import java.net.URL;
import java.io.BufferedReader;
import java.io.InputStreamReader;


public class DataService extends Service {
    private static final int SERVICE_NOTIFICATION_ID = 54321;
    private static final String CHANNEL_ID = "DATATASK";
    private static String TAG = "DataService";
    // Used to load the 'native-lib' library on application startup.
    static {
        System.loadLibrary("native-lib");
        System.loadLibrary("node");
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
    public boolean _startedNodeAlready=false;


    public Runnable node = new Runnable() {
        @Override
        public void run() {
            Context androidContext = getApplicationContext();
            //We just want one instance of node running in the background.

            if( !_startedNodeAlready ) {
                _startedNodeAlready=true;
                startNodeWithArguments(new String[]{"node", "-e",
                        "var http = require('http'); " +
                                "var versions_server = http.createServer( (request, response) => { " +
                                "  response.end('Versions: ' + JSON.stringify(process.versions)); " +
                                "}); " +
                                "versions_server.listen(3000);"
                });
            }
        }
    };
    public Runnable request = new Runnable() {
        @Override
        public void run() {
            int count = 0;
            int maxTries = 3;
            String nodeResponse="";
            while(true) {
                try {
                    URL localNodeServer = new URL("http://localhost:3000/");
                    BufferedReader in = new BufferedReader(
                            new InputStreamReader(localNodeServer.openStream()));
                    String inputLine;
                    while ((inputLine = in.readLine()) != null)
                        nodeResponse=nodeResponse+inputLine;
                    in.close();
                    Log.i(TAG, nodeResponse);
                    break;
                } catch (Exception e) {
                    if (++count == maxTries) {
                        Log.e(TAG, e.getMessage());
                    }
                }
            }
        }
    };


    @Override
    public void onCreate() {
        super.onCreate();
        new Thread(node).start();
        new Thread(request).start();
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
    /**
     * A native method that is implemented by the 'native-lib' native library,
     * which is packaged with this application.
     */
    public native Integer startNodeWithArguments(String[] arguments);

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