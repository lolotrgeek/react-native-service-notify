package com.notify.node_sqlite3;

import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteException;
import android.database.sqlite.SQLiteStatement;
import android.provider.BaseColumns;
import android.util.Log;

import org.json.JSONArray;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.sql.Array;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;


public class SQLite3Bindings extends SQLite3Helper {
        public static final String TAG = "SQLite3Bindings";

        public SQLite3Bindings(Context context, String filename, int version) {
            super(context, filename, version);
        }

        SQLiteDatabase db = this.getWritableDatabase();
        /**
         * run a rawQuery with no expected return values
         * @param query
         * @param params
         * @return
         */
        public String run(String query, String[] params) {
            try {
                db.rawQuery(query, params);
                return "success";
            } catch (SQLiteException e) {
                Log.e(TAG, e.getMessage());
                return e.getMessage();
            }
        }

        /**
         * run a rawQuery, expecting to return a set of rows
         * @param query
         * @param params
         * @return
         */
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
            } catch (SQLiteException e) {
                String err = "err " + e.getMessage();
                Log.e(TAG, e.getMessage());
                return e.getMessage();
            }
        }
    }
