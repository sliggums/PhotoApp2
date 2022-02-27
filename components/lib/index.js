import React from 'react';
import PropTypes from 'prop-types';
import {
  Animated,
  Dimensions,
  View,
  StyleSheet,
  ViewPropTypes
} from 'react-native';

import { TopBar } from './bar';

import GridContainer from './GridContainer';
import FullScreenContainer from './FullScreenContainer';

export default class PhotoBrowser extends React.Component {

  static propTypes = {
    style: ViewPropTypes.style,

    mediaList: PropTypes.array.isRequired,

    /*
     * if thumbnails should have same height and width
     */
    square: PropTypes.bool,

    /*
     * offsets the width of the grid
     */
    gridOffset: PropTypes.number,

    /*
     * set the current visible photo before displaying
     */
    initialIndex: PropTypes.number,

    /*
     * Allows to control whether the bars and controls are always visible
     * or whether they fade away to show the photo full
     */
    alwaysShowControls: PropTypes.bool,

    /*
     * Show action button to allow sharing, copying, etc
     */
    displayActionButton: PropTypes.bool,

    /*
     * Whether to display left and right nav arrows on bottom toolbar
     */
    displayNavArrows: PropTypes.bool,

    /*
     * Whether to keeep status bar visible even when controls are hidden in full screen mode
     */
    alwaysDisplayStatusBar: PropTypes.bool,

    /*
     * Whether to allow the viewing of all the photo thumbnails on a grid
     */
    enableGrid: PropTypes.bool,

    /*
     * Whether to start on the grid of thumbnails instead of the first photo
     */
    startOnGrid: PropTypes.bool,

    /*
     * Whether selection buttons are shown on each image
     */
    displaySelectionButtons: PropTypes.bool,

    /*
     * Called when action button is pressed for a media
     * If you don't provide this props, ActionSheetIOS will be opened as default
     */
    onActionButton: PropTypes.func,

    /*
     * displays Progress.Circle instead of default Progress.Bar for full screen photos
     * iOS only
     */
    useCircleProgress: PropTypes.bool,

    /*
     * Called when done or back button is tapped.
     * Back button will not be displayed if this is null.
     */
    onBack: PropTypes.func,

    /*
     * Sets images amount in grid row, default - 3 (defined in GridContainer)
     */
    itemPerRow: PropTypes.number,
  
    /*
     * Display top bar
     */
    displayTopBar: PropTypes.bool,

    /*
     * Applied on Photo components' parent TouchableOpacity
     */
    onPhotoLongPress: PropTypes.func,
    delayPhotoLongPress: PropTypes.number,

    /**
     * Use a custom button in the bottom bar to the left of the Share button,
     * without having to recreate the entire bottom bar and pass it in with the
     * `bottomBarComponent` prop. The visibility of the Share button can still
     * be controlled with `displayActionButton`.
     */
    customBottomBarButton: PropTypes.element,
    toggleCameraBar: PropTypes.func, 
  };

  static defaultProps = {
    mediaList: [],
    initialIndex: 0,
    square: false,
    alwaysShowControls: false,
    displayActionButton: false,
    displayNavArrows: false,
    alwaysDisplayStatusBar: false,
    enableGrid: true,
    startOnGrid: false,
    displaySelectionButtons: false,
    useCircleProgress: false,
    displayTopBar: true,
    onPhotoLongPress: () => {},
    delayPhotoLongPress: 1000,
    gridOffset: 0,
  };

  constructor(props) {
    super(props);

    this._onGridPhotoTap = this._onGridPhotoTap.bind(this);
    this._onGridButtonTap = this._onGridButtonTap.bind(this);
    this._toggleTopBar = this._toggleTopBar.bind(this);

    const { startOnGrid, initialIndex } = props;

    this.state = {
      isFullScreen: !startOnGrid,
      fullScreenAnim: new Animated.Value(startOnGrid ? 0 : 1),
      currentIndex: initialIndex,
      displayTopBar: props.displayTopBar,
    };
  }

  _onGridPhotoTap(index) {
    this.refs.fullScreenContainer.openPage(index, false);
    this._toggleFullScreen(true);
    this.props.toggleCameraBar(false);
  }

  _onGridButtonTap() {
    this._toggleFullScreen(false);
    this.props.toggleCameraBar(true);
  }

  _toggleTopBar(displayed) {
    if (this.props.displayTopBar) {
      this.setState({
        displayTopBar: displayed,
      });
    }
  }

  _toggleFullScreen(display) {
    this.setState({
      isFullScreen: display,
    });
    Animated.timing(
      this.state.fullScreenAnim,
      {
        toValue: display ? 1 : 0,
        duration: 100,
        useNativeDriver: true,
      }
    ).start();
  }

  render() {
    const {
      mediaList,
      alwaysShowControls,
      displayNavArrows,
      alwaysDisplayStatusBar,
      displaySelectionButtons,
      displayActionButton,
      enableGrid,
      useCircleProgress,
      onActionButton,
      onBack,
      itemPerRow,
      style,
      square,
      gridOffset,
      customTitle
    } = this.props;
    const {
      isFullScreen,
      fullScreenAnim,
      currentIndex,
      title,
      displayTopBar,
    } = this.state;
    const screenHeight = Dimensions.get('window').height;

    let gridContainer;
    let fullScreenContainer;
    if (mediaList.length > 0) {
      if (!isFullScreen) {
        gridContainer = (
          <Animated.View
            style={{
              height: screenHeight,
              marginTop: 2
            }}
          >
            <GridContainer
              square={square}
              offset={gridOffset}
              mediaList={mediaList}
              displaySelectionButtons={displaySelectionButtons}
              onPhotoTap={this._onGridPhotoTap}
              itemPerRow={itemPerRow}
            />
          </Animated.View>
        );
      }

      fullScreenContainer = (
        <FullScreenContainer
          ref="fullScreenContainer"
          mediaList={mediaList}
          initialIndex={currentIndex}
          alwaysShowControls={alwaysShowControls}
          displayNavArrows={displayNavArrows}
          alwaysDisplayStatusBar={alwaysDisplayStatusBar}
          displaySelectionButtons={displaySelectionButtons}
          displayActionButton={displayActionButton}
          enableGrid={enableGrid}
          useCircleProgress={useCircleProgress}
          onActionButton={onActionButton}
          customTitle={customTitle}
          onGridButtonTap={this._onGridButtonTap}
          toggleTopBar={this._toggleTopBar}
          bottomBarComponent={this.props.bottomBarComponent}
          onPhotoLongPress={this.props.onPhotoLongPress}
          delayLongPress={this.props.delayPhotoLongPress}
          customBottomBarButton={this.props.customBottomBarButton}
        />
      );
    }

    return (
      <View style={[styles.container, {
        paddingTop: gridContainer ? 30 : 0,
      }, style]}>
        {gridContainer}
        {fullScreenContainer}
        {/* this is here for bigger z-index purpose */}
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});
