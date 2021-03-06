import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  CameraRoll,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  imageGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  image: {
    width: 100,
    height: 100,
    margin: 10,
  },
});

module.exports = React.createClass({
  getInitialState() {
    return {
      images: [],
    };
  },

  componentDidMount() {
    const fetchParams = {
      first: 25,
    };
    CameraRoll.getPhotos(fetchParams, this.storeImages, this.logImageError);
  },

  storeImages(data) {
    const assets = data.edges;
    const images = assets.map((asset) => asset.node.image);
    this.setState({
      images: images,
    });
  },

  logImageError(err) {
    console.log(err);
  },

  render() {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.imageGrid}>
          { this.state.images.map((image) => <Image style={styles.image} source={{ uri: image.uri }} />) }
        </View>
      </ScrollView>
    );
  }
});
