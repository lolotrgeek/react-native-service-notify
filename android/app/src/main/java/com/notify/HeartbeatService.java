package com.notify;

import android.app.Notification;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.os.IBinder;

import androidx.annotation.RequiresApi;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import android.app.NotificationManager;
import android.app.NotificationChannel;
import android.os.Build;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class HeartbeatService extends NodeJS {

    private static final int SERVICE_NOTIFICATION_ID = 12345;
    private static final String CHANNEL_ID = "HEARTBEAT";
    private static String TITLE = "Title";
    private static String SUBTITLE = "Subtitle";
    private static int INTERVAL = 1000;
    public static int COUNT = 0;
    private static HeartbeatService instance;
    private static String TAG = "HEARTBEAT-SERVICE";
    private static boolean DEBUG = false;

    // Used to load the 'native-lib' library on application startup.
    static {
        System.loadLibrary("native-lib");
        System.loadLibrary("node");
    }

    public boolean _startedNodeAlready = false;

    @Override
    public Context getApplicationContext() {
        return super.getApplicationContext();
    }
// private int CURRENT_TICK = 0;

    private Handler countHandler = new Handler();
    private Runnable runnableCode = new Runnable() {
        @Override
        public void run() {
            COUNT++;
            SUBTITLE = Integer.toString(COUNT);
            notificationUpdate();
            sendMessageToReact("count", SUBTITLE);
            countHandler.postDelayed(this, INTERVAL);
        }
    };

    public static HeartbeatService getInstance() {
        return instance;
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


    public void sendMessageToReact(String event, String msg) {
        HeartbeatModule.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(event, msg);
    }

    public JSONObject msgParse(String msg) {
        JSONObject obj = null;
        if (isJSONValid(msg)) {
            try {
                obj = new JSONObject(msg);
                if (DEBUG) {Log.i(TAG, "Parsing Msg...");}
                if (DEBUG)  {Log.d(TAG, obj.toString());}
            } catch (JSONException e) {
                Log.e(TAG, e.getMessage());
            }
        }
        return obj;
    }

    public boolean isJSONValid(String test) {
        try {
            new JSONObject(test);
        } catch (JSONException ex) {
            try {
                new JSONArray(test);
            } catch (JSONException ex1) {
                return false;
            }
        }
        return true;
    }

    public String eventParse(JSONObject obj) {
        String event = null;
        try {
            event = obj.get("event").toString();
            if (DEBUG) {Log.i(TAG, "Parsing Event");}
            if (DEBUG) {Log.d(TAG, event);}
        } catch (Exception e) {
            Log.e(TAG, e.getMessage());
        }
        return event;
    }

    public JSONObject heartbeatPayloadParse(JSONObject obj) {
        JSONObject request = null;
        try {
            if (DEBUG) {Log.i(TAG, "Parsing Payload...");}
            JSONArray payload = new JSONArray(obj.get("payload").toString());
            request = new JSONObject(payload.get(0).toString());
        } catch (JSONException e) {
            Log.e(TAG, e.getMessage());
        }
        return request;
    }

    /**
     * Outgoing Messages from Android to Node
     *
     * @param response
     * @param event
     * @param err
     */
    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    public void handleOutgoingMessages(JSONObject response, String event, String err) {
        try {
            response.put("err", err);
            Log.d(TAG, event + "response :" + response.toString());
            super.sendMessageToNode(event, response.toString());
        } catch (JSONException e) {
            Log.e(TAG, e.getMessage());
        }
    }

    /**
     * Incoming Messages from Node to Android, adds data React cases
     *
     * @param msg
     */
    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    @Override
    public void handleIncomingMessages(String msg) {
        super.handleIncomingMessages(msg);
        try {
            JSONObject obj = msgParse(msg);
            String event = eventParse(obj);
            switch (event) {
                case "done":
                    try {
                        JSONObject request = heartbeatPayloadParse(obj);
                        if (DEBUG) {Log.i(TAG, "msg from node : done");}
                        if (DEBUG) {Log.d("NODE_DEBUG_PUT", "done: " + request.toString());}
                        sendMessageToReact("done", request.toString());
                    } catch (Exception e) {
                        Log.e(TAG, e.getMessage());
                    }
                    break;
                case "notify":
                    try {
                        JSONObject update = heartbeatPayloadParse(obj);
                        if (DEBUG) {Log.d(TAG, "notify - " + update.toString());}
                        try {
                            String state = update.get("state").toString();
                            if (DEBUG) {Log.d(TAG, "notify STATE - " + state);}
                            if (state.equals("stop")) {
                                notificationPaused();
                            }
                            if (state.equals("start")) {
                                String title = update.get("title").toString();
                                String subtitle = update.get("subtitle").toString();
                                TITLE = title;
                                SUBTITLE = subtitle;
                                if (DEBUG)  {Log.d(TAG, TITLE + " " + SUBTITLE);}
                                notificationUpdate();
                            }
                        } catch (Exception e) {
                            Log.e(TAG, e.getMessage());
                        }
                    } catch (Exception e) {
                        Log.e(TAG, e.getMessage());
                    }
                    break;
                case "running":
                    JSONObject update = heartbeatPayloadParse(obj);
                    if (DEBUG) {Log.d(TAG, "running - " + update.toString());}
                    sendMessageToReact("running", update.toString());
                    break;
                case "count":
                    JSONArray payload = new JSONArray(obj.get("payload").toString());
                    String count = payload.get(0).toString();
                    SUBTITLE = count;
                    notificationUpdate();
                    sendMessageToReact("count", SUBTITLE);
                    break;
            }
        } catch (Throwable t) {
            Log.e(TAG, "Could not parse malformed JSON: \"" + msg + "\"");
        }
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
            assert notificationManager != null;
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
    public void init() {
        super.startEngine("main.js");
        super.systemMessageToNode();
    }

    public void notificationUpdate() {
        if (DEBUG) {Log.i(TAG, "updating notification");}
        // set Intent for what happens when tapping notification
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent contentIntent = PendingIntent.getActivity(this, 0, notificationIntent,
                PendingIntent.FLAG_CANCEL_CURRENT);
        // Intend and Build Action Buttons
        Intent actionIntent = new Intent(this, HeartbeatActionReceiver.class);
        actionIntent.putExtra("ACTION", "stop");
        PendingIntent actionPendingIntent = PendingIntent.getBroadcast(this, 1, actionIntent,
                PendingIntent.FLAG_UPDATE_CURRENT);

        NotificationCompat.Action buttonAction = new NotificationCompat.Action.Builder(R.mipmap.ic_launcher, "Stop",
                actionPendingIntent).build();

        // Build the notification
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher).setContentTitle(TITLE).setContentText(SUBTITLE)
                .setContentIntent(contentIntent).setPriority(NotificationCompat.PRIORITY_HIGH).setOnlyAlertOnce(true)
                .setOngoing(true).addAction(buttonAction);
        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(this);

        // send notification
        // SERVICE_NOTIFICATION_ID is a unique int for each notification that you must
        // define
        notificationManager.notify(SERVICE_NOTIFICATION_ID, builder.build());

    }

    public void notificationPaused() {
        if (DEBUG) {Log.i(TAG, "pausing notification");}
        // set Intent for what happens when tapping notification
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent contentIntent = PendingIntent.getActivity(this, 0, notificationIntent,
                PendingIntent.FLAG_CANCEL_CURRENT);
        // Intend and Build Action Buttons
        Intent startIntent = new Intent(this, HeartbeatActionReceiver.class);
        startIntent.putExtra("ACTION", "start");
        PendingIntent startPendingIntent = PendingIntent.getBroadcast(this, 1, startIntent,
                PendingIntent.FLAG_UPDATE_CURRENT);

        NotificationCompat.Action buttonAction = new NotificationCompat.Action.Builder(R.mipmap.ic_launcher, "Start",
                startPendingIntent).build();

        // Build the notification
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher).setContentTitle(TITLE).setContentText(SUBTITLE)
                .setContentIntent(contentIntent).setPriority(NotificationCompat.PRIORITY_HIGH).setOnlyAlertOnce(true)
                .setOngoing(false).addAction(buttonAction);
        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(this);

        // send notification
        // SERVICE_NOTIFICATION_ID is a unique int for each notification that you must
        // define
        notificationManager.notify(SERVICE_NOTIFICATION_ID, builder.build());
    }

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        createNotificationChannel();
        init();
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent contentIntent = PendingIntent.getActivity(this, 0, notificationIntent,
                PendingIntent.FLAG_CANCEL_CURRENT);

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID).setContentTitle("Title")
                .setContentText("Ready...").setSmallIcon(R.mipmap.ic_launcher).setContentIntent(contentIntent)
                .setOnlyAlertOnce(true).setPriority(NotificationCompat.PRIORITY_HIGH).setOngoing(true).build();
        startForeground(SERVICE_NOTIFICATION_ID, notification);
        return START_STICKY;
    }
}