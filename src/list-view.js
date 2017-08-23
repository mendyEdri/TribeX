import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Navigator,
  ListView,
  Image,
  TouchableOpacity,
  Modal,
  TouchableHighlight,
  ActivityIndicator,
  ScrollView,
  Platform,
  ViewPagerAndroid,
  Dimensions,
  Animated,
  Easing,
  StatusBar,
  TimerMixin,
  Clipboard,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';

// import Share, {
//   ShareSheet,
//   Button
// } from 'react-native-share';

var MediaCell = require('./media-cell');
var AdCell = require('./ad-cell-view');
var Api = require('./feed-api.js');
var Video = require('react-native-video').default;
var ProgressBar = require('ProgressBarAndroid')
var Constants = require('./constants');
var UploadCVApi = require('./upload-cv-api');
var UserProfile = require('./user-profile-view');
var CompanyProfile = require('./company-profile-view');
var VideoView = require('./video-view');
var Interval = null;
var someIndex = -1;
import Camera from 'react-native-camera';

var rows = [];
var relatedStoriesCells = [];

module.exports = React.createClass({
  mixins: [TimerMixin],
   getFeed() {
     Api(Constants.uniqueId)
     .then((data) => {
      console.log('data? ' + JSON.stringify(data));
       this.setState({
         dataSource: this.state.dataSource.cloneWithRows(this.companyListWithIndexes(data.result.entityWrapper.storyList, data.result.entityWrapper.companyList, data.result.indexes)),
         storiesList: data.result.entityWrapper.storyList,
         companyList: this.companyListWithIndexes(data.result.entityWrapper.storyList, this.companyListWithIndexes(data.result.entityWrapper.storyList, data.result.entityWrapper.companyList, data.result.indexes), data.result.indexes),
         titles: this.getTitles(data.result.entityWrapper.storyList, this.companyListWithIndexes(data.result.entityWrapper.storyList, data.result.entityWrapper.companyList, data.result.indexes)),
         durations: this.getDurations(data.result.entityWrapper.storyList, this.companyListWithIndexes(data.result.entityWrapper.storyList, data.result.entityWrapper.companyList, data.result.indexes)),
         authors: this.getAuthors(data.result.entityWrapper.storyList, this.companyListWithIndexes(data.result.entityWrapper.storyList, data.result.entityWrapper.companyList, data.result.indexes)),
         users: this.getUsers(data.result.entityWrapper.storyList, this.companyListWithIndexes(data.result.entityWrapper.storyList, data.result.entityWrapper.companyList, data.result.indexes)),
         currentUser: '',
         currentIndex: 0,
         currentTitle: '',
         currentTime: 0,
         bounceValue: new Animated.Value(0),
         autoplayIndex: 0,
         companyIndexSelected: 0,
         currentAuthor: '',
         shouldSeek: false,
         seekTime: 0,
         isRefreshing: false,
       }, () => {

       })
    });
   },

   companyListWithIndexes(storiesList, companyList, indexes) {
     var companies = [];
     for (var i = 0; i < indexes.length; i++) {
       for (var x = 0; x < storiesList.length; x++) {
         if (indexes[i].row[0] == storiesList[x].storyId) {
            for (var y = 0; y < companyList.length; y++) {
              if (companyList[y].companyId == storiesList[x].company.companyId) {
                  companies.splice(i, 0, companyList[y]);
                  break;
              }
            }
            break;
         }
       }
     }
     return companies;
   },

  componentWillUnmount() {
   clearInterval(Interval);
  },
  componentDidMount() {
    this.getFeed();
  },
  componentWillMount() {
    this.methodClose();
  },
  getInitialState() {
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    return {
      dataSource: ds.cloneWithRows([]),
      animationType: 'fade',
      modalVisible: false,
      videoLink: '',
      imageLink: '',
      animate: true,
      storiesList: [],
      titles: [],
      dirations: [],
      currentTitle: '',
      visibleRows: null,
      stopVideo: false,
    };
  },

  methodClose() {
    this.setState({modalVisible: false});
  },
  render() {
    return (
      <View style={[styles.container]}>
      <StatusBar barStyle="light-content" />
      {this.getListView()}
      {this.videoModal()}
      </View>
    );
  },

  getBarView() {
    return (
      <TouchableOpacity
      onPress={() => {
        this.getFeed();
      }}
      activeOpacity={0.6}
      style={styles.barView}>
        <Text style={styles.barTitle}>Trending</Text>
      </TouchableOpacity>
    );
  },

  hideStatusBar(hide) {
    if (Platform.OS === 'ios') {
      StatusBar.setHidden(hide, true);
    } else {
       StatusBar.setHidden(true, true);
    }
  },

  videoModal() {
    if (!this.state.modalVisible) {
      this.hideStatusBar(false);
      clearInterval(Interval);
      return null;
    }
    this.hideStatusBar(true);
    return (
      <View>
        <ScrollView
          ref={(scrollView) => {
            _scrollView = scrollView;
          }}
          style={styles.scrollView}
          pagingEnabled={true}
          scrollEnabled={false}
          scrollEventThrottle={200}
          automaticallyAdjustContentInsets={false}
          >

          {this.getUserProfileView()}
          {this.getVideoComponent()}
          {this.getCompanyProfileView()}
        </ScrollView>
      </View>
    );
  },

  /*
  {this.getUserProfileView()}
  {this.getVideoComponent()}
  {this.getCompanyProfileView()}
  */

  getUserProfileView() {
    return <UserProfile
      ref={'userProfile'}
      user={this.state.currentUser}
      scrollView={this._scrollView}
      scrollToVideo={() => {
        this.scrollToVideo();
        this.setState({stopVideo: false});
    }}/>;
  },

  getCompanyProfileView() {
    return <CompanyProfile
            ref={'companyProfile'}
            company={this.state.companyList[this.state.companyIndexSelected]}
             scrollToVideo={() => {
               this.setState({stopVideo: false,});
               this.scrollToVideo();
    }}/>
  },

  scrollToVideo() {
    _scrollView.scrollTo({y: Constants.height});
  },

  scrollToUserProfile() {
    _scrollView.scrollTo({y: 0});
    this.refs.userProfile.appear();
  },

  scrollToCompanyProfile() {
    _scrollView.scrollTo({y: Constants.height * 2});
    this.refs.companyProfile.appear();
  },

  topForPositionView() {
    return this.state.positionBounce;
  },

  getShareButton() {
    let shareImageBase64 = {
      title: 'TribeX',
      url: this.state.videoLink.replace('.m3u8', '.mp4'),
      subject: "TribeX" //  for email
    };

    return <TouchableOpacity style={{
      position: 'absolute',
      top: 0,
      right: 0,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    }} onPress={() => {
       Share.open(shareImageBase64);
    }}>
    <Image
      style={{width: 24, height: 24}}
      source={require('../img/share.png')}>
    </Image>
    </TouchableOpacity>;
  },

  getVideoComponent() {
    return (<VideoView
            showControllers={true}
            muted={false}
            resizeMode={'stretch'}
            tapEnabled={true}
            style={{height: Constants.height, width: Constants.width, backgroundColor: 'rgba(0,0,0,0)'}}
            videoLink={this.state.videoLink}
            videosDuration={this.getDurationsForCompanyId(this.state.storiesList, this.state.companyList[this.state.companyIndexSelected].companyId)}
            titles={this.state.titles[this.state.companyIndexSelected]}
            authors={this.state.authors[this.state.companyIndexSelected]}
            users={this.state.users[this.state.companyIndexSelected]}
            stopVideo={this.state.stopVideo}
            companyId={this.state.companyList[this.state.companyIndexSelected].companyId}
            thumbnail={this.state.imageLink}
            onScrollToCompanyProfile={() => {
              this.scrollToCompanyProfile();
              this.setState({stopVideo: true});
            }}
            onScrollToUserProfile={(currentUser) => {
              this.setState({currentUser: currentUser});
              this.scrollToUserProfile();
              this.setState({stopVideo: true});
            }}
            onEnd={() =>{
              this.setState({modalVisible: false, currentTitle: '', currentIndex: 0, currentAuthor: '', bounceValue: new Animated.Value(0),});
              this.props.onPlaying(false);
              this.props.lock(false);
          }}/>);
  },

  percentageForTime(time) {
    //console.log('Current Time: ' + time);
    return time / this.getDurationsForCompanyId(this.state.storiesList, this.state.companyList[this.state.companyIndexSelected].companyId)[this.state.currentIndex] * 100;
  },

  pointForPercentage(percant) {
    return (percant / 100.0) * Dimensions.get('window').width;
  },

  getTimer() {
    return (
      <View style={styles.timer}></View>
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


  getListView() {
    console.disableYellowBox = true;
    return this.renderIOS();
    // if (Platform.OS === 'ios') {
    //   return this.renderIOS();
    // } else {
    //   return this.renderAndroid();
    // }
  },

  renderIOS() {
    return (
      <ListView
      refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              onRefresh={() => {

              }}
              backgroundColor="rgba(0,0,0,0)"
              tintColor="black"
              title="Catching Up.."
              titleColor="black"
              colors={['black']}
              progressBackgroundColor="black"
            />
          }
       ref={(ref) => {
        if (ref) {
          this.listView = ref;
        }
       }}
       style={[{marginTop: 0}]}
       dataSource={this.state.dataSource}
       renderRow={this.renderRow}
       onChangeVisibleRows={this.rowsChanged}
       enableEmptySections={true}
       renderHeader={this.getBarView}
       removeClippedSubviews={true}
      >
      </ListView>
    );
  },

  handleHorizontalScroll() {
    console.log('handleHorizontalScroll');
  },

  rowsChanged(visibleRows, changeRows) {
  //console.log('visibleRows: ' + JSON.stringify(visibleRows));
  //console.log('changeRows: '  + JSON.stringify(changeRows));
   for (var i = 0; i < this.state.dataSource.cloneWithRows.length; i++) {
      if (changeRows.s1[i] == true) {
        //this.setState({autoplayIndex: i});
      }
    }
    // this.setState({visibleRows: visibleRows.s1}) ;
  },

  renderRow: function(rowData, sectionID, rowID) {
    var cell = null;
    cell = <MediaCell
      length={this.state.dataSource.cloneWithRows.length}
      cellKey={rowID}
      visible={this.state.visibleRows}
      onSelect={(row) => {
        this.props.onPlaying(true);
        this.props.lock(true);
        this.setState({
          imageLink: this.thumbnailFromUrl(this.getFirstStoryVideoLink(rowData.companyId)),
          videoLink: this.videoLinksForCompanyId(rowData.companyId),
          modalVisible: true,
          companyIndexSelected: rowID,
          currentTitle: this.state.titles[rowID][0],
          currentAuthor: this.state.authors[rowID][0],
          currentUser: this.state.users[rowID][0],
        }, () => {
          this.scrollToVideo();
        });
      }}
      authors={this.state.authors[rowID]}
      cellText={rowData.companyName}
      companyLogo={rowData.companyLogo}
      imageUrl={this.thumbnailFromUrl(this.getFirstStoryVideoLink(rowData.companyId))}
      onImageLoads={(image) => {

      }}
      tag={this.state.titles[rowID][0]}
      companyName={rowData.companyName}
      bounceValue={this.state.bounceValue}
      timeInterval={this.getFirstStoryTimeInterval(rowData.companyId)}
      videoLink={this.videoLinksForCompanyId(rowData.companyId)}
      autoplay={true}
      titles={this.state.titles[rowID]}
      durations={this.state.durations[rowID]}
    />;
    rows.splice(rowID, 0, cell);
    return (
        rows[rowID]
    );
  },

  renderSeperator: function(sectionID: number, rowID: number, adjacentRowHighlighted: bool) {
   return (
     <View
       key={`${sectionID}-${rowID}`}
       style={{
         height: 1,
         backgroundColor: 'gray',
         marginLeft: 4,
       }}
     />
   );
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

 seekNext() {
   var n = this.timeTillTimeAtIndex(this.state.currentIndex);
   console.log('seeking to: ' + n);
   this.video.seek(n);
 },

 timeTillTimeAtIndex(index) {
   var time = 0;
   var stories = this.state.storiesList;
   for (var i = 0; i < stories.length; i++) {
     if (index == stories.length) {
       time = this.fullTime;
       this.setState({modalVisible: false, currentTitle: '', currentIndex: 0, currentAuthor: ''});
       break;
     }
     if (i > index) {
       break;
     }
     var storiesList = this.state.storiesList;
     var companyId = this.state.companyList[this.state.companyIndexSelected].companyId;
     time += this.getDurationsForCompanyId(storiesList, companyId)[i];
   }
   // ## Math.ceil(time) + 0.05
   console.log('math: ' + Math.ceil(time));
   console.log('regular: ' + time);
   return Math.ceil(time);
 },

 calculateFullVideoTime(durations) {
   var time = 0.0;
   for (var i = 0; i < durations.length; i++) {
      time += durations[i];
   }
   //console.log('time: ' + time);
   return time;
 },

 videoLinksForCompanyId(companyId) {
   var videoList = [];
   var storiesList = [];
    for (var story in this.state.storiesList) {
      if (this.state.storiesList[story].company.companyId == companyId) {
        if (this.state.storiesList[story].videoLink.includes('http')) {
            videoList.push(this.state.storiesList[story].videoLink);
            storiesList.push(this.state.storiesList[story].title)
        }
      }
    }
    return this.buildConcateVideo(videoList, storiesList);
 },

 getFirstStoryVideoLink(companyId) {
   var videoLink = null;
    for (var story in this.state.storiesList) {
      if (this.state.storiesList[story].company.companyId == companyId) {
        if (this.state.storiesList[story].videoLink.includes('http')) {
            videoLink = this.state.storiesList[story].videoLink;
            break;
        }
      }
    }
    return videoLink;
 },

 getFirstStoryTimeInterval(companyId) {
   var timeInterval = null;
    for (var story in this.state.storiesList) {
      if (this.state.storiesList[story].company.companyId == companyId) {
        if (this.state.storiesList[story].videoLink.includes('http')) {
            timeInterval = this.state.storiesList[story].lastUpdateTime;
            break;
        }
      }
    }
    return timeInterval;
 },

 buildConcateVideo(videos, stories) {
   var base = 'http://res.cloudinary.com/talenttribe/video/upload/w_1200,h_800,c_fit/';
   var construct = ',fl_splice,w_1200,h_800,c_fit/';
   var element = videos[0];
   videos.splice(0, 1);
   videos.push(element);

   for (var index in videos) {
     videos[index] = videos[index].replace('.mov', '');
     videos[index] = videos[index].replace('.mp4', '');
     if (videos.length == 1) {
       videos[index] = videos[index].replace('devtalenttribe', 'talenttribe');
       var video = videos[index];
       if (!videos[index].includes('.mp4')) {
          video = videos[index] + '.mp4';
       }
       return video;
     }
     if (index == videos.length - 1) {
        base = base.concat(this.videoIdFromUrl(videos[index]) + '.m3u8');
     } else {
        //base = base.concat('l_text:Arial_80:TITLE_1/');
        base = base.concat('l_video:' + this.videoIdFromUrl(videos[index]) +  construct);
     }
   }
   //console.log('final ' + base);
   return base;
 },

 videoIdFromUrl(url) {
   var res = url.split('/');
   return res[res.length-1].replace('.m3u8', '');
 },

 getTitles(stories, companies) {
   //console.log('compan:' + JSON.stringify(comapniesList));
   var rows = [];
   for (var companyIndex in companies) {
     var titles = [];
     for (var index in stories) {
       if (stories[index].videoDuration && stories[index].company.companyId == companies[companyIndex].companyId) {
          titles.push(stories[index].title);
       }
     }
     rows.push(titles);
   }
   return rows;
 },

 getAuthors(stories, companies) {
   var rows = [];
   for (var companyIndex in companies) {
     var authors = [];
     for (var index in stories) {
       if (stories[index].videoDuration && stories[index].company.companyId == companies[companyIndex].companyId) {
          if (stories[index].author && stories[index].author.workEmail) {
              authors.push(stories[index].author.workEmail.split('@')[0]);
          } else {
            authors.push('');
          }
       }
     }
     rows.push(authors);
   }
   return rows;
 },

 getUsers(stories, companies) {
   var rows = [];
   for (var companyIndex in companies) {
     var authors = [];
     for (var index in stories) {
       if (stories[index].videoDuration && stories[index].company.companyId == companies[companyIndex].companyId) {
          if (stories[index].author && stories[index].author.userId) {
              authors.push(stories[index].author);
          } else {
            authors.push('');
          }
       }
     }
     rows.push(authors);
   }
   return rows;
 },

 getDurations(stories, companies) {
   var rows = [];
   //var lenght = 0.0000;
   for (var companyIndex in companies) {
     var durations = [];
     for (var index in stories) {
       if (stories[index].videoDuration && stories[index].company.companyId == companies[companyIndex].companyId) {
          durations.push(parseFloat(stories[index].videoDuration));
       }
     }
     rows.push(durations);
   }
   return rows;
 },

 getDurationsForCompanyId(stories, companyId) {
   var durations = [];
   for (var index in stories) {
     if (stories[index].videoDuration && stories[index].company.companyId == companyId) {
        durations.push(parseFloat(stories[index].videoDuration));
     }
   }
   return durations;
 },

 border(color) {
    return {
      borderColor: color,
      borderWidth: 4
    }
  },
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  modal:{
    position: 'absolute',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    top: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  centering: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  pageStyle: {
    alignItems: 'center',
    padding: 20,
  },
  backgroundVideo: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: 'rgba(0,0,0,0)',
  },
  timer: {

  },
  barView: {
    height: 74,
    backgroundColor: Constants.yellow,//'rgba(52, 152, 219, 0.0)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barTitle: {
    color: 'white',
    fontWeight: '800',
    fontSize: 40,
    top: 10,
  },
  line: {
    backgroundColor: 'white',//'#cfd9db',
    height: 1,
    width: Dimensions.get('window').width - 16,
    top: 10,
    left: 14,
    right: 2,
  },
  scrollView: {
    height: Constants.height,
  },
});
