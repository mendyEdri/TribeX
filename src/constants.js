'use strict';
import React, { Component } from 'react';
import {
  Dimensions,
} from 'react-native';

var DeviceInfo = require('react-native-device-info');

module.exports = {
  yellow: 'rgba(255, 198, 0, 1.0)',
  blue: 'rgba(31, 173, 229, 1.0)',
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
  uniqueId: DeviceInfo.getUniqueID(),
  server: 'https://stageserver3.talenttribe.me/tt-server/rest/',
}
