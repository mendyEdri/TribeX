import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Navigator,
  ListView,
  TouchableOpacity,
  TouchableHighlight,
  Image,
  StatusBar,
  AsyncStorage,
  CameraRoll,
  Platform,
} from 'react-native';

var MediaCell = require('./media-cell');
var VideoView = require('./video-view');
var Camera = require('./camera-view');
var List = require('./list-view');
var ImagesView = require('./images-view');

var ScrollableTabView = require('react-native-scrollable-tab-view');
var Video = require('react-native-video').default;
var Signup = require('./signup-api.js');
var Tabbar = require('./tabbar-view');
var Constants = require('./constants');
var Mixpanel = require('react-native-mixpanel');

const FBSDK = require('react-native-fbsdk');
const {
  GraphRequest,
  GraphRequestManager,
} = FBSDK;

const shareLinkContent = {
  contentType: 'link',
  contentUrl: "https://facebook.com",
  contentDescription: 'Wow, check out this great site!',
};

module.exports = React.createClass({

  getInitialState() {
    return {
      indicator: true,
      tabbarVisible: true,
      shareLinkContent: '',
      locked: false,
    }
  },
  componentWillMount: function() {
    StatusBar.setHidden(true, false);
    Mixpanel.sharedInstanceWithToken('2556a8434bf126cc1d72e88943c80e5e');
    var keys = ['UserID', 'CompanyValidated']
    // AsyncStorage.multiRemove(keys, (err) => {
    //   console.log('removed ' + keys);
    // });
    this.signupAlways();
  },

  facebook() {
    const infoRequest = new GraphRequest(
      '/me',
      'GET',
      {"fields":"id,name"},
      this._responseInfoCallback,
    );
    new GraphRequestManager().addRequest(infoRequest).start();
  },

_responseInfoCallback(error: ?Object, result: ?Object) {
  if (error) {
    alert('Error fetching data: ' + error.toString());
  } else {
    alert('Success fetching data: ' + result.toString());
  }
},

  render() {
    return (
      <ScrollableTabView locked={this.state.locked} style={{backgroundColor: 'white'}} onChangeTab={() => {
      }} tabBarPosition={'overlayBottom'} initialPage={0} renderTabBar={(props) => <Tabbar visible={this.state.tabbarVisible} props={props} />}>
      <Camera lock={(isLocked) => {
        this.setState({locked: isLocked});
      }} onRecording={(isRecording) => {
        console.log('onRecording: ' + isRecording);
        this.setState({tabbarVisible: !isRecording});
      }}
      tabLabel="Camera" />
      <List lock={(isLocked) => {
        this.setState({locked: isLocked});
      }} onPlaying={(isPlaying) => {
        console.log('isPlaying: ' + isPlaying);
        this.setState({tabbarVisible: !isPlaying});
      }}
      tabLabel="Explore" />
      </ScrollableTabView>
    );
  },

  signupAlways() {
    Mixpanel.identify(Constants.uniqueId);
    this.setMixpanelPeople(null);
    Signup(Constants.uniqueId).then((data) => {
      if (data) {
        //console.log('Signup Results ' + JSON.stringify(data));
        Mixpanel.identify(Constants.uniqueId);
        if (!data.error) {
          AsyncStorage.setItem('UserID', Constants.uniqueId);
          if (data.response.companyValidated.length > 0 && data.response.companyValidated[0].companyId) {
            console.log('Mixpanel set people: ' + Constants.uniqueId);
            AsyncStorage.setItem('CompanyValidated', 'true');
            this.setMixpanelPeople(data);
          }
        }
      } else {
        console.log('error: data: ' + data);
      }
    });
  },

  setMixpanelPeople(data) {
    console.log('data: ' + data);
    console.log('platform: ' + Platform);
    if (!data) {
      if (Platform.OS === 'ios') {
        Mixpanel.set({
                    "$uniqueId": Constants.uniqueId,
                    "$last_login": new Date().toISOString(),
      });
      } else {
        Mixpanel.set("$uniqueId", Constants.uniqueId);
        Mixpanel.set("$last_login", new Date().toISOString());
      }
      return;
    }
    if (Platform.OS === 'ios') {
      Mixpanel.set({
                  "$uniqueId": Constants.uniqueId,
                  "$last_login": new Date().toISOString(),
                  "$company_id": data.response.companyValidated[0].companyId,
                  "$company_name": data.response.companyValidated[0].companyName,
    });
    } else {
      Mixpanel.set("$uniqueId", Constants.uniqueId);
      Mixpanel.set("$last_login", new Date().toISOString());
      Mixpanel.set("$company_id", data.response.companyValidated[0].companyId);
      Mixpanel.set("$company_name", data.response.companyValidated[0].companyName);
    }
  },

  signup() {
    AsyncStorage.getItem("UserID").then((value) => {
      console.log('user id exist: ' + value);
      if (!value) {
        console.log('Signup.. ' + Constants.uniqueId);
        Signup(Constants.uniqueId).then((data) => {
          if (data) {
            console.log('Signup Results ' + JSON.stringify(data));
            Mixpanel.identify(Constants.uniqueId);
            if (!data.error) {
              AsyncStorage.setItem('UserID', Constants.uniqueId);
              if (data.response.companyValidated[0].companyId) {
                AsyncStorage.setItem('CompanyValidated', 'true');
              }
            }
          } else {
            console.log('error: data: ' + data);
          }
        });
      }
    });
  },
 });

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  list: {
    flex:1,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center'
  },
});
