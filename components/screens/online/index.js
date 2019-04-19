import React, { Component } from 'react';
import { Text, View, Image, StatusBar, Alert, FlatList } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-community/async-storage';
import { ListItem, Divider, Icon } from 'react-native-elements';
import TouchableScale from 'react-native-touchable-scale';
import NetInfo from '@react-native-community/netinfo';
import TrackPlayer from 'react-native-track-player';
import RNFS from 'react-native-fs';
import UserSongs from '../../global/database';
import '../../global/config';

class OnlineScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            tokenObtained: false,
            username: '',
            apiToken: '',
            apiRefreshToken: '',
            myList: [
                {
                    sn: 1,
                    title: 'Device Offline',
                    avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
                    artist: 'No internet connection'
                }]
        }


        this.isDeviceOnline = false;
        this.navigateToMusics = this.navigateToMusics.bind(this);
        this.logoutUser = this.logoutUser.bind(this);
        this.getApiCredentials = this.getApiCredentials.bind(this);
        this.getMusicFiles = this.getMusicFiles.bind(this);
        this.refreshToken = this.refreshToken.bind(this);
        this.handleSongTap = this.handleSongTap.bind(this);
        this.downloadThisSong = this.downloadThisSong.bind(this);
        this.getUsername = this.getUsername.bind(this);
        this.getApiToken = this.getApiToken.bind(this);
        this.getApiRefreshToken = this.getApiRefreshToken.bind(this);
        this.playThisSongOffline = this.playThisSongOffline.bind(this);

        this.checkInternetConnection();
        this.getApiCredentials();
        this.getMusicFiles();

        // initializing TrackPlayer
        TrackPlayer.setupPlayer();

        // instantiating UserSongs object
        this.userSongsObj = new UserSongs();
    }

    // login credential functions
    getApiCredentials = async () => {
        if (this._isMounted) {
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
            } catch (error) {
                Alert.alert('Something went wrong');
                console.log(error);
            }
        }
    }

    refreshToken = async () => {
        if (this.isDeviceOnline == true && this.state.tokenObtained == true) {
            let url = global.DOMAIN + 'api/refresh/';
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
                    if (res.hasOwnProperty('error')) {
                        if (res.error == 'no token found') {
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
                                apiToken: res.apiToken,
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

    getUsername = async () => {
        if (this.state.tokenObtained == true) {
            return this.state.username;
        } else {
            await this.getApiCredentials();
            if (this.state.tokenObtained == false) {
                console.warn('Could not get api credentails');
            } else {
                return this.state.username;
            }
        }
    }

    getApiToken = async () => {
        if (this.state.tokenObtained == true) {
            return this.state.apiToken;
        } else {
            await this.getApiCredentials();
            if (this.state.tokenObtained == false) {
                console.warn('Could not get api credentails');
            } else {
                return this.state.apiToken;
            }
        }
    }

    getApiRefreshToken = async () => {
        if (this.state.tokenObtained == true) {
            return this.state.apiRefreshToken;
        } else {
            await this.getApiCredentials();
            if (this.state.tokenObtained == false) {
                console.warn('Could not get api credentails');
            } else {
                return this.state.apiRefreshToken;
            }
        }
    }

    // navigation functions
    navigateToMusics() {
        this.props.navigation.navigate('Musics');
    }

    // MISC functions
    _isMounted = false;

    componentDidMount() {
        this._isMounted = true;
        this.getMusicFiles();
        this.checkInternetConnection();
        this.getApiCredentials();

        // Adds an event handler for the playback-track-changed event
        this.onTrackChange = TrackPlayer.addEventListener('playback-track-changed', async (data) => {

            const track = await TrackPlayer.getTrack(data.nextTrack);
            this.setState({ trackTitle: track.title });

        });
    }

    componentWillUnmount() {
        this._isMounted = false;
        // Removes the event handler
        this.onTrackChange.remove();
    }

    // Player specific funtions
    getMusicFiles = async () => {
        this.checkInternetConnection();

        if (this.state.tokenObtained == false) {
            await this.getApiCredentials();
        }

        if (this.isDeviceOnline == true && this.state.tokenObtained == true) {
            // sending request
            var formData = new FormData();
            let username = await this.getUsername();
            let apiToken = await this.getApiToken();
            formData.append('username', username);
            formData.append('token', apiToken);
            var data = {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            };
            fetch(global.DOMAIN + 'api/songs/basic/', data)
                .then((res) => res.json())
                .then((res) => {
                    // handle the response
                    if (res.hasOwnProperty('error')) {
                        if (res.error == 'incorrect token') {
                            this.refreshToken();
                            Alert.alert(res.error);
                        } else {
                            console.log(error);
                        }
                    } else {
                        var musicsList = res;
                        if (this._isMounted) {
                            this.setState({ myList: musicsList });
                        }
                    }
                })
                .catch((error) => {
                    console.warn(error);
                });
        }
    }

    downloadThisSong = async (item) => {
        let _this = this;
        if (this.state.tokenObtained == true) {
            let username = await this.getUsername();
            let apiToken = await this.getApiToken();
            let fileName = item.sn + '.' + item.extension;
            RNFS.downloadFile({
                fromUrl: global.DOMAIN + 'api/songs/play/?sn=' + item.sn + '&username=' + username + '&token=' + apiToken,
                toFile: `${RNFS.DocumentDirectoryPath}/${fileName}`,
            }).promise.then((r) => {
                // Download complete
                if (r.statusCode == 200) {
                    console.log(r.statusCode);
                    _this.userSongsObj.newSongEntry(item.sn, item.title, item.artist);
                } else {
                    console.warn(r);
                }
            });
            console.log(`${RNFS.DocumentDirectoryPath}/${fileName}`);
        }
    }

    playThisSongOffline = async (sn) => {
        let filePath = RNFS.DocumentDirectoryPath + '/' + sn + '.';
        let fileExist = true;
        if (await RNFS.exists(filePath + 'mp3')) {
            filePath = filePath + 'mp3';
        } else if (await RNFS.exists(filePath + 'ogg')) {
            filePath = filePath + 'ogg';
        } else if (await RNFS.exists(filePath + 'wav')) {
            filePath = filePath + 'wav';
        } else {
            // file doesn't exist
            fileExist = false;
        }

        if (fileExist) {
            // reset the queue
            TrackPlayer.reset();

            // Adds a track to the queue
            await TrackPlayer.add({
                id: 'trackId',
                url: `file://${filePath}`,
                title: 'Track Title',
                artist: 'Track Artist',
            });

            // Starts playing it
            TrackPlayer.play();
            TrackPlayer.setVolume(1);
            let state = await TrackPlayer.getState();
        } else {
            Alert.alert('File does not exist');
        }
    }

    logoutUser = () => {
        AsyncStorage.clear();
    }

    checkInternetConnection = () => {
        // check if device is online
        NetInfo.getConnectionInfo().then(data => {
            if (this._isMounted) {
                if (data.type == 'wifi' || data.type == 'cellular') {
                    this.isDeviceOnline = true;
                } else {
                    this.isDeviceOnline = false;
                }

                console.log("Connection type", data.type);
            }
        });

        // add event listener to check internet connection
        const listener = data => {
            if (this._isMounted) {
                if (data.type == 'wifi' || data.type == 'cellular') {
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

    handleSongTap = (item) => {

    }

    renderItem = ({ item }) => (
        <ListItem
            title={item.title}
            titleProps={{ numberOfLines: 1 }}
            titleStyle={{ color: '#383838' }}
            subtitle={item.artist}
            subtitleProps={{ numberOfLines: 1 }}
            subtitleStyle={{ color: 'grey' }}
            leftAvatar={{ source: { uri: (global.DOMAIN + 'api/songs/thumbnail/?sn=' + item.sn + '&token=' + this.state.apiToken + '&username=' + this.state.username) } }}
            onPress={() => this.handleSongTap(item)}
            containerStyle={{ backgroundColor: '#efefef' }}
            Component={TouchableScale}
            friction={90}
            tension={100} // These props are passed to the parent component (here TouchableScale)
            activeScale={0.95}
            onPress={() => this.playThisSongOffline(item.sn)}
            rightElement={<Icon
                reverse
                name='download'
                type='font-awesome'
                color='#27a4de'
                size={15}
                onPress={() => this.downloadThisSong(item)} />}
        />
    )

    render() {
        return (
            <ScrollView style={{ backgroundColor: '#efefef' }}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" />
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