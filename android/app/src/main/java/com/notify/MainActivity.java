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
import org.liquidplayer.service.MicroService.BundleOptions;
import org.liquidplayer.service.MicroService.ServiceStartListener;
import org.liquidplayer.service.MicroService.ServiceErrorListener;
import org.liquidplayer.service.MicroService.EventListener;
import org.liquidplayer.node.Process;
import org.liquidplayer.javascript.JSContextGroup.LoopPreserver;

import java.net.URI;
import java.net.URL;
import java.net.MalformedURLException;
import java.io.File;
import android.net.Uri;

import java.lang.StringBuilder;
import java.io.InputStream;
import java.io.IOException;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.InputStreamReader;
import android.content.res.AssetManager;

public class MainActivity extends ReactActivity {

  private static String TAG = "NotifyMainActivity";
  JSContext context = new JSContext();
  private AssetManager assetManager;

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
  // context.startService(new Intent(context, ListenerService.class));
  // super.onStart();

  // }

  // @Override
  // public void onPause() {
  // super.onStop();
  // Context context = getApplicationContext();
  // context.stopService(new Intent(context, ListenerService.class));
  // }

  public URL buildUrl(String server) {
    URL url = null;
    try {
      url = new URL(server);
    } catch (MalformedURLException e) {
      Log.e(TAG, e.getMessage());
    }
    return url;
  };

  public URI buildUri(String server) {
    URI uri = null;
    try {
      uri = new URI(server);
    } catch (Exception e) {
      Log.e(TAG, e.getMessage());
    }
    return uri;
  };

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    assetManager = getAssets();
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

    final ServiceErrorListener errorListener = new ServiceErrorListener() {
      @Override
      public void onError(MicroService service, Exception e) {
        Log.e(TAG, e.getMessage());
      }
    };
    BundleOptions options = new BundleOptions() {
      Integer port = 8082;
      URL server_url = buildUrl("http://localhost");
    };
    URI uri = MicroService.Bundle(MainActivity.this, "liquid");
    // URI uri = MicroService.Bundle(MainActivity.this, "index", options);
    // URI uri = buildUri("http://192.168.1.109:8082/index.js");
    // URI droiduri = Uri.parse("android.resource://com.notify/raw/liquid.bundle");
    // Uri droiduri = Uri.fromFile(new File("file:///android_asset/liquid.bundle"));
    // URI uri = buildUri("liquid.bundle");
    // File bundled = new File("file:///android_asset/liquid.bundle");

    // URI uri = buildUri("android.resource://com.notify/raw/liquid.bundle");
    // Log.i(TAG, "Bundle: " + uri.toString());
    MicroService service = new MicroService(MainActivity.this, uri, startListener, errorListener) {
      @Override
      public void onProcessFailed(Process process, Exception e) {
        Log.e(TAG, e.getMessage());
      }

      @Override
      public void onProcessStart(Process process, JSContext context) {
        boolean active = process.isActive();
        Log.i(TAG, "Process Active: " + Boolean.toString(active));
        // process.keepAlive();
        try {
          InputStream bundled = assetManager.open("liquid.bundle");
          BufferedReader r = new BufferedReader(new InputStreamReader(bundled));
          StringBuilder total = new StringBuilder();
          for (String line; (line = r.readLine()) != null;) {
            total.append(line).append('\n');
            Log.i(TAG, line);
          }
          r.close();
        } catch (IOException e) {
          Log.e(TAG, e.getMessage());
        } catch (Exception e) {
          Log.e(TAG, e.getMessage());
        }
      }

      @Override
      public void onProcessExit(Process process, int code) {
        boolean active = process.isActive();
        Log.i(TAG, "Process Exited: " + Integer.toString(code));
        Log.i(TAG, "Process Active: " + Boolean.toString(active));
      }
      
    };
    service.start();
    Process process = service.getProcess();
    Log.i(TAG, "Process: " + process.toString());
    boolean active = process.isActive();
    Log.i(TAG, "Process Active: " + Boolean.toString(active));
    URI bundle = service.getServiceURI();
    Log.i(TAG, "Bundle: " + bundle.toString());
  }
}