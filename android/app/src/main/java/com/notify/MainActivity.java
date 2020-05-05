package com.notify;

import android.content.Context;
import android.content.Intent;

import com.facebook.react.ReactActivity;
import com.facebook.react.HeadlessJsTaskService;


public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "Notify";
  }

  @Override
  public void onStart() {
    Context context = getApplicationContext();
    context.stopService(new Intent(context, DataEventService.class));
    super.onStart();
  }
  @Override
  public void onStop() {
    super.onStop();
    Context context = getApplicationContext();
    context.startService(new Intent(context, DataEventService.class));
    HeadlessJsTaskService.acquireWakeLockNow(context);
  }

  
  // private boolean isAppOnForeground(Context context) {
  //   /**
  //    * We need to check if app is in foreground otherwise the app will crash.
  //    * http://stackoverflow.com/questions/8489993/check-android-application-is-in-foreground-or-not
  //    **/
  //   ActivityManager activityManager = (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
  //   List<ActivityManager.RunningAppProcessInfo> appProcesses = activityManager.getRunningAppProcesses();
  //   if (appProcesses == null) {
  //     return false;
  //   }
  //   final String packageName = context.getPackageName();
  //   for (ActivityManager.RunningAppProcessInfo appProcess : appProcesses) {
  //     if (appProcess.importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND
  //         && appProcess.processName.equals(packageName)) {
  //       return true;
  //     }
  //   }
  //   return false;
  // }

  // public static boolean isNetworkAvailable(Context context) {
  //   ConnectivityManager cm = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
  //   NetworkInfo netInfo = cm.getActiveNetworkInfo();
  //   return (netInfo != null && netInfo.isConnected());
  // }
}