import React from 'react';
import PropTypes from 'prop-types';
import {
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { BarContainer, BAR_POSITIONS } from './BarContainer';

const BUTTON_WIDTH = 40;

export default class BottomBar extends React.Component {

  static propTypes = {
    displayed: PropTypes.bool,
    height: PropTypes.number,
    displayNavArrows: PropTypes.bool,
    displayGridButton: PropTypes.bool,
    displayActionButton: PropTypes.bool,
    onPrev: PropTypes.func,
    onNext: PropTypes.func,
    onGrid: PropTypes.func,
    onAction: PropTypes.func,
    customButton: PropTypes.element,
  };

  static defaultProps = {
    displayed: false,
    displayNavArrows: false,
    displayGridButton: false,
    displayActionButton: false,
    onPrev: () => {},
    onNext: () => {},
    onGrid: () => {},
    onAction: () => {},
  };

  _renderNavArrows() {
    const {
      displayGridButton,
      displayActionButton,
    } = this.props;
    const missingButtonMargin = BUTTON_WIDTH;
    return (
      <View style={[styles.arrowContainer, {
        marginRight: displayGridButton ? missingButtonMargin : 0,
        marginLeft: displayActionButton ? missingButtonMargin : 0,
      }]}>
    </View>
    );
  }

  _renderGridButton() {
    const { displayGridButton, onGrid } = this.props;

    if (displayGridButton) {
      return (
        <TouchableOpacity style={[styles.button, styles.gridButton]} onPress={onGrid}>
          <Image
            source={require('../../Assets/grid-button.png')}
            style={styles.buttonImage}
          />
        </TouchableOpacity>
      );
    }
    return null;
  }

  _renderActionSheet() {
    const { customButton, displayActionButton, onAction } = this.props;

    const components = [];

    if (customButton) {
      components.push(<View key={0}>{customButton}</View>);
    }

    if (displayActionButton) {
      components.push(
        <TouchableOpacity key={1} style={styles.button} onPress={onAction}>
          <Image source={require('../../Assets/share-button.png')} />
        </TouchableOpacity>
      );
    }
    
    return (
      <View style={styles.rightButtonContainer}>
        {components}
      </View>
    );
  }

  render() {
    const { displayed, height } = this.props;

    return (
      <BarContainer
        position={BAR_POSITIONS.BOTTOM}
        displayed={displayed}
        height={height}
        style={styles.container}
      >

        <View style={styles.buttonContainer}>
          {this._renderGridButton()}
          {this._renderActionSheet()}
        </View>
      </BarContainer>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  arrowContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  rightButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    alignItems: 'center',
    width: BUTTON_WIDTH,
  },
  gridButton: {
    flex: 0,
    paddingTop: 8,
  }
});
