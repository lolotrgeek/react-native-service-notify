package com.notify;

import android.content.Intent;
import android.content.Context;
import android.content.BroadcastReceiver;
import android.os.Build;
import android.widget.Toast;

import androidx.annotation.RequiresApi;

public class HeartbeatActionReceiver extends BroadcastReceiver {
    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getStringExtra("ACTION");
        Toast.makeText(context,action,Toast.LENGTH_SHORT).show();

        if (action.equals("stop")) {
            stop();
        } else if (action.equals("start")) {
            start();
        }
        // This is used to close the notification tray
        Intent it = new Intent(Intent.ACTION_CLOSE_SYSTEM_DIALOGS);
        context.sendBroadcast(it);

    }

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    public void stop() {
        // HeartbeatModule.getInstance().stopService();
        HeartbeatService.getInstance().sendMessageToNode("stop", "");
        HeartbeatService.getInstance().notificationPaused();
    }

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    public void start() {
        // HeartbeatModule.getInstance().startService();
        HeartbeatService.getInstance().sendMessageToNode("start", "");
    }

}