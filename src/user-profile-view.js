import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ListView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
  Animated,
  TimerMixin,
  TextInput,
  Alert,
} from 'react-native';

var Video = require('react-native-video').default;
var Constants = require('./constants');
var Mailer = require('NativeModules').RNMail;
var UserStoriesApi = require('./user-stories-api');
import Camera from 'react-native-camera';
import PopupDialog, { SlideAnimation } from 'react-native-popup-dialog';
import Modal from 'react-native-modalbox';
var VideoView = require('./video-view');

var grayBackground = '#EEEEEE';
var dashBorderColor = '#DADFE1';
var rows = [];

module.exports = React.createClass({
  mixins: [TimerMixin],
  getInitialState() {
    var infoRows = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    return {
      userProfileInfoRows: infoRows.cloneWithRows([0,1,2,3,]),
      cameraType: Platform.OS === 'ios' ? 1 : 2, // 1 for front, 2 for back
      positionText: '',
      experienceText: '',
      isThisYou: this.props.user.userId == Constants.uniqueId ? true : false,
      storiesList: [],
      titles: [],
      durations: [],
      key: 0,
      appear: false,
      smallVideoStop: false,
      fullVideoStop: true,
    }
  },

  appear() {
    this.getUserStories();
  },

  getUserStories() {
    UserStoriesApi(this.props.user.userId)
      .then((data) => {
        console.log('api user stories ' + JSON.stringify(data.result));
        this.setState({
          storiesList: data.result,
          titles: this.getTitles(data.result),
          durations: this.getDurations(data.result),
        }, () => {
          console.log('callback');
          this.setState({appear: true, key: Math.random() }, () => {
            this.setState({userProfileInfoRows: this.state.userProfileInfoRows.cloneWithRows([0,1,2,3,4,5])});
          });
        });
    });
  },
  render() {
    return (
      <View style={styles.container}>
        <View>
          <Text style={styles.userName}>{'@' + this.props.user.workEmail.split('@')[0]}</Text>
        </View>
        <View style={{backgroundColor: 'white', marginTop: 15, height: Constants.height * 0.15,}}>
        <View style={{left: 8, top: 8, width: Constants.width * 0.4, borderColor: dashBorderColor, borderWidth: 2, borderStyle: 'dashed',}}>
          <TextInput
            placeholder={'Your Position'}
            style={{height: 30, color: 'gray', backgroundColor: 'rgba(0,0,0,0)', textAlign: 'center'}}
            onChangeText={(text) => this.setState({positionText: text})}
            value={this.state.positionText}
          />
          <TextInput
            keyboardType={'numeric'}
            placeholder={'Years Experience'}
            style={{height: 30, color: 'gray', backgroundColor: 'rgba(0,0,0,0)', textAlign: 'center'}}
            onChangeText={(text) => this.setState({experienceText: text})}
            value={this.state.experienceText}
          />
        </View>
        </View>
        <ListView
          style={styles.listView}
          horizontal={true}
          pagingEnabled={true}
          dataSource={this.state.userProfileInfoRows}
          renderRow={this.profileRows}
          enableEmptySections={true}
          showsHorizontalScrollIndicator={false}
          />
        <TouchableOpacity onPress={() => {
          this.props.scrollToVideo();
        }}
        style={styles.scrollBackButton}>
          <Image
            resizeMode={'stretch'}
            style={{width: 30, height: 20,}}
            source={require('../img/arrow_down_yellow.png')}>
          </Image>
        </TouchableOpacity>
        <Modal style={styles.modal} onClosed={() => {
        }} backdrop={true} position={"center"} ref={"modal1"}>
            {this.getCamera()}
        </Modal>
        <Modal style={styles.modal} backdrop={true} onStartClosing={() => {
          this.setState({fullVideoStop: true});
        }} position={"center"} ref={"modal2"}>
            {this.getFullVideo()}
        </Modal>
        <PopupDialog
          closeOnTouchOutside={true}
          width={Constants.width}
          height={Constants.height * 0.8}
          ref={(popupDialog) => {
            this.popupDialog = popupDialog;
          }}
          title="Popup Dialog"
          >
            {this.getFullVideo()}
         </PopupDialog>
        <View style={{backgroundColor: Constants.yellow, width: Constants.width, height: 3, bottom: 0,}} />
      </View>
    );
  },


  /*
  <PopupDialog
    style={[styles.popup]}
    color={Constants.blue}
    onClosed={() => {
      this.setState({fullVideoStop: true});
    }}
    dialogAnimation = { new SlideAnimation({ slideFrom: 'bottom' }) }
    ref={(popupDialog) => { this.popupDialog = popupDialog; }}>
      <View style={{justifyContent: 'flex-end', borderColor: 'white', borderWidth: 0, backgroundColor: Constants.blue, marginTop: -1, borderRadius: 8, flex: 1,}}>

      </View>
  </PopupDialog>
  */


  profileRows(rowData, sectionID, rowID) {
    return (
      <View ref={(row) => {
        if (row) {
          rows[rowID] = row;
        }
      }} style={styles.rowContainer}>
        <Text style={styles.rowTitle}>{this.headerTextForRowID(rowID)}</Text>
        <View style={styles.rowView}>
          {this.profileCamera(rowID)}
        </View>
      </View>
    );
  },

  profileCamera(rowID) {
      return (
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
          <Text style={{textAlign: 'center', color: '#a9a9a9', fontSize: 18, fontWeight: '300', marginBottom: 8,}}>{this.titleForRowId(rowID)}</Text>
          <TouchableOpacity onPress={() => {
            // this.setState({profileVideo: true, profileVideoIndex: rowID,}, () => {
            //   this.setState({userProfileInfoRows: this.state.userProfileInfoRows.cloneWithRows([0,1,2,3])});
            // });

             this.setState({profileVideo: true});
             this.refs.modal1.open();
            console.log('pressed on row: ' + rows[rowID]);
            console.log('ID: ' + rowID);
          }}>
          {rowID == 0 ? this.state.appear ? this.getVideo() : null : <Text style={{borderWidth: 1, borderColor: 'gray', padding: 8, borderRadius: 4, top: 80, textAlign: 'center', color: 'gray', fontSize: 18, fontWeight: '200', marginBottom: 8,}}>Tap to Start</Text>}
          </TouchableOpacity>
        </View>
      );
  },

  getCamera() {
    return <View style={{
      alignItems: 'center',
      alignSelf: 'center',
      height: Constants.height * 0.6,
      width: Constants.width - 32,
      borderRadius: 8,
      justifyContent: 'flex-end',
      position: 'relative',
      backgroundColor: 'black',
    }}>
    <TouchableOpacity onPress={() => {
      this.setState({profileVideo: false}, () => {
        this.setState({userProfileInfoRows: this.state.userProfileInfoRows.cloneWithRows([0,1,2,3,4])});
        this.refs.modal1.close();
      });
    }}>
     <Text style={{bottom: 10, borderWidth: 1, backgroundColor: 'rgba(0,0,0,0)', borderColor: 'white', padding: 8, borderRadius: 4,  textAlign: 'center', color: 'gray', fontSize: 18, fontWeight: '200', marginBottom: 8,}}>Done</Text>
    </TouchableOpacity>
    </View>;
    return (
      <Camera
          ref={(cam) => {
            this.camera = cam;
          }}
          type={Camera.constants.Type.front}
          style={{
            alignItems: 'center',
            height: Constants.height * 0.6,
            width: Constants.width - 32,
            borderRadius: 8,
            justifyContent: 'flex-end',
            position: 'relative',
            backgroundColor: 'green',
            top: -40,
            right: 0,
          }}
          captureMode={2}
          aspect={Camera.constants.Aspect.fill}>
          <TouchableOpacity onPress={() => {
            this.setState({profileVideo: false});
          }}>
           <Text style={{bottom: 10, borderWidth: 1, backgroundColor: 'rgba(0,0,0,0)', borderColor: 'white', padding: 8, borderRadius: 4,  textAlign: 'center', color: 'gray', fontSize: 18, fontWeight: '200', marginBottom: 8,}}>Done</Text>
          </TouchableOpacity>
        </Camera>
    );
  },

  getFullVideo() {
    if (!this.state.storiesList || !this.state.appear) {
      return null;
    }
    return (
      <VideoView
              ref={'fullVideo'}
              resizeMode={'stretch'}
              muted={this.state.fullVideoStop}
              tapEnabled={false}
              style={{backgroundColor: 'rgba(0,0,0,1)', position: 'relative', height: Constants.height * 0.8, width: 375, borderRadius: 8,}}
              key={this.state.key}
              showControllers={false}
              videoLink={this.state.storiesList[0].videoLink}
              videosDuration={this.getDurations(this.state.storiesList)}
              titles={this.getTitles(this.state.storiesList)}
              authors={this.getAuthors(this.state.storiesList)}
              stopVideo={this.state.fullVideoStop}
              thumbnail={this.state.imageLink}
              onScrollToCompanyProfile={() => {

              }}
              onScrollToUserProfile={() => {

              }}
              onEnd={() =>{

            }}/>
    );
  },

  getVideo() {
    console.log('getVideo called ' + this.state.appear);
    if (!this.state.storiesList) {
      return null;
    }
    return <View><VideoView
            resizeMode={'cover'}
            muted={true}
            tapEnabled={false}
            style={{top: -8, position: 'relative', height: Constants.height * 0.6, width: Constants.width - 36, borderRadius: 8,}}
            key={this.state.key}
            showControllers={false}
            videoLink={this.state.storiesList[0].videoLink}
            videosDuration={this.getDurations(this.state.storiesList)}
            titles={this.getTitles(this.state.storiesList)}
            authors={this.getAuthors(this.state.storiesList)}
            stopVideo={this.state.smallVideoStop}
            thumbnail={this.state.imageLink}
            videoTaped={() => {

            }}
            onScrollToCompanyProfile={() => {
              // this.scrollToCompanyProfile();
              // this.setState({stopVideo: true});
            }}
            onScrollToUserProfile={() => {
              // this.scrollToUserProfile();
              // this.setState({stopVideo: true});
            }}
            onEnd={() =>{
              // this.setState({modalVisible: false, currentTitle: '', currentIndex: 0, currentAuthor: '', bounceValue: new Animated.Value(0),});
              // this.props.onPlaying(false);
              // this.props.lock(false);
          }}/>
          <TouchableOpacity onPress={() => {
            //this.refs.modal2.open();
            this.popupDialog.openDialog();
            this.setState({smallVideoStop: true, fullVideoStop: false,});
          }}>
            <Text>Expend</Text>
          </TouchableOpacity>
          </View>;
  },

  getAuthors(stories) {
    var authors = [];
    for (var index in stories) {
      if (stories[index].author) {
         authors.push(stories[index].author.workEmail);
      }
    }
    return authors;
  },

  getTitles(stories) {
    var titles = [];
    for (var index in stories) {
      if (stories[index].videoDuration) {
         titles.push(stories[index].title);
      }
    }
    return titles;
  },

  getDurations(stories) {
    var durations = [];
    for (var index in stories) {
      if (stories[index].videoDuration) {
         durations.push(parseFloat(stories[index].videoDuration));
      }
    }
    return durations;
  },

  titleForRowId(rowID) {
    var array = ["","One Cool Thing About Your Position", "🍾" , "🚵‍♀️"];
    return array[rowID];
  },

  headerTextForRowID(rowID) {
    var array = ["Videos by " + '@' + this.props.user.workEmail.split('@')[0], "Your Role", "My Passion", "Hobby",];
    return array[rowID];
  },
});


var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    height: Constants.height,
    justifyContent: 'center',
  },
  userName: {
    top: 10,
    fontSize: 42,
    fontWeight: 'bold',
    alignSelf: 'center',
    textAlign: 'center',
    color: 'gray',
  },
  listView: {
    alignSelf: 'center',
    //top: (Constants.height * 0.3) - Constants.height * 0.18,
    marginTop: 0,
  },
  scrollBackButton: {
    height: 40,
    width: 40,
    left: Constants.width / 2 - (40/2),
    bottom: 2,
    backgroundColor: 'rgba(0,0,0,0)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  rowContainer: {
    backgroundColor: 'rgba(0,0,0,0)',
    height: Constants.height * 0.7,
    width: Constants.width,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    color: Constants.blue,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  rowView: {
    height: Constants.height * 0.6,
    width: Constants.width - 32,
    borderRadius: 8,
    borderWidth: 3,
    backgroundColor: '#EEEEEE',
    borderColor: '#DADFE1',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
   justifyContent: 'center',
   alignItems: 'center',
   alignSelf: 'center',
   height: Constants.height,
   backgroundColor: 'rgba(0,0,0,0)',
 },
 popup: {
   position: 'absolute',
 },
});
