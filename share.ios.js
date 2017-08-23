import React, { Component } from 'react'
import Modal from 'react-native-modalbox'
import ShareExtension from 'react-native-share-extension'

import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native'

module.exports = React.createClass({
  getInitialState() {
    return {
      isOpen: true,
      type: '',
      value: ''
    }
  },

  async componentDidMount() {
    try {
      const { type, value } = await ShareExtension.data()
      this.setState({ type, value });
    } catch(e) {
      console.log('errrr', e)
    }
  },

  onClose() {
    ShareExtension.close()
  },

  closing() {
    this.setState({
      isOpen: false
    })
  },

  render() {
    return (
      <Modal backdrop={false}
             style={{ backgroundColor: 'transparent' }} position="center" isOpen={this.state.isOpen} onClosed={this.onClose}>
          <View style={{ borderRadius: 8, alignItems: 'center', justifyContent:'center', flex: 1}}>
            <View style={{ backgroundColor: 'pink', borderColor: 'gray', borderWidth: 1, height: 200, width: 300 }}>
              <Text>type: { this.state.type }</Text>
              <Text>value: { this.state.value }</Text>
            </View>
          </View>
      </Modal>
    )
  },
});
