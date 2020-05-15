package com.notify;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;
import org.liquidplayer.service.MicroService;
import org.liquidplayer.service.MicroService.EventListener;
import org.liquidplayer.service.MicroService.ServiceErrorListener;
import org.liquidplayer.service.MicroService.ServiceStartListener;

import java.net.URI;

import androidx.core.app.NotificationCompat;

public class DataService extends Service {
    private static final int SERVICE_NOTIFICATION_ID = 54321;
    private static final String CHANNEL_ID = "DATATASK";
    private static String TAG = "DataService";

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    Runnable conn = new Runnable() {
        @Override
        public void run() {
            Context androidContext = getApplicationContext();

            Log.i(TAG, "Attempting Start...");
            URI uri = MicroService.Bundle(androidContext, "example");
            final EventListener listener = new EventListener() {
                @Override
                public void onEvent(MicroService service, String event, JSONObject payload) {
                    new Handler().post(new Runnable() {
                        @Override
                        public void run() {
                            try {
                                Log.i(TAG, "Event:" + event + " | Payload: " + payload.getString("foo"));
                            } catch (JSONException e) {
                                Log.e(TAG, e.getMessage());
                            }
                        }
                    });
                }
            };
            final EventListener readyListener = new EventListener() {
                @Override
                public void onEvent(MicroService service, String event, JSONObject payload) {
                    service.emit("ping");
                }
            };
            final EventListener pongListener = new EventListener() {
                @Override
                public void onEvent(MicroService service, String event, final JSONObject payload) {
                    // NOTE: This event is typically called inside of the micro service's thread,
                    // not
                    // the main UI thread. To update the UI, run this on the main thread.
                    new Handler().post(new Runnable() {
                        @Override
                        public void run() {
                            try {
                                Log.i(TAG, payload.getString("message"));
                            } catch (JSONException e) {
                                Log.e(TAG, e.getMessage());
                            }
                        }
                    });
                }
            };
            final ServiceStartListener startListener = new ServiceStartListener() {
                @Override
                public void onStart(MicroService service) {
                    Log.i(TAG, "Node Ready");
                    service.addEventListener("my_event", listener);
                    service.addEventListener("ready", readyListener);
                    service.addEventListener("pong", pongListener);
                }
            };

            final ServiceErrorListener errorListener = new ServiceErrorListener() {
                @Override
                public void onError(MicroService service, Exception e) {
                    Log.i(TAG, e.getMessage());
                }
            };
            final MicroService service = new MicroService(androidContext, uri, startListener);
            service.start();
        };
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