import React from 'react';
import { ListView, StatusBar, StyleSheet, Text, View } from 'react-native';

import PullToRefresh from 'react-native-simple-ptr';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: this.insertRowData(),
      isRefreshing: false,
    }
  }

  onRefresh() {
    this.setState({isRefreshing: true});

    setTimeout(() => {
      this.setState({isRefreshing: false});
    }, 5000);
  }

  insertRowData() {
    let numRows = 10;
    var rows = Array.apply(0, new Array(numRows)).map((x,i) => `ListView Item ${i}`);
    return this.ds.cloneWithRows(rows);
  }

  render() {
    return (
      <View style={{flex:1}}>
        <View style={{height: 64, backgroundColor: 'red'}}>
          <Text style={{top: 35, fontWeight: 'bold', fontSize: 18, color: 'white', textAlign: 'center'}}>Header or Nav. of some sort</Text>
        </View>
        <PullToRefresh
          isRefreshing={this.state.isRefreshing}
          onRefresh={this.onRefresh.bind(this)}
          minPullDistance={100}
          contentBackgroundColor={'#dccdc8'}
          refreshBackgroundColor={'#ccc'}
          arrow={require('./assets/images/arrow-down.png')}
          arrowMaxHeight={50}
          spinner={require('./assets/images/spinner.gif')}
          spinnerMaxHeight={50}
          margin={25}
          >
          <ListView
            dataSource={this.state.dataSource}
            renderRow={(rowData) => <View style={styles.row}><Text style={styles.text}>{rowData}</Text></View>}
          />
        </PullToRefresh>
        <StatusBar barStyle="light-content" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1
  },
  row: {
    padding: 10,
    height: 125,
    backgroundColor: '#dccdc8',
    borderTopWidth: 1,
    marginBottom:-1,
    borderBottomColor: '#E5EDF5',
    borderTopColor: '#E5EDF5',
    borderBottomWidth: 1,
  },
  text: {
    textAlign: 'center',
    color: 'black'
  }
})
