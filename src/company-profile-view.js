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
var PositionsApi = require('./positions-api');
var RelatedStoriesApi = require('./related-stories-api');
import PopupDialog, { SlideAnimation, ScaleAnimation } from 'react-native-popup-dialog';

module.exports = React.createClass({
  getInitialState() {
    var relatedStories = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    var positions = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    return {
      relatedStories: relatedStories.cloneWithRows([]),
      positionBounce: new Animated.Value(Constants.height),
      openPositionsDataSource: positions.cloneWithRows([]),
      companyId: this.props.company.companyId,
      companyLogo: this.props.company.companyLogo,
      companyName: this.props.company.companyName,
      founded: this.props.company.about.founded,
      hq: this.props.company.about.location.address,
      employees: this.props.company.about.employees,
      selectedCompanyVideo: '',
    };
  },

  appear() {
    console.log('appear!!');
    this.profileApis();
  },

  render() {
    return (
      <View style={{flex: 1, backgroundColor: 'white', height: Constants.height,}}>
        <TouchableOpacity onPress={() => {
          this.props.scrollToVideo();
        }}
        style={{height: 40, width: 40, marginTop: 0, left: Constants.width / 2 - (40/2),
         justifyContent: 'center',
         alignItems: 'center',
       }}
        >
        <View style={{backgroundColor: Constants.yellow, width: Constants.width, height: 2, top: -8,}} />
        <Image
          resizeMode={'contain'}
          style={{width: 22, height: 22}}
          source={require('../img/next_arrow_up.png')}>
        </Image>
        </TouchableOpacity>
        <ListView
          ref={(ref) => {
           if (ref) {
             this.listView = ref;
           }
          }}
          style={[{marginTop: 0}]}
          dataSource={this.state.openPositionsDataSource}
          renderRow={this.renderPositionRow}
          enableEmptySections={true}
          renderHeader={this.companyHeader}
          renderFooter={(v) => {
            return <View>
            <Text style={{color: 'gray', marginTop: 60, marginBottom: 10, marginLeft: 8}}>{'More about ' + this.state.companyName}</Text>
                <ListView
                  style={{marginTop: 0}}
                  horizontal={true}
                  dataSource={this.state.relatedStories}
                  renderRow={this.moreStories}
                  enableEmptySections={true}
                  showsHorizontalScrollIndicator={false}
            />
            <View style={{marginBottom: 40}}/>
            </View>;
          }}
          removeClippedSubviews={true}
          scrollEventThrottle={200}
          onScroll={(event: Object) => {
              if (event.nativeEvent.contentOffset.y < -120) {
                this.props.scrollToVideo();
                this.setState({openPositionsDataSource: this.state.openPositionsDataSource.cloneWithRows([]), relatedStories: this.state.relatedStories.cloneWithRows([])});
              }
          }}
        >
        </ListView>
        {this.getPositionView()}
        {this.getPopup()}
        {this.getCompanyVideoView()}
      </View>
    );
  },

  renderPositionRow(rowData, sectionID, rowID) {
    return <TouchableOpacity onPress={() => {
      this.setState({selectedPosition: rowID});
      this.openPositionView();
    }} style={{ top: 0, flexDirection: 'row', height: 84, alignItems: 'center', justifyContent: 'flex-start' }}>
      <Image
        resizeMode={'stretch'}
        style={{width: 16, height: 24, marginRight: 14, marginLeft: 20, }}
        source={require('../img/next_arrow_yellow.png')}>
      </Image>
      <Text style={{ fontWeight: '200', fontSize: 22, textAlign: 'center',}}>{rowData.title}</Text>
      <View style={{backgroundColor: Constants.yellow, width: Constants.width - 28, height: 1, position: 'absolute', bottom: 0, right: 14,}} />
    </TouchableOpacity>;
  },

  companyHeader() {
    return (
      <View>
        <View style={{marginTop: 0, backgroundColor: 'white', height: 140, alignItems: 'center', justifyContent: 'center'}}>
          <Image
            style={{height: 68, width: 68,}}
            source={{uri: this.state.companyLogo}}>
          </Image>
          <Text style={{marginTop: 8, fontSize: 28, fontWeight: 'bold'}}>{this.state.companyName}</Text>
        </View>
        {this.hardFactsRows()}
        <View style={{marginTop: 26}}>
          {this.getWeHireLabel()}
        </View>
      </View>
    );
  },

  hardFactsRows() {
    return (
      <View style={{backgroundColor: 'white'}}>
        <View style={styles.hardFactView}>
          <Text style={styles.hardFactTitle}>{'YEAR FOUNDED'}</Text>
          <Text style={styles.hardFactDescription}>{this.state.founded}</Text>
        </View>
        <View style={styles.hardFactView}>
          <Text style={styles.hardFactTitle}>{'# EMPLOYEES'}</Text>
          <Text style={styles.hardFactDescription}>{this.state.employees}</Text>
        </View>
        <View style={styles.hardFactView}>
          <Text style={styles.hardFactTitle}>{'HQ'}</Text>
          <Text style={styles.hardFactDescription}>{this.state.hq}</Text>
        </View>
      </View>
    );
  },

  getWeHireLabel() {
    return (
      <Text style={{fontWeight: 'bold', fontSize: 28, alignSelf: 'center'}}>{this.state.hire}</Text>
    );
  },

  getPositionView() {
    return (
      <Animated.View
        style={[styles.positionView, {top: this.topForPositionView()}]}>
        <TouchableOpacity style={{top: 2, alignItems: 'center', justifyContent: 'center', width: 44, height: 44, alignSelf: 'center',}} onPress={() => {
          this.closePositionView();
        }}>
            <Image
              style={{width: 22, height: 22, alignSelf: 'center',}}
              source={require('../img/X_black.png')}>
            </Image>
          </TouchableOpacity>
          <Text style={{marginTop: 2, marginBottom: 0, alignSelf: 'center', color: 'black', fontWeight: '200', fontSize: 28,}}>{this.titleForPositionAtRow(this.state.selectedPosition)}</Text>
          <View style={{marginTop: 12, alignSelf: 'center', width: Constants.width * 0.6, height: 1.0, backgroundColor: 'rgba(0,0,0,0.1)',}}/>
          <ScrollView ref={(ref) => this.positionScroll = ref}style={{marginBottom: 40, top: 0}}>
            <View style={{marginBottom: 20}}/>
            <Text style={{marginLeft: 14, marginRight: 8, alignSelf: 'center', color: 'black', fontWeight: 'normal', fontSize: 16,}}>{this.descriptionForPositionAtRow(this.state.selectedPosition)}</Text>
            <TouchableOpacity onPress={() => {
              this.setState({popupOpen: true});
              this.popupDialog.openDialog();
            }} style={{marginTop: 16, alignSelf: 'center', borderRadius: 4, height: Constants.width * 0.13, width: Constants.width * 0.4, backgroundColor: Constants.blue, alignItems: 'center', justifyContent: 'center'}}>
                <Text style={{textAlign: 'center', paddingLeft: 20, paddingRight: 20, color: 'white', fontWeight: 'bold', fontSize: 20,}}>Apply Now</Text>
            </TouchableOpacity>
            <View style={{marginBottom: 40}}/>
          </ScrollView>
      </Animated.View>
    );
  },

  getPopup() {
    return (
      <PopupDialog
        style={[styles.popup]}
        color={Constants.blue}
        open={this.state.popupOpen}
        dialogAnimation = { new SlideAnimation({ slideFrom: 'bottom' }) }
        ref={(popupDialog) => { this.popupDialog = popupDialog; }}>
          <View style={{justifyContent: 'flex-end', borderColor: 'white', borderWidth: 0, backgroundColor: Constants.blue, marginTop: -1, borderRadius: 8, flex: 1,}}>
            <Text style={{color: 'white', fontWeight: 'bold', fontSize: 30, marginBottom: 20, marginLeft: 14, marginRight: 8, textAlign: 'center', alignSelf: 'center'}}>{'Ready to be a part of ' + this.state.companyName + '?' }</Text>
            <Text style={{color: 'white', marginTop: 8, marginLeft: 14, marginRight: 8, marginBottom: 8, textAlign: 'center', alignSelf: 'center'}}>Will send you instruction to upload your CV</Text>
            <TextInput
              style={{marginBottom: 40, alignSelf: 'center', borderRadius: 4, backgroundColor: 'white', height: 40, width: Constants.width * 0.8, borderColor: 'rgba(0,0,0,0.3)',}}
              onChangeText={(text) => this.setState({emailText: text})}
              keyboardType={'email-address'}
              value={this.state.emailText}
              placeholder={'     Personal Email'}
              placeholderTextColor={'gray'}
              />
              <TouchableOpacity onPress={() => {
                UploadCVApi(Constants.uniqueId, this.state.emailText, this.positionIdForPositionAtRow(this.state.selectedPosition))
                .then((data) => {
                  console.log('UploadCVApi data: ' + JSON.stringify(data));
                  this.setState({popupOpen: false});
                });
              }} style={{marginBottom: 20, height: Constants.width * 0.4 / (4), alignSelf: 'center', borderRadius: 4, width: Constants.width * 0.4, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center'}}>
                  <Text style={{textAlign: 'center', paddingLeft: 20, paddingRight: 20, color: Constants.blue, fontWeight: 'bold', fontSize: 20,}}>Send</Text>
              </TouchableOpacity>
          </View>
      </PopupDialog>
    );
  },

  openPositionView() {
    this.state.positionBounce.setValue(Constants.height);
    Animated.spring(
       this.state.positionBounce,
       {
         toValue: 42,
         friction: 10,
       }
     ).start();
  },

  closePositionView() {
    this.state.positionBounce.setValue(42);
     Animated.spring(
       this.state.positionBounce,
       {
         toValue: Constants.height,
         friction: 10,
       }
     ).start();
     this.positionScroll.scrollTo({x:0, y: 0, animated: true});
  },

  moreStories(rowData, sectionID, rowID) {
    return (
      <TouchableOpacity opacity={0.8} onPress={() => {
            this.setState({selectedCompanyVideo: rowData.videoLink, selectedCompanyThumbnail: rowData.videoThumbnail ? rowData.videoThumbnail : this.thumbnailFromUrl(rowData.videoLink)});
          }} style={{alignItems: 'center', justifyContent: 'center', height: 150, width: 120, borderRadius: 4, marginLeft: 8, marginRight: 8}}>
            <Image
              style={{height: 150, width: 120, borderRadius: 4, marginLeft: 8, marginRight: 8}}
              source={{uri: this.videoThumbnail(rowData)}}>
            </Image>
          </TouchableOpacity>
    );
  },

  topForPositionView() {
    return this.state.positionBounce;
  },

  videoThumbnail(rowData) {
    if (rowData.videoThumbnail) {
      return rowData.videoThumbnail;
    } else if (rowData.videoLink) {
        if (rowData.videoLink.includes('.mov')) {
          return rowData.videoLink.replace('.mov', '.png');
        } else if (rowData.videoLink.includes('.mp4')) {
          return rowData.videoLink.replace('.mp4', '.png');
        }
    }
    return '';
  },

  titleForPositionAtRow(rowID) {
    if (this.state.openPositionsDataSource.getRowCount() > 0 && this.state.openPositionsDataSource.getRowCount() >= rowID) {
      if (!this.state.openPositionsDataSource.getRowData(0,rowID)) {
        return '';
      }
      return this.state.openPositionsDataSource.getRowData(0,rowID).title;
    }
    return '';
  },

  descriptionForPositionAtRow(rowID) {
    if (this.state.openPositionsDataSource.getRowCount() > 0 && this.state.openPositionsDataSource.getRowCount() >= rowID) {
      if (!this.state.openPositionsDataSource.getRowData(0,rowID)) {
        return '';
      }
      return this.state.openPositionsDataSource.getRowData(0,rowID).description;
    }
    return '';
  },

  positionIdForPositionAtRow(rowID) {
    if (this.state.openPositionsDataSource.getRowCount() > 0 && this.state.openPositionsDataSource.getRowCount() >= rowID) {
      if (!this.state.openPositionsDataSource.getRowData(0,rowID)) {
        return '';
      }
      return this.state.openPositionsDataSource.getRowData(0,rowID).positionId;
    }
    return '';
  },

  getCompanyVideoView() {
    if (this.state.selectedCompanyVideo.length == 0) {
      return null;
    }
      return (
        <View style={{backgroundColor: 'black', height: Constants.height, positions: 'absolute', bottom:0, top: -44, right: 0, left: 0,}}>
          <Image resizeMode='contain' source={{uri: this.state.selectedCompanyThumbnail}}>
            <Video source={{uri: this.state.selectedCompanyVideo}}
               ref={(video) => {
                 this.companyVideo = video;
               }}
               onLoadStart={() => {

               }}
               onLoad={() => {
                 //console.log('loading: ' + this.state.videoLink);
               }}
               onProgress={(object) => {

               }}
               onEnd={() => {

               }}
               rate={1.0}
               volume={1.0}
               muted={false}
               paused={false}
               resizeMode="fill" //cover //stretch // fill //
               style={{height: Constants.height, width: Constants.width}}
               repeat={false}
              />
            </Image>
            <TouchableOpacity style={{position: 'absolute', top: 10, left: 10, width: 44, height: 44}}
              onPress={() => {
                this.setState({selectedCompanyVideo: '', selectedCompanyThumbnail: ''});
              }}>
              <Image
                style={{width: 30, height: 30,}}
                source={require('../img/X.png')}>
              </Image>
            </TouchableOpacity>
        </View>
      );
  },

  getPositions(result) {
    var positions = [];
    for (var i = 0; i < result.length; i++) {
      positions.push(result[i]);
    }
    return positions;
  },

  thumbnailFromUrl(url) {
    url = url.substr(0, url.indexOf('upload') + 7) + 'so_0.0/' + url.substr(url.indexOf('upload') + 7);
    if (url.includes('mp4')) {
       url = url.replace('mp4', 'jpg');
    } else if  (url.includes('mov', 'jpg')) {
       url = url.replace('mov', 'jpg');
    } else if (url.includes('m3u8')) {
       url = url.replace('m3u8', 'jpg');
    }

    url = url.replace('devtalenttribe', 'talenttribe');
    return url;
  },

  async profileApis() {
    console.log('company id: $$$$$$' + this.state.companyId);
   PositionsApi(this.state.companyId)
        .then((data) => {
          if (data.result && data.result.length > 0) {
            this.setState({hire: 'We\'re Hiring!', openPositionsDataSource: this.state.openPositionsDataSource.cloneWithRows(this.getPositions(data.result))});
          } else {
            console.log('open positions: ' + '!0!');
            this.setState({hire: ''});
          }
      });

  RelatedStoriesApi(this.state.companyId)
    .then((data) => {
      console.log('data of related storis: ' + data);
          var array = [];
          relatedStoriesCells = [];
          for (var i = 0; i < data.response.length; i++) {
            if (data.response[i].videoLink) {
                array.push(data.response[i]);
            }
          }
          this.setState({relatedStories: this.state.relatedStories.cloneWithRows(array)});
      });
  },

});

var styles = StyleSheet.create({
  hardFactView: {
    marginBottom: 8,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: Constants.yellow,
    alignSelf: 'center',
    width: Constants.width * 0.96,
  },
  hardFactTitle: {
    marginBottom: 6,
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 20
  },
  hardFactDescription: {
    textAlign: 'center',
    textAlign: 'center',
    fontWeight: '400',
    fontSize: 16
  },
  positionView: {
    backgroundColor: 'floralwhite',
    borderRadius: 20,
    height: Constants.height,
    width: Constants.width * 0.96,
    position: 'absolute',
    left: Constants.width * 0.02,
    borderWidth: 0.2,
    borderColor: 'gray',
  },
  popup: {
    position: 'absolute',
  },
});
