package com.notify.node_sqlite3;

import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteException;
import android.database.sqlite.SQLiteOpenHelper;
import android.database.sqlite.SQLiteStatement;
import android.provider.BaseColumns;
import android.util.Log;

import org.json.JSONArray;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.sql.Array;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;


public class SQLite3Bindings {
    public static final String TAG = "SQLite3Bindings";
    public SQLiteDatabase db = null;
    public SQLite3Helper dbHelper = null;
    public Context context = null;

    public String Database(String filename) {
        try {
            dbHelper = new SQLite3Helper(context.getApplicationContext(), filename, 1);
            db = dbHelper.getWritableDatabase();
            return "success";
        } catch(Exception e) {
            Log.e(TAG, e.getMessage());
            return e.getMessage();
        }
    }

    public String run(String query, String[] params) {
        try {
            db.rawQuery(query, params);
            return "success";
        } catch (Exception e) {
            Log.e(TAG, e.getMessage());
            return e.getMessage();
        }
    }

    public String all(String query, String[] params) {
        try {
            JSONArray rows = new JSONArray();
            Cursor cursor = db.rawQuery(query, params);
            cursor.moveToFirst();
            String[] columns = cursor.getColumnNames();
            for (String column : columns) {
                String result = cursor.getString(cursor.getColumnIndex(column));
                rows.put(result);
                cursor.moveToLast();
            }
            cursor.close();
            return rows.toString();
        } catch (Exception e) {
            String err = "err " + e.getMessage();
            Log.e(TAG, e.getMessage());
            return e.getMessage();
        }
    }
}