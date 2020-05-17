package com.notify.node_sqlite3;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteException;
import android.database.sqlite.SQLiteStatement;
import android.util.Log;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class SQLite3Bindings {

    public static final String TAG = SQLite3Bindings.class.getSimpleName();
    public  void Database() {

    }

    public void open() {

    }

    public void close() {

    }

    public void run() {

    }

    public void all() {

    }
    /**
     * Linked activity
     */
    protected Context context = null;

    /**
     * Thread pool for database operations
     */
    protected ExecutorService threadPool;

    public SQLitePlugin() {
        this.context = context.getApplicationContext();
        this.threadPool = Executors.newCachedThreadPool();
    }

    /**
     *
     * @return the thread pool available for scheduling background execution
     */
    protected ExecutorService getThreadPool(){
        return this.threadPool;
    }
    /**
     *
     * @return linked activity
     */
    protected Context getContext(){
        return this.context;
    }

    /**
     * Clean up and close all open databases.
     */
    public void closeAllOpenDatabases() {
        while (!dbrmap.isEmpty()) {
            String dbname = dbrmap.keySet().iterator().next();

            this.closeDatabaseNow(dbname);

            SQLitePlugin.DBRunner r = dbrmap.get(dbname);
            try {
                // stop the db runner thread:
                r.q.put(new SQLitePlugin.DBQuery());
            } catch(Exception ex) {
                Log.e(TAG, "couldn't stop db thread for db: " + dbname,ex);
            }
            dbrmap.remove(dbname);
        }
    }

    // --------------------------------------------------------------------------
    // LOCAL METHODS
    // --------------------------------------------------------------------------

    /**
     *
     * @param dbname - The name of the database file
     * @param options - options passed in from JS
     * @param cbc - JS callback context
     */
    private void startDatabase(String dbname, ReadableMap options, Callback cbc) {
        // TODO: is it an issue that we can orphan an existing thread?  What should we do here?
        // If we re-use the existing DBRunner it might be in the process of closing...
        SQLitePlugin.DBRunner r = dbrmap.get(dbname);

        // Brody TODO: It may be better to terminate the existing db thread here & start a new one, instead.
        if (r != null) {
            // don't orphan the existing thread; just re-open the existing database.
            // In the worst case it might be in the process of closing, but even that's less serious
            // than orphaning the old DBRunner.
            cbc.success("database started");
        } else {
            r = new SQLitePlugin.DBRunner(dbname, options, cbc);
            dbrmap.put(dbname, r);
            this.getThreadPool().execute(r);
        }
    }
    /**
     * Open a database.
     *
     * @param dbname - The name of the database file
     * @param assetFilePath - path to the pre-populated database file
     * @param openFlags - the db open options
     * @return instance of SQLite database
     * @throws Exception
     */
    private SQLiteDatabase openDatabase(String dbname, String assetFilePath, int openFlags) throws Exception {
        InputStream in = null;
        File dbfile = null;
        try {
            SQLiteDatabase database = this.getDatabase(dbname);
            if (database != null && database.isOpen()) {
                // this only happens when DBRunner is cycling the db for the locking work around.
                // otherwise, this should not happen - should be blocked at the execute("open") level
                throw new Exception("Database already open");
            }

            boolean assetImportError = false;
            boolean assetImportRequested = assetFilePath != null && assetFilePath.length() > 0;
            if (assetImportRequested) {
                if (assetFilePath.compareTo("1") == 0) {
                    assetFilePath = "www/" + dbname;
                    try {
                        in = this.getContext().getAssets().open(assetFilePath);
                        Log.v(TAG, "Pre-populated DB asset FOUND  in app bundle www subdirectory: " + assetFilePath);
                    } catch (Exception ex){
                        assetImportError = true;
                        Log.e(TAG, "pre-populated DB asset NOT FOUND in app bundle www subdirectory: " + assetFilePath);
                    }
                } else if (assetFilePath.charAt(0) == '~') {
                    assetFilePath = assetFilePath.startsWith("~/") ? assetFilePath.substring(2) : assetFilePath.substring(1);
                    try {
                        in = this.getContext().getAssets().open(assetFilePath);
                        Log.v(TAG, "Pre-populated DB asset FOUND in app bundle subdirectory: " + assetFilePath);
                    } catch (Exception ex){
                        assetImportError = true;
                        Log.e(TAG, "pre-populated DB asset NOT FOUND in app bundle www subdirectory: " + assetFilePath);
                    }
                } else {
                    File filesDir = this.getContext().getFilesDir();
                    assetFilePath = assetFilePath.startsWith("/") ? assetFilePath.substring(1) : assetFilePath;
                    try {
                        File assetFile = new File(filesDir, assetFilePath);
                        in = new FileInputStream(assetFile);
                        Log.v(TAG, "Pre-populated DB asset FOUND in Files subdirectory: " + assetFile.getCanonicalPath());
                        if (openFlags == SQLiteDatabase.OPEN_READONLY) {
                            dbfile = assetFile;
                            Log.v(TAG, "Detected read-only mode request for external asset.");
                        }
                    } catch (Exception ex){
                        assetImportError = true;
                        Log.e(TAG, "Error opening pre-populated DB asset in app bundle www subdirectory: " + assetFilePath);
                    }
                }
            }

            if (dbfile == null) {
                openFlags = SQLiteDatabase.OPEN_READWRITE | SQLiteDatabase.CREATE_IF_NECESSARY;
                dbfile = this.getContext().getDatabasePath(dbname);

                if (!dbfile.exists() && assetImportRequested) {
                    if (assetImportError || in == null) {
                        Log.e(TAG, "Unable to import pre-populated db asset");
                        throw new Exception("Unable to import pre-populated db asset");
                    } else {
                        Log.v(TAG, "Copying pre-populated db asset to destination");
                        try {
                            this.createFromAssets(dbname, dbfile, in);
                        } catch (Exception ex){
                            Log.e(TAG, "Error importing pre-populated DB asset", ex);
                            throw new Exception("Error importing pre-populated DB asset");
                        }
                    }
                }

                if (!dbfile.exists()) {
                    dbfile.getParentFile().mkdirs();
                }
            }

            Log.v(TAG, "DB file is ready, proceeding to OPEN SQLite DB: " + dbfile.getAbsolutePath());

            SQLiteDatabase mydb = SQLiteDatabase.openDatabase(dbfile.getAbsolutePath(), null, openFlags);

            Log.v(TAG, "Database opened");

            return mydb;
        } finally {
            closeQuietly(in);
        }
    }
}
