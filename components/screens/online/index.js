import React, {Component} from 'react';
import {Text, View, Image, StatusBar, Alert, FlatList} from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-community/async-storage';
import {ListItem, Divider} from 'react-native-elements';
import TouchableScale from 'react-native-touchable-scale';
//import LinearGradient from 'react-native-linear-gradient';
import NetInfo from '@react-native-community/netinfo';
import '../../global/config';

class OnlineScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            tokenObtained:false,
            username:'',
            apiToken:'',
            apiRefreshToken:'',
            myList: [
                {
                    sn:1,
                    title: 'Device Offline',
                    avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
                    artist: 'No internet connection'
                } ]
        }

        this.isDeviceOnline = false;
        this.navigateToMusics = this.navigateToMusics.bind(this);
        this.logoutUser = this.logoutUser.bind(this);
        this.getApiCredentials = this.getApiCredentials.bind(this);
        this.getMusicFiles = this.getMusicFiles.bind(this);
        this.refreshToken = this.refreshToken.bind(this);

        this.checkInternetConnection();
        this.getApiCredentials();
        this.getMusicFiles();
    }

    getApiCredentials = async() => {
        if (this._isMounted){
            try {
                let username = await AsyncStorage.getItem('@GoMusix:username');
                let apiToken = await AsyncStorage.getItem('@GoMusix:apiToken');
                let apiRefreshToken = await AsyncStorage.getItem('@GoMusix:apiRefreshToken');

                this.setState({
                    username: username,
                    apiToken: apiToken,
                    apiRefreshToken: apiRefreshToken,
                    tokenObtained: true,
                });
            } catch(error){
                Alert.alert('Something went wrong');
                console.log(error);
            }
        }
    }

    refreshToken = async () => {
        if (this.isDeviceOnline == true && this.state.tokenObtained==true){
            let url = global.DOMAIN  + 'api/refresh/';
            let formData = new FormData();
            formData.append('username', this.state.username);
            formData.append('refreshtoken', this.state.apiRefreshToken);
            var data = {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            };

            fetch(url, data)
                .then((res) => res.json())
                .then((res) => {
                    // handle the response
                    if (res.hasOwnProperty('error')){
                        if (res.error == 'no token found'){
                            // logout user.
                            AsyncStorage.clear();
                            this.props.navigation.navigate('OnlineLoggedOut')
                            Alert.alert(res.error);
                        } else {
                            console.log(error);
                        }
                    } else {
                        if (res.hasOwnProperty('apiToken')) {
                            this.setState({
                                apiToken:res.apiToken,
                            });
                        } else {
                            console.log(res);
                        }
                    }
                })
                .catch((error) => {
                    console.warn(error);
                });
        }
    }

    navigateToMusics(){
        this.props.navigation.navigate('Musics');
    }

    _isMounted = false;   

    componentDidMount(){
        this._isMounted = true; 
        this.getMusicFiles();
        this.checkInternetConnection();
        this.getApiCredentials();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    getMusicFiles = async () => {
        this.checkInternetConnection();

        if (this.state.tokenObtained == false){
            await this.getApiCredentials();
        }
        
        if (this.isDeviceOnline == true && this.state.tokenObtained == true){
            // sending request
            var formData = new FormData();
            formData.append('username', this.state.username);
            formData.append('token', this.state.apiToken);
            var data = {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            };
            fetch(global.DOMAIN  + 'api/songs/basic/', data)
                .then((res) => res.json())
                .then((res) => {
                    // handle the response
                    if (res.hasOwnProperty('error')){
                        if (res.error == 'incorrect token'){
                            this.refreshToken();
                            Alert.alert(res.error);
                        } else {
                            console.log(error);
                        }
                    } else {
                        var musicsList = res;
                        if (this._isMounted){
                            this.setState({myList: musicsList});
                        } 
                    }
                })
                .catch((error) => {
                    console.warn(error);
                });            
        }
    }

    logoutUser = () => {
        AsyncStorage.clear();
    }

    checkInternetConnection = () => {
        // check if device is online
        NetInfo.getConnectionInfo().then(data => {
            if (this._isMounted){
                if (data.type == 'wifi' || data.type=='cellular'){
                    this.isDeviceOnline = true;
                } else {
                    this.isDeviceOnline = false; 
                }

                console.log("Connection type", data.type);
            }
        });

        // add event listener to check internet connection
        const listener = data => {
            if (this._isMounted){
                if (data.type == 'wifi' || data.type=='cellular'){
                    this.isDeviceOnline = true;
                } else {
                    this.isDeviceOnline = false; 
                }

                console.log("Connection type", data.type);
            }
        };
        
        // Subscribe
        const subscription = NetInfo.addEventListener('connectionChange', listener);
    }

    keyExtractor = (item, index) => index.toString()

    renderItem = ({ item }) => (
        <ListItem
            title={item.title}
            titleProps={{numberOfLines:1}}
            titleStyle={{color:'white'}}
            subtitle={item.artist}
            subtitleProps={{numberOfLines:1}}
            subtitleStyle={{color:'white'}}
            leftAvatar={{ source: { uri: (global.DOMAIN+'api/songs/thumbnail/?sn='+item.sn+'&token='+this.state.apiToken+'&username='+this.state.username) } }}
            onPress={() => {Alert.alert(item.sn.toString())}}
            containerStyle={{backgroundColor:'#061737'}}
            Component={TouchableScale}
            friction={90} 
            tension={100} // These props are passed to the parent component (here TouchableScale)
            activeScale={0.95} 
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