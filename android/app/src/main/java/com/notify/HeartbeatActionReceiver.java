package com.notify;

import android.content.Intent;
import android.content.Context;
import android.content.BroadcastReceiver;
import android.widget.Toast;

public class HeartbeatActionReceiver extends BroadcastReceiver {
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

    public void stop() {
        // HeartbeatModule.getInstance().stopService();
        HeartbeatModule.getInstance().stopAction();
    }

    public void start() {
        // HeartbeatModule.getInstance().startService();
        HeartbeatModule.getInstance().startAction();
    }

}