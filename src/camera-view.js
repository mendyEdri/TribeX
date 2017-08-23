'use strict';
import React, { Component } from 'react';
import {
  AppRegistry,
  Dimensions,
  StyleSheet,
  TouchableHighlight,
  Text,
  View,
  Navigator,
  ListView,
  TouchableOpacity,
  Image,
  Animated,
  TextInput,
  AsyncStorage,
  Modal,
  Platform,
  CameraRoll,
} from 'react-native';

import Camera from 'react-native-camera';
import FileUploader from 'react-native-file-uploader'

import Confetti from 'react-native-confetti';

var Video = require('react-native-video').default;
var timer = null;
var themeColor = 'rgba(192, 57, 43,1.0)';
var AssociateCompany = require('./associate-company-view');
var AddStoryApi = require('./add-story-api');

var Constants = require('./constants');
var Mixpanel = require('react-native-mixpanel');
var SplashScreen = require('@remobile/react-native-splashscreen');

var tags = ['#TYPE_YOUR_OWN', '#WorkInProgress', '#DIY',
            '#CodeNinja', '#workplace', '#NerdAlert', '#WorkHardPlayPlayHard',
            '#GirlPower', '#TGIF', '#I’mWithHer',
            '#GoodVibes', '#JustDoIt', '#MorningCoffee', '#IWokeUpLikeThis',
            '#WeekendIsHere', '#WinterIsComing', '#energizing', '#EveryHourIsHappyHour', '#ThisIsWhyIShouldBeThePresidentOfUS'];

