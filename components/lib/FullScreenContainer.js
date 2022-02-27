import React from 'react';
import PropTypes from 'prop-types';
import {
  DeviceEventEmitter,
  Dimensions,
  Animated,
  View,
  StyleSheet,
  StatusBar,
  ViewPropTypes
} from 'react-native';
import {
  Swipeable
} from 'react-native-gesture-handler'
import {
  useAnimatedScrollHandler,
  FlatList,
  useAnimatedGestureHandler,
  useAnimatedRef,
  useSharedValue,
} from 'react-native-reanimated'

import { BottomBar } from './bar';
import { FullScreenPhoto } from './media';

export default class FullScreenContainer extends React.Component {

  static propTypes = {
    style: ViewPropTypes.style,
    mediaList: PropTypes.array.isRequired,
    /*
     * opens grid view
     */
    onGridButtonTap: PropTypes.func,

    /*
     * Display top bar
     */
    toggleTopBarVisible: PropTypes.bool,

    /*
     * displays/hides top bar
     */
    toggleTopBar: PropTypes.func,

    /*
     * refresh the list to apply selection change
     */
    onMediaSelection: PropTypes.func,

    /*
     * those props are inherited from main PhotoBrowser component
     * i.e. index.js
     */
    initialIndex: PropTypes.number,
    alwaysShowControls: PropTypes.bool,
    displayActionButton: PropTypes.bool,
    displayNavArrows: PropTypes.bool,
    alwaysDisplayStatusBar: PropTypes.bool,
    displaySelectionButtons: PropTypes.bool,
    enableGrid: PropTypes.bool,
    useCircleProgress: PropTypes.bool,
    onActionButton: PropTypes.func,
    onPhotoLongPress: PropTypes.func,
    delayLongPress: PropTypes.number,

    /**
     * Use a custom button in the bottom bar to the left of the Share button,
     * without having to recreate the entire bottom bar and pass it in with the
     * `bottomBarComponent` prop. The visibility of the Share button can still
     * be controlled with `displayActionButton`.
     */
    customBottomBarButton: PropTypes.element,
  };

  static defaultProps = {
    initialIndex: 0,
    displayTopBar: true,
    displayNavArrows: false,
    alwaysDisplayStatusBar: false,
    displaySelectionButtons: false,
    enableGrid: true,
    onGridButtonTap: () => {},
    onPhotoLongPress: () => {},
    delayLongPress: 1000,
  };

  constructor(props) {
    super(props);
    const animatedRef = useAnimatedRef();

    this._renderItem = this._renderItem.bind(this);
    this._toggleControls = this._toggleControls.bind(this);
    this._onScroll = this._onScroll.bind(this);
    this._onPhotoLongPress = this._onPhotoLongPress.bind(this);
    this._onActionButtonTapped = this._onActionButtonTapped.bind(this);
    this._onPageSelected = this._onPageSelected.bind(this);
    this.translateY = useSharedValue(0);
    this.translateX = useSharedValue(0);

    this.photoRefs = [];
    this.state = {
      currentIndex: props.initialIndex,
      currentMedia: props.mediaList[props.initialIndex],
      controlsDisplayed: props.displayTopBar,
    };

    this._onScroll = useAnimatedScrollHandler({
      onScroll: (e, ctx) => {
        this.translateX.value = e.contentOffset.x;
      },
      onEndDrag: (e, ctx) => {
        this.update(e);
      },
      onMomentumEnd: (e, ctx) => {
        this.update(e);
      },
    })
  }

  componentDidMount() {
    // rotate phone I think?
    DeviceEventEmitter.addListener('didUpdateDimensions', () => {
      this.photoRefs.map(p => p && p.forceUpdate());
      this.openPage(this.state.currentIndex, false);
    });

    this.openPage(this.state.currentIndex, false);
  }

  openPage(index, animated) {
    if (!this.flatListView) {
      return;
    }

    this.flatListView.scrollToIndex({
      index,
      animated,
    });

    this._updatePageIndex(index);
  }

  _updatePageIndex(index) {
    console.log("currentMedia", index);
    this.setState({
      currentIndex: index,
      currentMedia: this.props.mediaList[index],
    }, () => {
      this._triggerPhotoLoad(index);
    });
  }

