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

var rowHeight = Dimensions.get('window').width * 0.4;
var rowWidth = Dimensions.get('window').width;

module.exports = React.createClass({

  getInitialState() {
    return {
      paused: !this.props.autoplay,
      titles: this.props.titles,
      durations: this.props.durations,
      currentIndex: 0,
      currentTitle: this.props.titles[0],
      transform: new Animated.Value(Dimensions.get('window').width),
    }
  },

  render() {
    return (
      <View style={[styles.row], {marginTop: this.props.cellKey == 0 ? Dimensions.get('window').width * 0.08 / 2 : 0}}>
        <TouchableOpacity
          activeOpacity={0.9}
          underlayColor='white'
          onPress={() => {
            this.props.onSelect();
          }}
          style={styles.row}
          >
          <Image style={[styles.mainImage]} source={{uri : this.props.imageUrl }} />
          <View style={styles.dimView}>
            <Image source={{uri : this.props.companyLogo }} style={[styles.companyImage]} />
            <Text style={{textAlign: 'center', color: 'white', backgroundColor: 'rgba(0, 0, 0, 0.6)', paddingLeft: 8, paddingRight:8, fontWeight: 'bold', fontSize: 30, alignSelf: 'center', top: 10}}>{this.props.companyName}</Text>
          </View>
          <Image
            style={{position: 'absolute', bottom: 8, right: 26, width: 32, height: 32,}}
            source={require('../img/vid.png')}>
          </Image>
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
    backgroundColor: '#ECF0F1',
  },
  row: {
    flex: 1,
    backgroundColor: 'white', //#ECF0F1
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: rowWidth,
    height: rowHeight,
    marginBottom: Dimensions.get('window').width * 0.08 / 2,
  },
  image: {
    height: rowHeight,
    width: rowWidth,
    resizeMode: 'cover',
    //borderRadius: 30,
  },
  mainImage: {
    height: rowHeight,
    width: rowWidth / 2,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    alignSelf: 'center',
    borderRadius: 10,
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
    height:rowHeight, //0.5
    width: rowWidth, //0.4
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 10,
  },
  dimView: {
    height: rowHeight, //0.5
    width: rowWidth * 0.92, //0.4
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    left: rowWidth * 0.08 / 2,
    top: 0,
  },
  viewsTitle: {
    alignSelf: 'flex-start',
    color: 'gray',
    fontWeight: 'bold',
    left: 70,
    fontSize: 12,
  },
  companyImageContainer: {
    width: 60,
    height: 60,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245,245,245,1.0)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  companyImage: {
    width: 50,
    height: 50,
    alignSelf: 'center',
    borderRadius: 4,
  },
  companyName: {
    alignSelf: 'center',
    textAlign: 'center',
    color: 'black',
    fontWeight: 'bold',
    fontSize: 28,
  },
});