module.exports = React.createClass({
  getInitialState() {
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    return {
      fill: 18,
      isRecording: false,
      screenStateRecord: true, // should be true
      videoPath: null, //null,
      timesArray: null, // null
      cameraType: Platform.OS === 'ios' ? 1 : 2, // 1 for front, 2 for back
      cameraMediaMode: 1, // 1 for video, 2 for photo
      secondsColor: 'white',
      dataSource: ds.cloneWithRows(tags),
      selectedTag: '',
      showSingleTag: false,
      showInputView: false,
      inputText: '',
      modalVisible: false, // should be false
      isUploading: false,
      groupTypes: 'SavedPhotos',
      sliderValue: 1,
      bigImages: true,
      editing: false,
      dim: true,
      placeholder: tags[0],
    };
  },

  componentDidMount() {
    SplashScreen.hide();
  },

  render() {
    var screen = this.state.modalVisible ? this.getAssociateCompanyView() : this.state.screenStateRecord ? this.getCamera() : this.getViewer();
    return (
      <View style={styles.container}>
        {screen}
      </View>
    );
  },

  getCamera() {
    if (Platform.OS === 'ios') {
      console.log('ios camera is active **********');
      return this.cameraIOS();
    }
    return (
      <View style={{flex: 1,}}>
        <Camera
            ref={(cam) => {
              this.camera = cam;
            }}
            type={this.state.cameraType}
            style={styles.preview}
            captureMode={this.state.cameraMediaMode == 1 ? 1 : 2}
            aspect={Camera.constants.Aspect.fill}>
            orientation={'portrait'}
            {this.getDimView()}
          </Camera>
          {this.captureButton()}
          {this.handleTagView()}
          {this.getSwitchButton()}
        </View>
      );
  },
  getDimView() {
    return <View style={{
      position: 'absolute',
      top: 0,
      right: 0,
      width: Constants.width,
      height: Constants.height,
      backgroundColor: this.state.isRecording ? 'rgba(0,0,0,0)' : !this.state.showSingleTag ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)',
    }}></View>
  },

  uploadingView() {
    return <View style={{
      position: 'absolute',
      top: 0,
      right: 0,
      width: Constants.width,
      height: Constants.height,
      backgroundColor: this.state.isUploading ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0)',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Text style={{fontSize: 40, color: 'white', alignSelf: 'center',}}>{this.getUploadingText()}</Text>
    </View>
  },

  getUploadingText() {
    return this.state.isUploading ? 'Uploading Video..' : '';
  },
  cameraIOS() {
    return (
      <View style={{flex: 1,}}>
        <Camera
            ref={(cam) => {
              this.camera = cam;
            }}
            type={this.state.cameraType}
            style={styles.preview}
            captureMode={this.state.cameraMediaMode == 1 ? 1 : 2}
            captureAudio={true}
            captureTarget={Camera.constants.CaptureTarget.disk}
            aspect={Camera.constants.Aspect.fill}>
            {this.getDimView()}
          </Camera>
          {this.captureButton()}
          {this.handleTagView()}
          {this.getSwitchButton()}
        </View>
      );
  },

  dummyView() {
    return (
      <Text style={{
        position: 'absolute',
        top: (Dimensions.get('window').height / 2) - 120,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        color: 'white',
        fontWeight: 'bold',
        fontSize: 40,
        textAlign: 'center',
      }}>Love Your Job</Text>
    );
  },

  handleTagView() {
    if (!this.state.screenStateRecord && this.state.editing) {
      return this.handleSingleTag();
    }
    return this.state.showSingleTag ? this.handleSingleTag() : this.getListView();
  },

  handleSingleTag() {
    return this.state.showInputView ? this.getInputView() : this.getSingleTagView();
  },

  getSingleTagView() {
    return <View style={{
      backgroundColor: 'rgba(0,0,0,0)',
      width: Dimensions.get('window').width,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      top: 18,
    }}>
     <TouchableOpacity style={{
              backgroundColor: 'rgba(0,0,0,0)',
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'flex-start',
    }}
      onPress={() => {
        if (this.state.screenStateRecord) {
          this.setState({showSingleTag: !this.state.showSingleTag, selectedTag: ''});
        }
    }}>
            <Text style={{
              color: 'white',
              backgroundColor: 'rgba(0,0,0,0.4)',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              alignSelf: 'center',
              fontWeight: 'normal',
              fontSize: 24,
              paddingLeft: 10,
              paddingRight: 10,
              paddingTop: 5,
            }}>{this.state.selectedTag}</Text>
           </TouchableOpacity>
      </View>
  },

  getInputView() {
    return this.state.isRecording ? null : <View style={{
      backgroundColor: 'rgba(0,0,0,0)',
      width: Dimensions.get('window').width,
      height: 60,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      top: Dimensions.get('window').height / 2 - 60,
    }}>
    <TextInput style={{
      backgroundColor: Constants.yellow,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      height: 56,
      width: Dimensions.get('window').width,
      color: 'black',
      fontWeight: 'bold',
      fontSize: 30,
      textAlign: 'center',
    }}
    placeholderTextColor={'black'}
    autoFocus={true}
    autoCapitalize={'none'}
    placeholder={this.state.placeholder}
    returnKeyType={'next'}
    onChangeText={(text) => {
      this.setState({inputText: text})
    }}
    onSubmitEditing={() => {
      if (this.state.editing) {
        this.setState({inputText: '', showInputView: false, showSingleTag: true, selectedTag: this.state.inputText});
        return;
      }
      if (this.state.inputText == '') {
        this.setState({showInputView: false, showSingleTag: false,});
        return;
      }
      if (!tags.includes(this.state.inputText)) {
        tags.splice(1, 0, this.state.inputText);
      }
      this.setState({inputText: '', dataSource: this.state.dataSource.cloneWithRows(tags), showInputView: false, showSingleTag: true, selectedTag: tags[1]});
    }}
    >
    </TextInput>
    </View>
  },

  getListView() {
    if (!this.state.screenStateRecord && this.state.selectedTag.length == 0 && this.state.editing == false) {
      return null;
    }
    return this.state.isRecording ? null : (
      <View style={{
        marginTop: Dimensions.get('window').height / 2 - ((Dimensions.get('window').height / 2) / 2) - 38,
        position: 'absolute',
        top: 0,
        height: Dimensions.get('window').height / 2 + (38),
        width: Dimensions.get('window').width,
      }}>
        <Text style={{
          color: 'white',
          fontSize: 28,
          textAlign: 'center',
          fontWeight: 'bold',
          backgroundColor: 'rgba(0,0,0,0)',
        }}>Tag Your Video</Text>
        <ListView
            style={styles.tagsList}
            dataSource={this.state.dataSource}
            renderRow={this.renderRow}
           >
        </ListView>
      </View>
    );
  },

  renderRow: function(rowData: Object, sectionID: number, rowID: number,
    highlightRow: (sectionID: number, rowID: number) => void) {
      return (
        this.getTagRow(rowData, rowID)
      );
  },

  getTagRow(rowData, rowID) {
    return (
      <TouchableOpacity onPress={() => {
        Mixpanel.trackWithProperties('Tag Selected', {tag_title: rowData, tag_index: rowID});
        if (rowData == tags[0]) {
          this.setState({showSingleTag: true, showInputView: true, dim: false});
          return;
        }
        this.setState({showSingleTag: !this.state.showSingleTag, selectedTag: rowData, showInputView: false, dim: false});
      }}>
        <Text style={{
          alignItems: 'center',
          justifyContent: 'center',
          margin: 5,
          color: rowData == tags[0] ? 'white' : 'black',
          textAlign: 'center',
          alignSelf: 'center',
          fontWeight: 'normal',
          fontSize: 26,
          paddingLeft: 10,
          paddingRight: 10,
          backgroundColor: rowData == tags[0] ? Constants.blue : Constants.yellow,
        }}>{rowData}</Text>
      </TouchableOpacity>
    );
  },

  _switchCamera() {
    var state = this.state;
    state.cameraType = state.cameraType === Camera.constants.Type.back
      ? Camera.constants.Type.front : Camera.constants.Type.back;
    this.setState(state);
  },

  getSwitchButton() {
      if (this.state.isRecording) {
        return null;
      }
      return (
        <TouchableOpacity style={{height: 64, width: 64, top: 0, right: 0, position: 'absolute'}} onPress={() => {
          this._switchCamera();
        }}>
        <Image
          style={{left: 0, height: 64, width: 64,}}
          source={require('../img/flip_cam.png')} />
        </TouchableOpacity>
      );
  },

  captureButton() {
    return <TouchableOpacity
      style={styles.capture}
      onPress={() => {
        if (timer) {
          this.clearInterval();
          return;
        }
        this.capturing();
        Mixpanel.trackWithProperties('Camera Started Shooting', {selected_tag: this.state.selectedTag});
        timer = setInterval(() => {
          if (this.state.fill == 1) {
            this.clearInterval();
            return;
          }
          this.setState({fill: this.state.fill - 1});
        }, 1000);
      }}
      >
      <View style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: this.state.isRecording ? Constants.yellow : 'rgba(0,0,0,0)',
        borderRadius: 40,
      }}>
        {this.innerButton()}
      </View>
    </TouchableOpacity>
  },

  innerButton() {
    return this.state.isRecording ? this.getSeconds() : <Image
      style={styles.oval}
      source={require('../img/vid.png')}>
    </Image>;
  },

  getSeconds() {
     return <Text style={this.secondsStyle()}>{this.state.cameraMediaMode == 1 ? this.state.fill : ""}</Text>;
  },

  secondsStyle() {
    return {
      fontSize: 30,
      fontWeight: 'bold',
      borderWidth: 0,
      alignSelf: 'center',
      color: this.state.secondsColor,
      backgroundColor: 'rgba(0,0,0,0)',
    }
  },

  clearInterval() {
    clearInterval(timer);
    timer = null;
    this.capturing();
    this.setState({fill: 18});
  },

  capturing() {
    if (Platform.OS === 'ios' && this.state.isRecording) {
      console.log('Stop:');
      this.props.onRecording(false);
      this.props.lock(false);
      this.camera.stopCapture();
      return;
    }
    this.props.lock(!this.state.isRecording);
    this.props.onRecording(!this.state.isRecording);
    this.setState({isRecording: !this.state.isRecording});
    this.camera.capture()
     .then((data) => {
       console.log('data: ' + JSON.stringify(data));
       this.setState({ videoPath : Platform.OS === 'ios' ? data.path :  data.data,
                       screenStateRecord : false,
                    });
     })
     .catch(err => console.error(err));
  },

  getCloseButton() {
    return <TouchableOpacity
      style={styles.close}
      onPress={() => {
        if (this.state.isUploading) {
          return;
        }
        this.props.onRecording(false);
        this.setState({ isRecording: false,
                        screenStateRecord: true,
                        videoPath: null,
                        isUploading: false,
                      });
      }}
      >
      <View style={[styles.ovalContainer]}>
        <Image
          style={styles.ovalClose}
          source={require('../img/X.png')}>
        </Image>
        </View>
    </TouchableOpacity>
  },

  getEditButton() {
    return <TouchableOpacity
      style={styles.editTool}
      onPress={() => {
        if (this.state.isUploading) {
          return;
        }
        this.setState({ editing: true, showSingleTag: true, isRecording: false, showInputView: true, inputText: this.state.selectedTag,  placeholder: this.state.selectedTag ? this.state.selectedTag : this.state.inputText ? this.state.inputText : tags[0]});
      }}
      >
      <View style={[styles.ovalContainer]}>
        <Image
          style={styles.ovalClose}
          source={require('../img/edit_tool.png')}>
        </Image>
        </View>
    </TouchableOpacity>
  },

  getFlipCamera() {
    return <TouchableOpacity
      style={styles.switchCam}
      onPress={() => {
        this._switchCamera();
      }}
      >
      <View style={styles.ovalContainer}>
        <Image
          style={styles.ovalClose}
          source={require('../img/flip_cam.png')}>
        </Image>
        </View>
    </TouchableOpacity>
  },

  getVideoButton() {
    return <TouchableOpacity
      style={styles.camIcons}
      onPress={() => {
        console.log('getVideoButton');
        this.setState({cameraMediaMode: 2});
      }}
      >
      <View style={styles.ovalContainer}>
        <Image
          style={styles.ovalClose}
          source={require('../img/photo-camera.png')}>
        </Image>
        </View>
    </TouchableOpacity>
  },

  getPhotoButton() {
    return <TouchableOpacity
      style={styles.camIcons}
      onPress={() => {
        console.log('getPhotoButton');
        this.setState({cameraMediaMode: 1});
      }}
      >
      <View style={styles.ovalContainer}>
        <Image
          style={styles.ovalClose}
          source={require('../img/video-camera.png')}>
        </Image>
        </View>
    </TouchableOpacity>
  },

  getViewer() {
    return (
      <View style={styles.videoView}>
          {this.state.cameraMediaMode == 1 ? this.getVideo() : this.getImageView()}
          {this.uploadingView()}
          {this.getCloseButton()}
          {this.getEditButton()}
          {this.getSendButton()}
          {this.handleTagView()}
          <Confetti confettiCount={1000} duration={3000} ref={(node) => this._confettiView = node}/>
      </View>
     );
  },

  getVideo() {
    return (
      <Video source={{uri: this.state.videoPath}}
         ref={(video) => {
           this.video = video;
         }}
         onProgress={(object) => {
           this.props.onRecording(true);
           this.currentTime = object.currentTime;
           this.fullTime = object.playableTime;
         }}
         onEnd={() => {
           console.log('video ended');
         }}
         rate={1.0}
         volume={1.0}
         muted={false}
         paused={false}
         resizeMode="stretch" //cover //stretch // fill //
         style={styles.backgroundVideo}
         repeat={true}
        />
    );
  },

