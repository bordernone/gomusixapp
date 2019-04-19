import React, { Component } from 'react';
import { Text, View, Image, StatusBar, Alert } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { ListItem, Divider } from 'react-native-elements';
import styles from './style';

class MusicsScreen extends Component {
  constructor(props) {
    super(props)

    this.navigateToOnline = this.navigateToOnline.bind(this);
  }

  navigateToOnline() {
    this.props.navigation.navigate('Online')
  }

  render() {
    const list = [
      {
        name: 'Amy Farha',
        avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
        subtitle: 'Vice President'
      },
      {
        name: 'Chris Jackson',
        avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
        subtitle: 'Vice Chairman'
      },
      {
        name: 'Amy Farha',
        avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
        subtitle: 'Vice President'
      },
      {
        name: 'Chris Jackson',
        avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
        subtitle: 'Vice Chairman'
      },
      {
        name: 'Amy Farha',
        avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
        subtitle: 'Vice President'
      },
      {
        name: 'Chris Jackson',
        avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
        subtitle: 'Vice Chairman'
      },
    ]
    return (
      <ScrollView style={{ backgroundColor: '#efefef' }}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" />
        {
          list.map((l, i) => (
            <ListItem
              key={i}
              leftAvatar={{ source: { uri: l.avatar_url } }}
              title={l.name}
              subtitle={l.subtitle}
              containerStyle={{ backgroundColor: '#efefef' }}
              titleStyle={{ color: '#383838' }}
              subtitleStyle={{ color: 'grey' }}
            />
          ))
        }
      </ScrollView>
    );
  }
}

export default MusicsScreen;