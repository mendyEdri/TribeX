/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"

#import "RCTBundleURLProvider.h"
#import "RCTRootView.h"
#import <AVFoundation/AVFoundation.h>
#import "Mixpanel/Mixpanel.h"
#import "RCTSplashScreen.h"

//#import <FBSDKCoreKit/FBSDKCoreKit.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  
  //[self registerPush];
  
  NSURL *jsCodeLocation;
  
  [[RCTBundleURLProvider sharedSettings] setDefaults];
  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index.ios" fallbackResource:nil];

  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"TribeX"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
  
//  UIImage *lunchImage = [UIImage imageNamed:@"lunch"];
//  UIImageView *imageView = [[UIImageView alloc] initWithImage:lunchImage];
//  imageView.frame = CGRectMake(0, 0, CGRectGetWidth([UIScreen mainScreen].bounds), CGRectGetHeight([UIScreen mainScreen].bounds));
//  [rootView addSubview:imageView];
  
  rootView.backgroundColor = [[UIColor alloc] initWithRed:0.0f green:0.0f blue:0.0f alpha:1];
  
  [RCTSplashScreen show:rootView];
  
  [[AVAudioSession sharedInstance] setCategory:AVAudioSessionCategoryAmbient error:nil];
  
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  
//  [[FBSDKApplicationDelegate sharedInstance] application:application
//                           didFinishLaunchingWithOptions:launchOptions];
  
//  FBSDKGraphRequest *request = [[FBSDKGraphRequest alloc]
//                                initWithGraphPath:@"/me"
//                                parameters:@{ @"fields": @"id,name",}
//                                HTTPMethod:@"GET"];
//  [request startWithCompletionHandler:^(FBSDKGraphRequestConnection *connection, id result, NSError *error) {
//    // Insert your code here
//    NSLog(@"request result: %@", result);
//    NSLog(@"request error: %@", error);
//  }];
  
  return YES;
}

- (void)registerPush {
  UIUserNotificationType types = (UIUserNotificationType) (UIUserNotificationTypeBadge |
                                                           UIUserNotificationTypeSound |
                                                           UIUserNotificationTypeAlert |
                                                           UIUserNotificationActionBehaviorTextInput);
  
  UIUserNotificationSettings *mySettings =
  [UIUserNotificationSettings settingsForTypes:types categories:nil];
  
  [[UIApplication sharedApplication] registerUserNotificationSettings:mySettings];
}

- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
  NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
  [defaults setObject:deviceToken forKey:@"deviceToken"];
  [defaults synchronize];
}

-(void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
  NSLog(@"%@",error);
}

- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings
{
  //register to receive notifications
  [application registerForRemoteNotifications];
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo {
  [UIApplication sharedApplication].applicationIconBadgeNumber++;
  @try {
    [[NSNotificationCenter defaultCenter] postNotificationName:@"RemoteNotification" object:nil];
  }
  @catch (NSException *exception) {
    
  }
}

//For interactive notification only
- (void)application:(UIApplication *)application handleActionWithIdentifier:(NSString *)identifier forRemoteNotification:(NSDictionary *)userInfo completionHandler:(void(^)())completionHandler
{
  //handle the actions
  if ([identifier isEqualToString:@"declineAction"]){
  }
  else if ([identifier isEqualToString:@"answerAction"]){
  }
}

//- (void)applicationDidBecomeActive:(UIApplication *)application {
//  [FBSDKAppEvents activateApp];
//}
//
//- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url sourceApplication:(NSString *)sourceApplication annotation:(id)annotation {
//  return [[FBSDKApplicationDelegate sharedInstance] application:application openURL:url sourceApplication:sourceApplication annotation:annotation];
//}

@end