//this.state.videoPath
  getImageView() {
    return (
    <Image source={{uri: this.state.videoPath}}
       style={{flex: 1}}
      />
    );
  },

  getSendButton() {
    return (
      <TouchableOpacity
        style={styles.send}
        onPress={() => {
          // check if user registerd
          AsyncStorage.getItem("CompanyValidated").then((value) => {
            if (value == 'true') {
              console.log('upload video');
              if (!this.state.isUploading) {
                this.setState({isUploading: true});
                //this._confettiView.startConfetti();
                this.uploadVideo();
              }
            } else {
              console.log('false');
              this.setState({modalVisible: true});
            }
          });
        }}
        >
        <Image
          style={styles.ovalSend}
          source={require('../img/V.png')}
        />
      </TouchableOpacity>
    );
  },

  async uploadVideo() {
    const settings = {
      uri: this.state.videoPath,
      uploadUrl : Constants.server + 'media/uploadLiveVideo/' + Constants.uniqueId,
      method: 'POST', // default to 'POST'
      fileName: 'videoFile' , // default to 'yyyyMMddhhmmss.xxx'
      fieldName: 'videoFile', // default to 'file'
      contentType: 'application/octet-stream', // default to 'application/octet-stream'
      data: {}
    };

    FileUploader.upload(settings, (err, res) => {
      this.setState({isUploading: false});
      this.props.onRecording(false);
      if (res.status == 200) {
          console.log("Duration: " + JSON.parse(res.data).duration);
          AddStoryApi(Constants.uniqueId, this.state.selectedTag, JSON.parse(res.data).videoLink, JSON.parse(res.data).duration).then((data) => {
          if (data) {
            this.setState({screenStateRecord: true, isRecording: false, isUploading: false});
            this._confettiView.removeConfetti();
          }
        });
      }
    }, (sent, expectedToSend) => {

    });
  },

  getAssociateCompanyView() {
    return (
      <Modal
        animationType={'slide'}
        visible={this.state.modalVisible}
        onRequestClose={() => {

        }}
        >
        <AssociateCompany close={this.closeModal}/>
      </Modal>
    );
  },

  closeModal() {
    this.setState({modalVisible: false});
  },

  handleSeek() {
    for (var i = 0; i < this.state.timesArray.length; i++) {
      if (this.state.timesArray[i] > this.currentTime) {
        this.video.seek(this.state.timesArray[i]);
        break;
      } else if (i == this.state.timesArray.length) {
        this.video.seek(this.state.timesArray[0]);
      }
    }
  },
});

