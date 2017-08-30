import React from 'react'
import {
  Animated,
  Image,
  StyleSheet,
  View,
} from 'react-native';

class SimplePTR extends React.Component {
  constructor(props) {
    super(props);

    this.state  = {
      isRefreshingComplete: true,
      shouldTriggerRefresh: false,
      scrollY : new Animated.Value(0),
    };
  }

  static propTypes = {
    /**
     * Refresh state set by parent to trigger refresh
     * @type {Boolean}
     */
    isRefreshing : React.PropTypes.bool.isRequired,
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

  componentDidMount() {
    this.state.scrollY.addListener((value) => this.onScrollTrigger(value));
  }

  componentWillUnmount() {
    this.state.scrollY.removeAllListeners();
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
      this.PTR_ScrollComponent.scrollTo({y: -this.props.minPullDistance})
      this.setState({isScrollFree: false, isRefreshingComplete: false});
      this.props.onRefresh();
    }
  }

  componentWillReceiveProps(props) {
    if (this.props.isRefreshing !== props.isRefreshing) {
        if (!props.isRefreshing) {
          setTimeout(() => {
            this.setState({isRefreshingComplete: true});
          }, 500);

          this.PTR_ScrollComponent.scrollTo({y: 0});
          this.setState({isScrollFree: true});
        }
    }
  }

  render() {
    const onScroll = this.props.onScroll;
    let onScrollEvent = (event) => {
      if  (onScroll) {
        onScroll(event);
      }
      this.state.scrollY.setValue(event.nativeEvent.contentOffset.y)
    };
    let animateHeight = this.state.scrollY.interpolate({
      inputRange: [-this.props.minPullDistance,0],
      outputRange: [this.props.minPullDistance, 0]
    });

    return (
      <View style={{flex:1, zIndex:-100,backgroundColor: this.props.contentBackgroundColor}}>
        <Animated.View style={{ height: animateHeight, backgroundColor: this.props.refreshBackgroundColor, overflow: 'hidden' }}>
          <View style={{flex: 1, alignSelf: 'center', justifyContent: 'center', height: '100%'}}>
            <Image source={this.props.spinner} style={[{flex: 1, alignSelf: 'center', maxHeight: this.props.spinnerMaxHeight, margin: this.props.margin}, !this.props.isRefreshing && this.state.isRefreshingComplete  ? { display: 'none' } : {}]} resizeMode={'contain'} />
            <Image source={this.props.arrow} style={[{flex: 1, alignSelf: 'center', maxHeight: this.props.arrowMaxHeight, margin: this.props.margin}, this.props.isRefreshing || !this.state.isRefreshingComplete ? { display: 'none' } : {}]} resizeMode={'contain'} />
          </View>
        </Animated.View>
        <View style={styles.contentView}>
          {React.cloneElement(this.props.children, {
            scrollEnabled: this.state.isScrollFree,
            onScroll: onScrollEvent,
            scrollEventThrottle: 16,
            onResponderRelease: this.onScrollRelease.bind(this),
            ref: (view) => { this.PTR_ScrollComponent = view; },
          })}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  contentView: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
});

module.exports = SimplePTR;
