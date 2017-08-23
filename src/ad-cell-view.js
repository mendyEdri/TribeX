import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from 'react-native';

import {
  MKButton,
  MKColor,
  MKIconToggle,
  getTheme,
} from 'react-native-material-kit';

const theme = getTheme();

var Icon = require('react-native-vector-icons/MaterialIcons');
var TimeAgo = require('react-native-timeago');
var Video = require('react-native-video').default;
var Constants = require('./constants');

module.exports = React.createClass({

  getInitialState() {
    return {
      paused: !this.props.autoplay,
      titles: this.props.titles,
      durations: this.props.durations,
      currentIndex: 0,
      currentTitle: this.props.titles[0],
    }
  },

  render() {
    return (
      <View style={styles.row}>
        <TouchableOpacity
          activeOpacity={0.9}
          underlayColor='white'
          onPress={() => {
            this.props.onSelect();
            this.setState({paused: true});
          }}
          style={styles.row}
          >
          <View style={[styles.mainImageContainer]}>
            <Text style={{alignSelf: 'flex-start', left: 18, color: 'gray', fontSize: 11, marginBottom: 6}}>Sponsored</Text>
            <Image source={{uri : this.props.imageUrl }} style={[styles.mainImage]}>
            <View style={styles.dimView}>
              <Image source={{uri : this.props.companyLogo }} style={styles.companyImage} />
              <Text style={{color: 'white', backgroundColor: 'rgba(0,0,0,0.3)', paddingLeft: 5, paddingRight:5, fontWeight: 'bold', fontSize: 30, alignSelf: 'center', top: 10}}>Web Developer</Text>
            </View>
              <Image
                style={{right: 8, width: 20, height: 20,}}
                source={require('../img/vid.png')}>
              </Image>
            </Image>
          </View>
        </TouchableOpacity>
      </View>
    );
  },

  // <Text style={styles.activeLabel}>{this.getMostActiveAuthor(this.props.authors) + ' * Most Active'}</Text>

  getMostActiveAuthor (authors) {
    var frequency = {};
    var max = 0;
    var result;
    for (var v in authors) {
        frequency[authors[v]]=(frequency[authors[v]] || 0)+1;
        if (frequency[authors[v]] > max) {
                max = frequency[authors[v]];
                result = authors[v];
        }
    }
    console.log('result: ' + result);
    return '@' + result;
  },

  getTag() {
    return (
      <View style={{
          backgroundColor: 'rgba(0,0,0,0)',
          position: 'absolute',
          bottom: 18,
        }}>
          <Text style={{
                color: 'black',
                paddingLeft: this.state.currentTitle ? 10 : 0,
                paddingRight: this.state.currentTitle ? 10 : 0,
                backgroundColor: Constants.yellow,
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                alignSelf: 'center',
                fontWeight: 'normal',
                fontSize: 22,
            }}>{this.state.currentTitle}</Text>
        </View>
    );
  },

  getVideo() {
    // var play = false;
    // if (this.props.visible) {
    //   for (var i = 0; i < this.props.length; i++) {
    //       if (i == this.props.cellKey && this.props.visible[i] == true) {
    //         play = true;
    //         break;
    //       }
    //   }
    // }
    // if (!this.props.autoplay) {
    //   return <Image source={{uri : this.props.imageUrl }} style={[styles.mainImage]} />;
    // }
    return (
      <Video source={{uri: this.props.videoLink}}
         ref={(video) => {
           this.video = video;
         }}
         onLoadStart={() => {
         }}
         onLoad={() => {
         }}
         onProgress={(object) => {
           this.currentTime = object.currentTime;
           this.fullTime = object.playableTime;
           this.setState({
             currentTitle: this.state.titles[this.indexForCurrentTime(object.currentTime)],
             currentTime: object.currentTime,
           });
         }}
         onEnd={() => {
           this.setState({
             currentTitle: this.state.titles[0],
             currentTime: 0,
           });
         }}
         rate={1.0}
         volume={0.0}
         muted={true}
         paused={true}
         resizeMode="stretch" //cover //stretch // fill //
         style={styles.video}
         repeat={true}
        />
      );
  },

  //paused={this.state.paused}

  indexForCurrentTime(currentTime) {
    var currentIndex = parseInt(this.state.currentIndex);
    if (currentIndex == this.state.durations.length) {
        currentIndex = 0;
        this.setState({
          currentIndex: currentIndex,
        });
        return currentIndex;
    }
    for (var index in this.state.durations) {
      if (currentTime >= this.durationWithIndex(this.state.durations, parseInt(this.state.currentIndex))) {
         currentIndex += 1;
         this.setState({
           currentIndex: currentIndex,
         });
         break;
      }
     }
     return currentIndex;
  },

  durationWithIndex(durations, toIndex) {
    var total = 0.0;
    for (var index in durations) {
      total += parseFloat(durations[index]);
      if (toIndex == index) {
        return total;
      }
    }
    return total;
  },

 });

var styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  row: {
    flex: 1,
    backgroundColor: 'white', //#ECF0F1
    height: Dimensions.get('window').width, //0.6
    width: Dimensions.get('window').width,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    height: Dimensions.get('window').width,
    width: Dimensions.get('window').width,
    margin: 0, //14
    resizeMode: 'cover',
    //borderRadius: 30,
  },
  mainImage: {
    height: Dimensions.get('window').width * 0.92,
    width: Dimensions.get('window').width * 0.92,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    alignSelf: 'center',
    borderRadius: 10,
    overflow: 'hidden',
  },
  video: {
    height: Dimensions.get('window').width * 1.15,
    width: Dimensions.get('window').width, // * 0.85
    justifyContent: 'center',
    alignItems: 'center',
    //borderRadius: 10,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  mainImageContainer: {
    height: Dimensions.get('window').width, //0.5
    width: Dimensions.get('window').width, //0.4
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 10,
  },
  dimView: {
    top: 0,
    height: Dimensions.get('window').width * 0.92, //0.5
    width: Dimensions.get('window').width * 0.92, //0.4
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveTitle: {
    alignSelf: 'flex-start',
    color: 'red',
    fontWeight: 'bold',
    left: 30,
    fontSize: 12,
  },
  activeTitle: {
    alignSelf: 'flex-start',
    color: 'gray',
    fontWeight: 'bold',
    left: 50,
    fontSize: 12,
  },
  viewsTitle: {
    alignSelf: 'flex-start',
    color: 'gray',
    fontWeight: 'bold',
    left: 70,
    fontSize: 12,
  },
  firstRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  companyView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  companyImageContainer: {
    width: 60,
    height: 60,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245,245,245,1.0)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  companyImage: {
    width: 50,
    height: 50,
    alignSelf: 'center',
  },
  companyName: {
    alignSelf: 'center',
    textAlign: 'center',
    color: 'black',
    fontWeight: 'bold',
    fontSize: 28,
  },
  tag: {
    backgroundColor: 'yellow',
    color: 'black',
  },
  box: {
    flexDirection: 'column',
    width: (Constants.width - (10)) - Dimensions.get('window').width * 0.48,
    height: Dimensions.get('window').width * 0.62 - (50),
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  detailsView: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    position: 'absolute',
    top: 0,
    right: 0,
    width: (Constants.width - (10)) - Dimensions.get('window').width * 0.48,
    height: Dimensions.get('window').width * 0.62,
    backgroundColor: 'white',
  },
  companyDetails: {
    flexDirection: 'column',
    backgroundColor: 'rgba(236, 240, 241, 0.0)',
    width: (Constants.width) - Dimensions.get('window').width * 0.6,
    top: 0,
  },
  textLineContainer1: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60 * 2 + 8,
    height: (Constants.width - (10)) - Dimensions.get('window').width * 0.8,
    backgroundColor: Constants.yellow,
  },
  textLineContainer3: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    backgroundColor: 'rgba(245,245,245,1.0)',
    marginLeft: 4,
  },
  videoCount: {
    fontSize: 32,
    color: 'black',
    fontWeight: 'bold',
  },
  ratingLine: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  ratingOf: {
    fontSize: 18,
    color: 'black',
    fontWeight: 'bold',
    bottom: 3,
  },
  videoSub: {
    fontSize: 14,
    color: 'black',
    fontWeight: 'normal',
    alignSelf: 'center',
  },
  employeeCount: {
    fontSize: 12,
    color: 'gray',
  },
  positionCount: {
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold',
  },
  sub: {
    fontSize: 10,
    color: 'black',
    textAlign: 'center',
  },
  activeLabel: {
    backgroundColor: 'rgba(0,0,0,0)',
    color: 'black',
    fontSize: 14,
  },
});
