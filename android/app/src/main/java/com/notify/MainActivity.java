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

  }
}