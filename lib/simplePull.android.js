import React from 'react';
import {
  Animated,
  Image,
  PanResponder,
  ScrollView,
  StyleSheet,
  UIManager,
  View,
} from 'react-native';

class SimplePTR extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      shouldTriggerRefresh: false,
      scrollY : new Animated.Value(0),
      refreshHeight: new Animated.Value(0),
      currentY : 0,
      isScrollFree: false
    };

    UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  static propTypes = {
    /**
     * Refresh state set by parent to trigger refresh
     * @type {Boolean}
     */
    isRefreshing : React.PropTypes.bool.isRequired,
    /**
     * Refresh animation complete state set by parent to hide arrow after refresh
     * @type {Boolean}
     */
    isRefreshingComplete : React.PropTypes.bool,
    /**
     * Sets pull distance for how far the Y axis needs to be pulled before a refresh event is triggered
     * @type {Integer}
     */
    minPullDistance : React.PropTypes.number,
    /**
     * Callback for when the refreshing state occurs
     * @type {Function}
     */
    onRefresh : React.PropTypes.func.isRequired,
    /**
     * The content view's background color, not to be mistaken with the content component's background color
     * @type {string}
     */
    contentBackgroundColor: React.PropTypes.string,
    /**
     * The pull to refresh background color.
     * @type {string}
     */
    refreshBackgroundColor: React.PropTypes.string,
    /**
     * Custom spinner image
     * @type {number}
     */
    spinner: React.PropTypes.number,
    /**
     * Max height for custom spinner image
     * @type {number}
     */
    spinnerMaxHeight: React.PropTypes.number,
    /**
     * Custom arrow image
     * @type {number}
     */
    arrow: React.PropTypes.number,
    /**
     * Max height for custom arrow image
     * @type {number}
     */
    arrowMaxHeight: React.PropTypes.number,
    /**
     * Margin around images
     * @type {number}
     */
    margin: React.PropTypes.number,
    /**
     * Custom onScroll event
     * @type {Function}
     */
     onScroll: React.PropTypes.func
  }

  static defaultProps = {
    minPullDistance : 120,
    refreshBackgroundColor: '#e4e4e4',
    contentBackgroundColor: '#fff',
    spinner: require('../assets/spinner.gif'),
    spinnerMaxHeight: 30,
    arrow: require('../assets/arrow-down.png'),
    arrowMaxHeight: 20,
    margin: 16,
  }

  componentWillMount() {
    //Android does not allow for negative scroll, so we have to listen to the scroll values ourselves (at least initially)
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder.bind(this),
       onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder.bind(this),
       onPanResponderMove: this._handlePanResponderMove.bind(this),
       onPanResponderRelease: this._handlePanResponderEnd.bind(this),
       onPanResponderTerminate: this._handlePanResponderEnd.bind(this),
    });
  }

  onScrollTrigger(distance) {
    if (distance.value <= -this.props.minPullDistance) {
      if (!this.state.shouldTriggerRefresh) {
        return this.setState({shouldTriggerRefresh: true});
      }
    } else if (this.state.shouldTriggerRefresh) {
      return this.setState({shouldTriggerRefresh: false});
    }
  }

  onScrollRelease() {
    if (!this.props.isRefreshing && this.state.shouldTriggerRefresh) {
      this.props.onRefresh();
    }
  }

  componentWillReceiveProps(props) {
      if (this.props.isRefreshing !== props.isRefreshing) {
        if (!props.isRefreshing) {
          Animated.spring(this.state.refreshHeight, {
            toValue: 0
          }).start();
        }
    }
  }
  componentDidMount() {
    this.state.refreshHeight.addListener((value) => this.onScrollTrigger(value));
  }

  componentWillUnmount() {
    this.state.refreshHeight.removeAllListeners();
  }

  _handleStartShouldSetPanResponder(e, gestureState) {
    return !this.state.isScrollFree;
  }

  _handleMoveShouldSetPanResponder(e, gestureState) {
    return !this.state.isScrollFree;
  }

  //if  the content scroll value is at 0, we allow for a pull to refresh, or else let native android scrolling handle scrolling
  _handlePanResponderMove(e, gestureState) {
    if (!this.props.isRefreshing) {
      if ((gestureState.dy >= 0 && this.state.scrollY._value === 0) || this.state.refreshHeight._value > 0) {
        this.state.refreshHeight.setValue(-1 * gestureState.dy * 0.5);
      } else {
        //TODO: create a momentum scroll for the first pass
        this.PTR_ScrollComponent.scrollTo({y: -1 * gestureState.dy, animated: true});
      }
    }
  }

  _handlePanResponderEnd(e, gestureState) {
    if (!this.props.isRefreshing) {
      if (this.state.refreshHeight._value <= -this.props.minPullDistance) {
        this.onScrollRelease();
        Animated.spring(this.state.refreshHeight, {
          toValue: -this.props.minPullDistance
        }).start();
      } else if (this.state.refreshHeight._value <= 0) {
        Animated.spring(this.state.refreshHeight, {
          toValue: 0
        }).start();
      }

      if (this.state.scrollY._value > 0) {
        this.setState({isScrollFree: true});
      }
    }
  }

  isScrolledToTop() {
    if (this.state.scrollY._value === 0 && this.state.isScrollFree) {
      this.setState({isScrollFree: false});
    }
  }

  render() {
    const onScroll = this.props.onScroll;

    let onScrollEvent = (event) => {
      if  (onScroll) {
        onScroll(event);
      }
      this.state.scrollY.setValue(event.nativeEvent.contentOffset.y);
    };

    let animateHeight = this.state.refreshHeight.interpolate({
      inputRange: [-this.props.minPullDistance, 0, 0],
      outputRange: [this.props.minPullDistance, 0, 0]
    });

    return  (
      <View style={{flex:1, backgroundColor:this.props.contentBackgroundColor}}
        {...this._panResponder.panHandlers}>
        <ScrollView ref={(view) => { this.PTR_ScrollComponent = view; }}
          scrollEnabled={this.state.isScrollFree}
          onScroll={onScrollEvent}
          onTouchEnd={() => { this.isScrolledToTop(); }}
          onScrollEndDrag={() => { this.isScrolledToTop(); }}
          onMomentumScrollEnd={() => { this.isScrolledToTop(); }}
          onResponderRelease={() => { this.onScrollRelease.bind(this); }}
        >
          <Animated.View style={[styles.refresh, {height: animateHeight, backgroundColor: this.props.refreshBackgroundColor}]}>
            <View style={styles.refresh__container}>
              <Image source={this.props.spinner} style={[styles.refresh__image, {maxHeight: this.props.spinnerMaxHeight, margin: this.props.margin}, !this.props.isRefreshing && this.props.isRefreshingComplete  ? { display: 'none' } : {}]} resizeMode={'contain'} />
              <Image source={this.props.arrow} style={[styles.refresh__image, {maxHeight: this.props.arrowMaxHeight, margin: this.props.margin}, this.props.isRefreshing || !this.props.isRefreshingComplete ? { display: 'none' } : {}]} resizeMode={'contain'} />
            </View>
          </Animated.View>
          {React.cloneElement(this.props.children, {
            scrollEnabled: this.state.isScrollFree,
            scrollEventThrottle: 16,
            ref: (view) => { this.PTR_ScrollComponent = view; },
          })}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  refresh: {
    overflow: 'hidden',
  },
  refresh__container: {
    alignSelf: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  refresh__image: {
    alignSelf: 'center',
    flex: 1,
  },
});

module.exports = SimplePTR;