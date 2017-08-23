import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform
} from 'react-native';

var Constants = require('./constants');
var Camera = require('./camera-view');

module.exports = React.createClass({
  getInitialState() {
    return {
      visible: this.props.visible,
    }
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({visible: nextProps.visible});
  },
  render() {
    return (
      <View style={[styles.tabbar], this.props.style}>
        {this.menuItem()}
      </View>
    )
  },

  menuItem() {
    if (!this.state.visible) {
        return null;
    }
    if (Platform.OS === 'ios') {
      StatusBar.setHidden(this.props.activeTab == 0, true);
    } else {
       StatusBar.setHidden(true, true);
    }
    return (
      <TouchableOpacity style={this.itemStyle()}
        onPress={() => {
          this.props.goToPage(this.props.activeTab == 0 ? 1 : 0);
        }}>
        {this.tabImage()}
      </TouchableOpacity>
    );
  },

  tabImage() {
    var image = null;
    if (this.props.activeTab == 0) {
      image = <Image source={require('../img/menu.png')}
        style={{height: 42, width: 42,}}/>
    } else {
      image = <Image source={require('../img/photo-camera.png')}
      style={{height: 30, width: 30,}}/>
    }
    return image;
  },

  itemStyle() {
    if (this.props.activeTab == 0) {
      return {
        height: 44,
        width: 44,
        bottom: 30,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        borderRadius: 44/2,
        alignItems: 'center',
        justifyContent: 'center',
        right: (Constants.width / 2) - (120),
        alignSelf: 'flex-end',
      }
    } else {
      return {
        height: 44,
        width: 44,
        bottom: 8,
        backgroundColor: Constants.yellow,
        borderRadius: 44/2,
        alignItems: 'center',
        justifyContent: 'center',
        left: 10,
        alignSelf: 'flex-start',
      }
    }
  }
});

var styles = StyleSheet.create({
    tabbar: {
      height: 84,
    },
});
