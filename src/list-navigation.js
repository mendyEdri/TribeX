import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Navigator,
} from 'react-native';

var VideoView = require('./video-view');
var List = require('./list-view');

var ROUTES = {
  list: List,
  video: VideoView
};

module.exports = React.createClass({
  renderScene: function(route, navigator) {
    var Component = ROUTES[route.name];
    return <Component
              route={route}
              navigator={navigator}
              onForward={() => {
                navigator.push({name: 'video'});
              }}
              onBack={() => {
                if (route.index > 0) {
                  navigator.pop();
                }
              }}
            />
  },
  render() {
    return (
      <Navigator
       style={styles.container}
       initialRoute={{ name: 'list' }}
       renderScene={ this.renderScene }
       configureScene={() => { return Navigator.SceneConfigs.VerticalUpSwipeJump; }}
     />
    );
  },
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  mainView: {
   flex: 1,
   backgroundColor: 'green',
 },
  list: {
    flex:1,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center'
  },
});
