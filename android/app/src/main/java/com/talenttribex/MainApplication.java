package com.talenttribex;

import android.app.Application;

import com.brentvatne.react.ReactVideoPackage;
import com.facebook.appevents.AppEventsLogger;
import com.facebook.react.ReactApplication;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;

import java.util.Arrays;
import java.util.List;

import com.github.xinthink.rnmk.ReactMaterialKitPackage;
import com.horcrux.svg.RNSvgPackage;
import com.lwansbrough.RCTCamera.*;
import com.oblador.vectoricons.VectorIconsPackage;
import com.farmisen.react_native_file_uploader.*;
import cl.json.RNSharePackage;
import com.kevinejohn.RNMixpanel.*;
import com.chirag.RNMail.*;
import com.facebook.CallbackManager;
import com.facebook.FacebookSdk;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import com.remobile.splashscreen.*;

public class MainApplication extends Application implements ReactApplication {
  private static CallbackManager mCallbackManager = CallbackManager.Factory.create();
  protected static CallbackManager getCallbackManager() {
    return mCallbackManager;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    FacebookSdk.sdkInitialize(getApplicationContext());
    // If you want to use AppEventsLogger to log events.
    AppEventsLogger.activateApp(this);
  }

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    protected boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNDeviceInfo(),
              new RNMixpanel(),
              new RCTCameraPackage(),
              new ReactVideoPackage(),
              new VectorIconsPackage(),
              new RNSvgPackage(),
              new RCTFileUploaderPackage(),
              new ReactMaterialKitPackage(),
              new RNMail(),
              new RCTSplashScreenPackage(MainActivity.mainActivity),
              new FBSDKPackage(mCallbackManager),
              new RNSharePackage()
      );
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
      return mReactNativeHost;
  }
}
