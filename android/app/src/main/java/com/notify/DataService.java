package com.notify;

import android.app.PendingIntent;
import android.content.Intent;
import android.database.sqlite.SQLiteDatabase;
import android.os.IBinder;

import android.app.Notification;

import androidx.annotation.RequiresApi;
import androidx.core.app.NotificationCompat;

import android.app.NotificationManager;
import android.app.NotificationChannel;
import android.os.Build;
import android.util.Log;

import com.notify.node_sqlite3.SQLite3Bindings;


import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.net.URL;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.sql.Array;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;


public class DataService extends NodeJS {
    private static final int SERVICE_NOTIFICATION_ID = 54321;
    private static final String CHANNEL_ID = "DATATASK";
    private static String TAG = "DataService";


    /**
     * Bound Database Object
     */
    public SQLite3Bindings db;

    // Used to load the 'native-lib' library on application startup.
    static {
        System.loadLibrary("native-lib");
        System.loadLibrary("node");
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    public boolean _startedNodeAlready = false;

    public Runnable request = new Runnable() {
        @Override
        public void run() {
            int count = 0;
            int maxTries = 10;
            String nodeResponse = "";
            while (true) {
                try {
                    URL localNodeServer = new URL("http://localhost:3000/");
                    BufferedReader in = new BufferedReader(
                            new InputStreamReader(localNodeServer.openStream()));
                    String inputLine;
                    while ((inputLine = in.readLine()) != null)
                        nodeResponse = nodeResponse + inputLine;
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


    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    @Override
    public void onCreate() {
        super.onCreate();
        new Thread(request).start();
    }

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    @Override
    public void onDestroy() {
        super.onDestroy();
        db.close();
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

    public JSONObject msgParse(String msg) {
        JSONObject obj = null;
        try {
            Log.d(TAG, "Parsing Msg...");
            obj = new JSONObject(msg);
            Log.d(TAG, obj.toString());
        } catch (JSONException e) {
            Log.e(TAG, e.getMessage());
        }
        return obj;
    }

    public String eventParse(JSONObject obj) {
        String event = null;
        try {
            Log.d(TAG, "Parsing Event...");
            event = obj.get("event").toString();
            Log.d(TAG, event);

        } catch (Exception e) {
            Log.e(TAG, e.getMessage());
        }
        return event;
    }

    public JSONObject payloadParse(JSONObject obj) {
        JSONObject request = null;
        try {
            Log.d(TAG, "Parsing Payload...");

            JSONArray payload = new JSONArray(obj.get("payload").toString());
            Log.d(TAG, payload.toString());
            request = new JSONObject(payload.get(0).toString());
            Log.d(TAG, request.toString());
        } catch (JSONException e) {
            Log.e(TAG, e.getMessage());

        }
        return request;
    }

    public String[] paramsParse (JSONObject request) {
        String[]  params = null;
        try {
            JSONArray jsonparams = new JSONArray(request.get("params").toString());
            // map JSONArray to list
            List<String> list = new ArrayList<String>();
            for (int i = 0; i < jsonparams.length(); i++) {
                list.add(jsonparams.getString(i));
            }
            // convert list to String[]
            params = list.toArray(new String[list.size()]);
        } catch (JSONException e) {
            Log.e(TAG, e.getMessage());

        }
        return params;
    }

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    @Override
    public void handleIncomingMessages(String msg) {

        try {
            JSONObject obj = msgParse(msg);
            String event = eventParse(obj);
            JSONObject request = payloadParse(obj);

            JSONObject response = new JSONObject();
            response.put("err", null);

            if (event.equals("sqliteDatabase")) {
                Log.d(TAG, "Parsing Database request...");
                String filename = request.get("filename").toString();
                Log.d(TAG, filename);
                String mode = request.get("mode").toString();
                Log.d(TAG, mode);
                try {
                    db = new SQLite3Bindings(getApplicationContext(), filename, 1);
                    Log.i(TAG, "sending response" + response.toString());
                    super.sendMessageToNode("sqliteDatabase", response.toString());
                } catch (Exception e) {
                    Log.e(TAG, e.getMessage());
                }
            }

            else if (event.equals("sqliteRun")) {
                String query = request.get("sql").toString();
                String[] params = paramsParse(request);
                String transaction = db.run(query, params);
                if (!transaction.equals("success")) {
                    response.put("err", transaction);
                }
                Log.i(TAG, "sending response" + response.toString());
                super.sendMessageToNode("sqliteRun", response.toString());
            }
            else if (event.equals("sqliteAll")) {
                String query = request.get("sql").toString();
                String[] params = paramsParse(request);
                JSONObject transaction = db.all(query, params);
                response = transaction;
                Log.i(TAG, "sending response" + response.toString());
                super.sendMessageToNode("sqliteAll", response.toString());
            }
            else {
                Log.d(TAG, "Invalid Msg");
            }
        } catch (Throwable t) {
            Log.e(TAG, "Could not parse malformed JSON: \"" + msg + "\"");
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    private void init() {
        super.startEngine("data.js");
        super.systemMessageToNode();

    }

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.i(TAG, "Starting Listener...");
        init();
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