  _triggerPhotoLoad(index) {

    const photo = this.photoRefs[index];
    if (photo) {
      photo.load();
    } else {
      // HACK: photo might be undefined when user taps a photo from gridview
      // that hasn't been rendered yet.
      // photo is rendered after listView's scrollTo method call
      // and i'm deferring photo load method for that.
      setTimeout(this._triggerPhotoLoad.bind(this, index), 200);
    }
  }

  _toggleControls() {
    const { alwaysShowControls, toggleTopBar } = this.props;

    if (!alwaysShowControls) {
      const controlsDisplayed = !this.state.controlsDisplayed;
      this.setState({
        controlsDisplayed,
      });
      toggleTopBar(controlsDisplayed);
    }
  }

  _onActionButtonTapped() {
    const onActionButton = this.props.onActionButton;

    // action behaviour must be implemented by the client
    // so, call the client method or simply ignore this event
    if (onActionButton) {
      const { currentMedia, currentIndex } = this.state;
      onActionButton(currentMedia, currentIndex);
    }
  }

  update(e) {
    const event = e.nativeEvent;
    const layoutWidth = Dimensions.get('window').width;
    const newIndex = Math.floor((event.x + 0.5 * layoutWidth) / layoutWidth);
    console.log("newindex", newIndex);

    this._onPageSelected(newIndex);
  }

  _onPageSelected(page) {
    const { currentIndex } = this.state;
    let newIndex = page;

    if (currentIndex !== newIndex) {
      this._updatePageIndex(newIndex);

      if (this.state.controlsDisplayed && !this.props.displayTopBar) {
        this._toggleControls();
      }
    }
  }

  _onPhotoLongPress() {
    const onPhotoLongPress = this.props.onPhotoLongPress;
    const { currentMedia, currentIndex } = this.state;
    onPhotoLongPress(currentMedia, currentIndex);
  }

  _renderItem({ item, index }) {
    const {
      displaySelectionButtons,
      onMediaSelection,
      useCircleProgress,
    } = this.props;

    return (
      <Animated.View style={styles.flex}>
        <FullScreenPhoto
          ref={ref => this.photoRefs[index] = ref}
          lazyLoad
          useCircleProgress={useCircleProgress}
          uri={item.photo}
          displaySelectionButtons={displaySelectionButtons}
          selected={item.selected}
          onSelection={(isSelected) => onMediaSelection(item, index, isSelected)}
          fn={this._onPageSelected}
        />
      </Animated.View>
    );
  }

  getItemLayout = (data, index) => (
    { length: Dimensions.get('window').width, offset: Dimensions.get('window').width * index, index }
  )

  _renderScrollableContent() {
    const { mediaList } = this.props;

    return (
      <Animated.FlatList
        ref={animatedRef}
        data={mediaList}
        renderItem={this._renderItem}
        onScroll={this._onScroll}
        keyExtractor={this._keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        directionalLockEnabled
        scrollEventThrottle={16}
        getItemLayout={this.getItemLayout}
        initialScrollIndex={this.state.currentIndex}
      />
    );
  }

  _keyExtractor = item => item.id || item.thumb || item.photo;

  render() {
    const {
      displayNavArrows,
      alwaysDisplayStatusBar,
      displayActionButton,
      onGridButtonTap,
      enableGrid,
      customBottomBarButton,
    } = this.props;
    const { controlsDisplayed, currentMedia } = this.state;
    const BottomBarComponent = this.props.bottomBarComponent || BottomBar;

    return (
      <View style={styles.flex}>
        <StatusBar
          hidden={alwaysDisplayStatusBar ? false : !controlsDisplayed}
          showHideTransition={'slide'}
          barStyle={'light-content'}
          animated
          translucent
        />
        {this._renderScrollableContent()}
        <BottomBarComponent
          displayed={controlsDisplayed}
          height={70}
          displayNavArrows={displayNavArrows}
          displayGridButton={enableGrid}
          displayActionButton={displayActionButton}
          media={currentMedia}
          onGrid={onGridButtonTap}
          onAction={this._onActionButtonTapped}
          customButton={customBottomBarButton}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
