import React, {Component} from 'react';
import {Text, View, Image, StatusBar, Alert, FlatList} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-community/async-storage';
import {ListItem, Divider} from 'react-native-elements';

class OnlineScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            myList: [
                {
                    name: 'Amy Farha',
                    avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
                    subtitle: 'Vice President'
                } ]
        }

        this.navigateToMusics = this.navigateToMusics.bind(this);
        this.logoutUser = this.logoutUser.bind(this);

        this.getMusicFiles = this.getMusicFiles.bind(this);
        this.getMusicFiles();
    }

    navigateToMusics(){
        this.props.navigation.navigate('Musics');
    }

    _isMounted = false;   

    componentDidMount(){
        this._isMounted = true; 
        this.getMusicFiles()
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    getMusicFiles = async () => {
        const list = [
            {
                id:1,
                name: 'Amy Farha',
                avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
                subtitle: 'Vice President'
            },
            {
                id:2,
                name: 'Chris Jackson',
                avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
                subtitle: 'Vice Chairman'
            },
            {
                id:3,
                name: 'Amy Farha',
                avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
                subtitle: 'Vice President'
            },
            {
                id:4,
                name: 'Chris Jackson',
                avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
                subtitle: 'Vice Chairman'
            },
            {
                id:5,
                name: 'Amy Farha',
                avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
                subtitle: 'Vice President'
            },
            {
                id:6,
                name: 'Chris Jackson',
                avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
                subtitle: 'Vice Chairman'
            },
        ]
        if (this._isMounted){
            this.setState({myList: list});
        } 
    }

    logoutUser = () => {
        AsyncStorage.clear();
    }

    keyExtractor = (item, index) => index.toString()

    renderItem = ({ item }) => (
        <ListItem
            title={item.name}
            subtitle={item.subtitle}
            leftAvatar={{ source: { uri: item.avatar_url } }}
            onPress={() => {Alert.alert(item.id.toString())}}
        />
    )

    render() {
        return (
            <ScrollView style={{backgroundColor:'#061737'}}>
            <StatusBar barStyle="light-content" backgroundColor="transparent"/>
                <FlatList
                    keyExtractor={this.keyExtractor}
                    data={this.state.myList}
                    renderItem={this.renderItem}
                    />
            </ScrollView>
        );
    }
}

export default OnlineScreen;