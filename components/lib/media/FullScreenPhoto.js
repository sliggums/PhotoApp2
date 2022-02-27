import React, { Component, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dimensions,
  Image,
  StyleSheet,
  Animated,
  View,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State,
  useAnimatedGestureHandler,
  PanGestureHandlerGestureEvent,
  Swipeable
} from 'react-native-gesture-handler'
import Photo from './Photo';

export default class FullScreenPhoto extends Photo {
  constructor(props) {
    super(props);
    this.lastY = 0;
    this.lastX = 0;
      
    this.translateYEvent = Animated.event([{
      nativeEvent: { 
        translationY: this.translateY,
        translationX: this.translateX,
      }
    }], { 
      useNativeDriver: true,
      listener: (event) => {

      }
    });
  }
  
  onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      console.log(event.nativeEvent);
      this.lastY += event.nativeEvent.translationY;
      this.lastX += event.nativeEvent.translationX;
      this.translateX.setOffset(this.lastX);
      this.translateX.setValue(0);
      this.translateY.setOffset(this.lastY);
      this.translateY.setValue(0);
    }
  };
  


  render() {
    const { resizeMode, width, height } = this.props;
    const screen = Dimensions.get('window');
    const { uri, error } = this.state;

    let source;
    if (uri) {
      // create source objects for http/asset strings
      // or directly pass uri number for local files
      source = typeof uri === 'string' ? { uri } : uri;
    }

    // i had to get window size and set photo size here
    // to be able to respond device orientation changes in full screen mode
    // FIX_ME: when you have a better option
    const sizeStyle = {
      width: width || screen.width,
      height: height || screen.height,
    }

    const transform = {
      transform: [{ translateY: this.translateY}, { translateX: this.translateX }]
    };

    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PanGestureHandler
          onGestureEvent={this.translateYEvent}
          onHandlerStateChange={this.onHandlerStateChange}
        >
          <Animated.View style={[styles.container, sizeStyle]}>
            {error ? this._renderErrorIcon() : this._renderProgressIndicator()}
            <Animated.Image
              {...this.props}
              style={[styles.image, sizeStyle, transform]}
              source={source}
              onProgress={this._onProgress}
              onError={this._onError}
              onLoad={this._onLoad}
              resizeMode={resizeMode}
            />
            {this._renderSelectionButton()}
          </Animated.View>
        </PanGestureHandler>
      </GestureHandlerRootView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  thumbnailSelectionIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  fullScreenSelectionIcon: {
    position: 'absolute',
    top: 60,
    right: 16,
  },
});