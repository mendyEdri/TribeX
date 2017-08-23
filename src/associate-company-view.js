'use strict';
import React, { Component } from 'react';
import {
  AppRegistry,
  Dimensions,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Animated,
  TextInput,
  AsyncStorage,
} from 'react-native';

var DeviceInfo = require('react-native-device-info');
var ValidateCompanyApi = require('./validate-company-api');
var ValidateCodeApi = require('./validate-code-api');
var Constants = require('./constants');
var Mixpanel = require('react-native-mixpanel');

var states = {
    EMAIL: 0,
    CODE: 1,
    DONE: 2,
};

module.exports = React.createClass({
  getInitialState() {
    return {
      email: '',
      caption: 'Share your company vibe with videos.',
      description: 'Please insert your work email',
      placeholderText: 'Your Work Email',
      inputText: '',
      submitedEmail: '',
      keyboardType: 'email-address',
      mode: states.EMAIL,
      userId: ''
    };
  },

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.close} onPress={() => {
          this.props.close();
        }}>
        <Image
          style={styles.closeImage}
          source={require('../img/back_arrow.png')}>
        </Image>
        </TouchableOpacity>
        <Text style={styles.caption}>{this.state.caption}</Text>
        <Text style={styles.description}>{this.state.description}</Text>
        <TextInput style={styles.input}
          borderBottomColor={'red'}
          autoFocus={true}
          placeholder={this.state.placeholderText}
          placeholderTextColor={'black'}
          autoCorrect={false}
          multiline={false}
          value={this.state.inputText}
          keyboardType={this.state.keyboardType}
          onChangeText={(text) => {
            this.setState({inputText: text});
          }}
          />
        <TouchableOpacity style={styles.sendButton} onPress={() => {
          // send api with email and user id
          // save company email under key: CompanyValidated
          this.state.mode == states.EMAIL ? this.validateEmail() : this.validateCode();
        }}>
          <Text style={styles.sendText}>Next</Text>
          <Image
            style={styles.nextImage}
            source={require('../img/next_arrow.png')}>
          </Image>
        </TouchableOpacity>
      </View>
    );
  },

  validateEmail() {
    this.setState({submitedEmail: this.state.inputText});
    AsyncStorage.getItem("UserID").then((value) => {
      console.log('value: ' + value);
      ValidateCompanyApi(value, this.state.inputText).then((data) => {
        console.log('data: ' + JSON.stringify(data.result));
        if (data.result.ok) {
            this.codeMode();
        }
      });
    })
    .then(res => {

    });
  },

  validateCode() {
    console.log('Code ' + this.state.inputText);
    AsyncStorage.getItem("UserID").then((value) => {
      ValidateCodeApi(value, this.state.inputText).then((data) => {
        console.log('data: ' + JSON.stringify(data.result));
        if (data.result.ok) {
          AsyncStorage.setItem('CompanyValidated', 'true');
          this.doneMode();
        }
      });
    })
    .then(res => {

    });
  },

  emailMode() {
    this.setState({
      email: '',
      caption: 'Share your company vibe with videos.',
      description: 'Please insert your work email',
      placeholderText: 'Your Work Email',
      inputText: '',
      submitedEmail: '',
      keyboardType: 'email-address',
    })
  },

  codeMode() {
    this.setState({
      caption: 'One step a way.',
      description: 'check ' + this.state.submitedEmail + ' for access code',
      placeholderText: 'Insert Code',
      inputText: '',
      keyboardType: 'numeric',
      mode: states.CODE,
    });
  },

  doneMode() {
    this.setState({
      caption: 'We are good to go.',
      description: '',
      placeholderText: '',
      inputText: '',
      keyboardType: 'email-address',
      mode: states.DONE,
    });

    setTimeout(() => {
      this.props.close();
    }, 1500)
  },

});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.yellow,
    alignItems: 'center',
  },
  close: {
    top: 8,
    left: 8,
    width: 40,
    height: 40,
    alignSelf: 'flex-start',
  },
  closeImage: {
    width: 40,
    height: 40,
  },
  caption: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 40,
    top: 14,
    left: 14,
    alignSelf: 'flex-start',
    width: Constants.width * 0.9,
  },
  description: {
    color: 'white',
    fontSize: 22,
    textAlign: 'center',
    marginTop: 34,
    left: 14,
    alignSelf: 'flex-start',
    width: Constants.width * 0.9,
  },
  input: {
    marginTop: 34,
    fontSize: 18,
    height: 46,
    textAlign: 'center',
    left: 14,
    alignSelf: 'flex-start',
    width: Constants.width * 0.9,
  },
  sendButton: {
    marginTop: 0,
    width: 130,
    height: 50,
    left: 14,
    borderRadius: 8,
    alignSelf:'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  sendText: {
    textAlign: 'left',
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  nextImage: {
    height: 30,
    width: 30,
    top: 2,
  },
});
