package com.notify;

import android.content.Context;
import android.content.Intent;

import com.facebook.react.ReactActivity;
import com.facebook.react.HeadlessJsTaskService;
import android.util.Log;

import android.os.Handler;
import android.os.Looper;
import android.os.Bundle;
import java.lang.Boolean;

import org.liquidplayer.javascript.JSContext;


import org.json.JSONException;
import org.json.JSONObject;
import org.liquidplayer.service.MicroService;
import org.liquidplayer.service.MicroService.ServiceStartListener;
import org.liquidplayer.service.MicroService.EventListener;
import org.liquidplayer.node.Process;

import java.net.URI;

public class MainActivity extends ReactActivity {

  private static String TAG = "NotifyMainActivity";
  JSContext context = new JSContext();

  /**
   * Returns the name of the main component registered from JavaScript. This is
   * used to schedule rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "Notify";
  }

  // @Override
  // public void onResume() {
  // Context context = getApplicationContext();
  // context.stopService(new Intent(context, DataService.class));
  // Log.i(TAG, "Stopping Listener...");
  // super.onStart();

  // }

  // @Override
  // public void onPause() {
  // super.onStop();
  // Context context = getApplicationContext();
  // context.startService(new Intent(context, DataService.class));
  // HeadlessJsTaskService.acquireWakeLockNow(context);
  // Log.i(TAG, "Starting Listener...");
  // }

  // }

  // @Override
  // public void onResume() {
  // Context context = getApplicationContext();
  // context.startService(new Intent(context, DataService.class));
  // super.onStart();

  // }

  // @Override
  // public void onPause() {
  // super.onStop();
  // Context context = getApplicationContext();
  // context.stopService(new Intent(context, DataService.class));
  // HeadlessJsTaskService.acquireWakeLockNow(context);
  // }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Our 'ready' listener will wait for a ready event from the micro service. Once
    // the micro service is ready, we'll ping it by emitting a "ping" event to the
    // service.
    final EventListener readyListener = new EventListener() {
      @Override
      public void onEvent(MicroService service, String event, JSONObject payload) {
        Log.i(TAG, "Ready!");
        service.emit("ping");
      }
    };

    // Our micro service will respond to us with a "pong" event. Embedded in that
    // event is our message. We'll update the textView with the message from the
    // micro service.
    final EventListener pongListener = new EventListener() {
      @Override
      public void onEvent(MicroService service, String event, final JSONObject payload) {
        // NOTE: This event is typically called inside of the micro service's thread,
        // not
        // the main UI thread. To update the UI, run this on the main thread.
        new Handler(Looper.getMainLooper()).post(new Runnable() {
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

    // Our start listener will set up our event listeners once the micro service
    // Node.js
    // environment is set up
    final ServiceStartListener startListener = new ServiceStartListener() {
      @Override
      public void onStart(MicroService service) {
        service.addEventListener("ready", readyListener);
        service.addEventListener("pong", pongListener);
      }
      
    };

    // URI uri = MicroService.DevServer();
    URI uri = MicroService.Bundle(MainActivity.this);
    Log.i(TAG, "Bundle: " + uri.toString());
    MicroService service = new MicroService(MainActivity.this, uri, startListener) {
      @Override
      public void onProcessFailed(Process process, Exception e) {
        Log.e(TAG, e.getMessage());
      }
      @Override
      public void onProcessStart(Process process, JSContext context) {
        boolean active = process.isActive();
        Log.i(TAG, "Process Active: " + Boolean.toString(active));
      }
    };
    service.start();
    Process process = service.getProcess(); 
    Log.i(TAG, "Process: " + process.toString());
    boolean active = process.isActive();
    Log.i(TAG, "Process Active: " + Boolean.toString(active));

  }

}