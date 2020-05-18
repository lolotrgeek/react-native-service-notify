package com.notify.node_sqlite3;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteException;
import android.database.sqlite.SQLiteOpenHelper;
import android.database.sqlite.SQLiteStatement;
import android.provider.BaseColumns;
import android.util.Log;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.sql.Array;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;


public class SQLite3Helper extends SQLiteOpenHelper {
    public static final String TAG = "SQLite3Helper";

    public static String TABLE_NAME = "";
    public static int DATABASE_VERSION = 1;
    public static String DATABASE_NAME = "";


    public SQLite3Helper(Context context, String filename, String tablename, int version) {
        super(context, filename, null, version);
        DATABASE_NAME = filename;
        DATABASE_VERSION = version;
        TABLE_NAME = tablename;
    }

    public void onCreate(SQLiteDatabase db) {
    }

    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {

    }
    public void onDowngrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        onUpgrade(db, oldVersion, newVersion);
    }
}

public class SQLite3Bindings {
    public static final String TAG = "SQLite3Bindings";
    public SQLiteDatabase db = null;
    public SQLite3Helper dbHelper = null;
    public Context context = null;


    public void Database(String filename, String tablename) {
        dbHelper = new SQLite3Helper(context.getApplicationContext(), filename, tablename, 1);
        db = dbHelper.getWritableDatabase();
    }

    public void run(String query, String[] params) {
        db.rawQuery(query, params);
    }

    public void all(String query, String[] params) {
        db.rawQuery(query, params);
    }
}