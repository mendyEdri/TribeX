import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Navigator,
  ListView,
  TouchableOpacity,
  TouchableHighlight,
  Image,
  Modal,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';

var Video = require('react-native-video').default;
var Constants = require('./constants');
var Mailer = require('NativeModules').RNMail;
var Interval = null;
var someIndex = -1;

module.exports = React.createClass({
  getInitialState() {
    return {
      currentAuthor: '',
      shouldSeek: false,
      seekTime: 0,
      bounceValue: new Animated.Value(0),
      currentTime: 0,
      currentUser: '',
      currentIndex: 0,
      currentTitle: '',
      durations: this.props.videosDuration,
      titles: this.props.titles,
      authors: this.props.authors,
      users: this.props.users,
      companyId: this.props.companyId,
      showVideoView: false,
    }
  },
  componentWillUnmount() {

  },

  render() {
    return (
      <View>
        {this.getThumbnailImageView()}
        {this.props.showControllers ? this.getCloseVideoButton() : null}
        {this.props.showControllers ? this.getAnimationTimer() : null}
        {this.props.showControllers ? this.getReportButton() : null}
        {this.props.showControllers ? this.getCompanyProfileButton() : null}
      </View>
    );
  },

  getThumbnailImageView() {
      return (
          <Image
            style={{
              height: Constants.height, width: Constants.width,
              backgroundColor: 'black'}}
            source={{uri: this.props.thumbnail}}
          >
            {this.getVideoComponent()}
            {this.getTag()}
            {this.getAuthorLable()}
            {this.getTimer()}
          </Image>
      );
  },

  getTag() {
    return (
      <View style={{
          backgroundColor: 'rgba(0,0,0,0)',
          width: Dimensions.get('window').width,
          position: 'absolute',
          top: 44,
        }}>
          <Text style={{
                color: 'white',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                alignSelf: 'flex-start',
                fontWeight: 'normal',
                paddingLeft: this.state.currentTitle ? 10 : 0,
                paddingRight: this.state.currentTitle ? 10 : 0,
                fontSize: 24,
            }}>{this.state.currentTitle}</Text>
        </View>
    );
  },

  getAuthorLable() {
      return (
        <TouchableOpacity style={{
          position: 'absolute',
          top: 8,
          left: 5,
          height: 40,
          justifyContent: 'center',
          alignItems: 'center',
        }} onPress={() => {
          this.props.onScrollToUserProfile(this.state.currentUser);
        }}>
        <Text style={{fontSize: 18, backgroundColor: 'rgba(0,0,0,0)', fontWeight: 'bold', color: 'white',}}>
          {this.state.currentAuthor ? '@' + this.state.currentAuthor : ''}
        </Text>
        </TouchableOpacity>
      );
  },

  getTimer() {
    return (
      <View style={styles.timer}></View>
    );
  },

  getReportButton() {
    return (
      <TouchableOpacity style={{
        position: 'absolute',
        bottom: 2,
        right: 10,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
      }} onPress={() => {
         this.sendSupportEmail();
      }}>
      <Text style={{backgroundColor: 'rgba(0,0,0,0)', fontWeight: 'bold', color: 'white',}}>
        Report
      </Text>
      </TouchableOpacity>
    );
  },

  getCompanyProfileButton() {
    return (
      <TouchableOpacity onPress={() => {
        this.props.onScrollToCompanyProfile();
      }}
      style={{height: 40, width: 40, left: Constants.width / 2 - (40/2), bottom: 8,
       backgroundColor: 'rgba(0,0,0,0)',
       justifyContent: 'center',
       alignItems: 'center',
       position: 'absolute',
     }}
      >
      <Image
        style={{width: 40, height: 40,}}
        source={require('../img/more.png')}>
      </Image>
      </TouchableOpacity>
    );
  },

  getCloseVideoButton() {
    return (
      <TouchableOpacity onPress={() => {
        this.setState({modalVisible: false, currentTitle: '', currentIndex: 0, currentAuthor: ''});
        this.props.onEnd();
        clearInterval(Interval);
        Interval = null;
        someIndex = -1;
      }}
      style={{height: 44, width: 34, left: 8, bottom: 8,
       backgroundColor: 'rgba(0,0,0,0)',
       justifyContent: 'center',
       alignItems: 'center',
       position: 'absolute',
     }}
      >
      <Image
        style={{width: 30, height: 30,}}
        source={require('../img/X.png')}>
      </Image>
      </TouchableOpacity>
    );
  },

  getAnimationTimer() {
      return (
        <Animated.View style={{
          alignSelf: 'flex-start',
          position: 'absolute',
          width: this.widthForProgress(),
          height: 3,
          top: 0,
          left: 0,
          backgroundColor: 'rgba(255,255,255,0.7)',
        }}/>
      );
  },

  widthForProgress() {
    return this.state.bounceValue;
  },

  getVideoComponent() {
    return (
      <TouchableOpacity activeOpacity={1.0} onPress={() => {
        if (this.video && this.props.tapEnabled) {
          this.seekNext();
          if (this.props.videoTaped) {
            this.props.videoTaped();
          }
        }
      }}>
      <Video source={{uri: this.props.videoLink}}
         ref={(video) => {
           this.video = video;
         }}
         onLoadStart={() => {
           this.setState({bounceValue: new Animated.Value(0)})
         }}
         onLoad={() => {
           //console.log('loading: ' + this.state.videoLink);
         }}
         onProgress={(object) => {
           this.currentTime = object.currentTime;
           this.setState({
             currentTitle: this.state.titles ? this.state.titles[this.indexForCurrentTime(object.currentTime)] : '',
             currentTime: object.currentTime,
             currentAuthor: this.state.authors ? this.state.authors[this.indexForCurrentTime(object.currentTime)] : '',
             currentUser: this.state.users ? this.state.users[this.indexForCurrentTime(object.currentTime)] : '',
           });

           if (this.currentTime > 0) {
             if (!Interval) {
               Interval = setInterval(() => {
                 if (someIndex != this.indexForCurrentTime(object.currentTime)) {
                   someIndex = this.indexForCurrentTime(object.currentTime);
                   console.log('**************** VIDEO CHANGED **************** ' + someIndex);
                   Animated.timing(
                      this.state.bounceValue,
                      {toValue: Constants.width,
                      duration: this.state.durations[this.state.currentIndex] * 1000}
                    ).start();
                   }
               }, 250);
             }
           }
         }}
         onEnd={() => {
           console.log('video ended');
           this.setState({modalVisible: false, currentTitle: '', currentIndex: 0, currentAuthor: '', bounceValue: new Animated.Value(0),});
           this.props.onEnd();
           clearInterval(Interval);
           Interval = null;
           someIndex = -1;
         }}
         rate={1.0}
         volume={1.0}
         muted={this.props.muted}
         paused={this.props.stopVideo}
         resizeMode={this.props.resizeMode} //cover //stretch // fill //
         style={this.props.style}
         repeat={false}
        />
      </TouchableOpacity>
    );
  },

  seekNext() {
    var n = this.timeTillTimeAtIndex(this.state.currentIndex);
    console.log('seeking to: ' + n);
    this.video.seek(n);
  },

  calculateFullVideoTime(durations) {
    var time = 0.0;
    for (var i = 0; i < durations.length; i++) {
       time += durations[i];
    }
    return time;
  },

  // getDurationsForCompanyId(stories, companyId) {
  //   var durations = [];
  //   for (var index in stories) {
  //     if (stories[index].videoDuration && stories[index].company.companyId == companyId) {
  //        durations.push(parseFloat(stories[index].videoDuration));
  //     }
  //   }
  //   return durations;
  // },

  indexForCurrentTime(currentTime) {
    var currentIndex = parseInt(this.state.currentIndex);
    for (var index in this.state.durations) {
      if (currentTime > this.durationWithIndex(this.state.durations, currentIndex) && currentIndex <= this.state.durations.length) {
         currentIndex += 1;
         this.setState({
           currentIndex: currentIndex,
           bounceValue: new Animated.Value(0),
         });
         break;
      }
     }
     return currentIndex;
  },

  timeTillTimeAtIndex(index) {
    var time = 0;
    var durations = this.state.durations;
    console.log('duration length: ' + this.props.videosDuration);
    for (var i = 0; i < durations.length; i++) {
      if (index == durations.length) {
        time = this.fullTime;
        this.setState({modalVisible: false, currentTitle: '', currentIndex: 0, currentAuthor: ''});
        break;
      }
      if (i > index) {
        break;
      }
      time += durations[i];
    }
    // ## Math.ceil(time) + 0.05
    console.log('math: ' + Math.ceil(time));
    console.log('regular: ' + time);
    return Math.ceil(time);
  },

  durationWithIndex(durations, toIndex) {
    var total = 0.0;
    for (var index in durations) {
      total += durations[index];//parseFloat(durations[index]);
      if (toIndex == index) {
        return total;
      }
    }
    return total;
  },

  sendSupportEmail() {
    Mailer.mail({
     subject: 'Report Story',
     recipients: ['support@talenttribe.me'],
    //  ccRecipients: ['supportCC@example.com'],
    //  bccRecipients: ['supportBCC@example.com'],
     body: 'Hey team, i think this story should not be on TribeX Platform.' + '                                               ' +
      'Title: ' + this.state.currentTitle + '           Time: ' + this.state.currentTime + '                            ' + this.state.videoLink,
     isHTML: false, // iOS only, exclude if false
     attachment: {
       path: '',  // The absolute path of the file from which to read data.
       type: '',   // Mime Type: jpg, png, doc, ppt, html, pdf
       name: '',   // Optional: Custom filename for attachment
     }
   }, (error, event) => {
       if(error) {
         AlertIOS.alert('Error', 'Could not send mail. Please send a mail to support@talenttribe.me');
       }
   });
  },

});

var styles = StyleSheet.create({

});
