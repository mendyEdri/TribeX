package com.talenttribex;

import android.content.Intent;

import com.facebook.react.ReactActivity;


public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */

    public static MainActivity mainActivity = null;

    public MainActivity() {
        mainActivity = this;
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        mainActivity.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    protected String getMainComponentName() {
        return "Live";
    }
}
