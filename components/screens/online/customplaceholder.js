import React from 'react';
import { Text, View} from 'react-native';
import {ListItem} from 'react-native-elements';
import Placeholder from 'rn-placeholder';

const customPlaceholder = (props) => {
  const style = { backgroundColor: props.bgColor };
  return (
  <View>
      <ListItem
            title={<Placeholder.Line color='#d8d8d8'/>}
            titleProps={{ numberOfLines: 1 }}
            subtitle={<Placeholder.Line color='#d8d8d8' width='50%'/>}
            subtitleProps={{ numberOfLines: 1 }}
            leftAvatar={{ source: { uri: '' } }}
        />
    </View>);
};

export default Placeholder.connect(customPlaceholder);