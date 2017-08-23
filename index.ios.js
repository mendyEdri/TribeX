/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

 import React, { Component } from 'react';
 import {
   AppRegistry,
 } from 'react-native';

 var Main = require('./src/main');
 var Share = require('./share.ios');

AppRegistry.registerComponent('TribeX', () => Main);
AppRegistry.registerComponent('ShareTribeX', () => Share);
