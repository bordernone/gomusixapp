import React, { Component } from 'react';
import { Text, View, Image, StatusBar, Alert, FlatList } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-navigation';

class MediaPlayerScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }

    render() {
        return (
            <SafeAreaView>
                <ScrollView style={{ backgroundColor: '#efefef' }}>
                    <StatusBar barStyle="dark-content" backgroundColor="transparent" />

                    <Text style={{color:'red'}}>Google</Text>
                </ScrollView>
            </SafeAreaView>
        );
    }
}

export default MediaPlayerScreen;