var styles = StyleSheet.create({
  container: {
     flex: 1,
   },
   preview: {
     flex: 1,
     justifyContent: 'flex-end',
     alignItems: 'center',
     height: Dimensions.get('window').height,
     width: Dimensions.get('window').width
   },
   videoView: {
     alignSelf: 'stretch',
     flex: 1,
   },
   tagsList: {
     marginTop: 10,
     position: 'absolute',
     height: Dimensions.get('window').height / 2, //- 190
     width: Dimensions.get('window').width,
   },
   rowStyle: {
     alignItems: 'center',
     justifyContent: 'center',
     margin: 5,
     color: 'black',
     textAlign: 'center',
     alignSelf: 'center',
     fontWeight: 'normal',
     fontSize: 26,
     paddingLeft: 10,
     paddingRight: 10,
   },
   ovalContainer: {
     flex: 1,
     alignItems: 'center',
     justifyContent: 'center',
     borderRadius: 40,
   },
   oval: {
     flex: 0,
     justifyContent: 'center',
     alignItems: 'center',
     width: 40,
     height: 40,
   },
   ovalSend: {
     flex: 0,
     justifyContent: 'center',
     alignItems: 'center',
     width: 30,
     height: 30,
     //borderRadius: 0,
   },
   ovalClose: {
     flex:0,
     justifyContent: 'center',
     alignItems: 'center',
     width: 30,
     height: 30,
   },
   seconds: {
     fontSize: 30,
     fontWeight: 'bold',
     borderWidth: 0,
     alignSelf: 'flex-start',
     bottom: 50,
     left: 50,
     position: 'absolute',
     color: 'white',
   },
   capture: {
     bottom: 80 + 14,
     alignSelf: 'center',
     width: 80,
     height: 80,
     borderWidth: 2,
     borderColor: 'white',
     borderRadius: 40,
   },
   backgroundVideo: {
     flex: 1,
   },
   close: {
     bottom: 30,
     left: Dimensions.get('window').width / 2 - (40/2) - 90,
     width: 40,
     height: 40,
     alignSelf: 'flex-start',
     position: 'absolute',
     alignItems: 'center',
     justifyContent: 'center',
   },
   switchCam: {
     top: 0,
     width: 50,
     height: 50,
     alignSelf: 'flex-end',
     position: 'absolute',
     alignItems: 'center',
     justifyContent: 'center',
   },
   camIcons: {
     top: 0,
     right: 10,
     width: 50,
     height: 50,
     alignSelf: 'flex-start',
     position: 'absolute',
     alignItems: 'center',
     justifyContent: 'center',
   },
   closeText: {
     color: 'white',
     fontSize: 16,
     borderWidth: 0,
   },
   send: {
     bottom: 14,
     left: Dimensions.get('window').width / 2 - (80/2),
     width: 80,
     height: 80,
     borderWidth: 2,
     borderColor: 'white',
     position: 'absolute',
     alignItems: 'center',
     justifyContent: 'center',
     alignSelf: 'center',
     backgroundColor: Constants.blue,
     borderRadius: 40,
   },
   editTool: {
     bottom: 30,
     right: 76,
     width: 40,
     height: 40,
     alignSelf: 'flex-start',
     position: 'absolute',
     alignItems: 'center',
     justifyContent: 'center',
   },
});
