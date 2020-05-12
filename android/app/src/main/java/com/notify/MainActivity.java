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
  static {
    System.loadLibrary("native-lib");
    System.loadLibrary("node");
  }
  private static String TAG = "NotifyMainActivity";

  /**
   * Returns the name of the main component registered from JavaScript. This is
   * used to schedule rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "Notify";
  }

  // We just want one instance of node running in the background.
  public static boolean _startedNodeAlready = false;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    if (!_startedNodeAlready) {
      _startedNodeAlready = true;
      new Thread(new Runnable() {
        @Override
        public void run() {
          startNodeWithArguments(new String[] { "node", "-e",
              "var http = require('http'); " + "var versions_server = http.createServer( (request, response) => { "
                  + "  response.end('Versions: ' + JSON.stringify(process.versions)); " + "}); "
                  + "versions_server.listen(3000);" });
        }
      }).start();
    }
  }

  /**
   * A native method that is implemented by the 'native-lib' native library, which
   * is packaged with this application.
   */
  public native Integer startNodeWithArguments(String[] arguments);

  // SERVICE DEFINITIONS HERE
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

}