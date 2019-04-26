import React, { Component } from 'react';
import { Text, View, Image, StatusBar, Alert, FlatList, Platform } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-community/async-storage';
import { ListItem, Divider, Icon, SearchBar, Header } from 'react-native-elements';
import TouchableScale from 'react-native-touchable-scale';
import NetInfo from '@react-native-community/netinfo';
import TrackPlayer from 'react-native-track-player';
import RNFS from 'react-native-fs';
import Swipeout from 'react-native-swipeout';
import UserSongs from '../../global/database';
import { playThisSongOffline, setMusicsListChangedFlagTrue } from '../../global/utils';
import { logoutUser } from '../../global/auth';
import styles from './style';
import '../../global/config';

class OnlineScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            searchInput: null,
            tokenObtained: false,
            username: '',
            apiToken: '',
            apiRefreshToken: '',
            songPlayingSn: null,
            originalMusicsList: [],
            myMusicList: [
                {
                    sn: 1,
                    title: 'Device Offline',
                    avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
                    artist: 'No internet connection'
                }]
        }


        this.isDeviceOnline = false;
        this.navigateToMusics = this.navigateToMusics.bind(this);
        this.getApiCredentials = this.getApiCredentials.bind(this);
        this.getMusicFiles = this.getMusicFiles.bind(this);
        this.refreshToken = this.refreshToken.bind(this);
        this.handleSongTap = this.handleSongTap.bind(this);
        this.downloadThisSong = this.downloadThisSong.bind(this);
        this.getUsername = this.getUsername.bind(this);
        this.getApiToken = this.getApiToken.bind(this);
        this.getApiRefreshToken = this.getApiRefreshToken.bind(this);
        this.initiate = this.initiate.bind(this);

        this.initiate();

        // instantiating UserSongs object
        this.userSongsObj = new UserSongs();
    }

    // initials
    initiate = async () => {
        await this.getApiCredentials();
        this.checkInternetConnection();
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
                            this.setState({
                                myMusicList: musicsList,
                                originalMusicsList: musicsList,
                            });
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

            // Downloading the song
            RNFS.downloadFile({
                fromUrl: global.DOMAIN + 'api/songs/play/?sn=' + item.sn + '&username=' + username + '&token=' + apiToken,
                toFile: `${RNFS.DocumentDirectoryPath}/${fileName}`,
            }).promise.then((r) => {
                // Download complete
                if (r.statusCode == 200) {
                    console.log(r.statusCode);
                    _this.userSongsObj.newSongEntry(item.sn, item.artist, item.title);
                } else {
                    console.warn(r);
                }
            });

            // downloading the thumbnail
            _this.downloadThisSongThumbnail(item.sn);
            console.log(`${RNFS.DocumentDirectoryPath}/${fileName}`);

            // setting musics list changed flag true
            setMusicsListChangedFlagTrue();
        }
    }

    downloadThisSongThumbnail = async (sn) => {
        let _this = this;
        if (this.state.tokenObtained == true) {
            let username = await this.getUsername();
            let apiToken = await this.getApiToken();
            let fileName = sn + '.jpeg';
            // Downloading the thumbnail
            RNFS.downloadFile({
                fromUrl: global.DOMAIN + 'api/songs/thumbnail/?sn=' + sn + '&token=' + apiToken + '&username=' + username,
                toFile: `${RNFS.DocumentDirectoryPath}/thumbnails/${fileName}`,
            }).promise.then((r) => {
                // Download complete
                if (r.statusCode == 200) {
                    console.log(r.statusCode);
                    console.log('Thumbnail saved');
                } else {
                    console.warn(r);
                }
            });
            console.log(`${RNFS.DocumentDirectoryPath}/thumbnails/${fileName}`);
        }
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
            }
        });

        // add event listener to check internet connection
        const listener = data => {
            if (this._isMounted) {
                if (data.type == 'wifi' || data.type == 'cellular') {
                    if (this.isDeviceOnline == false) {
                        this.isDeviceOnline = true;
                        this.getMusicFiles();
                    }
                } else {
                    this.isDeviceOnline = false;
                }
            }
        };

        // Subscribe
        const subscription = NetInfo.addEventListener('connectionChange', listener);
    }

    keyExtractor = (item, index) => index.toString()


    // user interaction functions
    handleSongTap = (item) => {
        playThisSongOffline(item.sn, item.title, item.artist, this);
    }

    updateSearch = (searchText) => {
        if (searchText.length > 0) {
            let musicsList = this.state.originalMusicsList.filter(item => item.title.toLowerCase().includes(searchText.toLowerCase()));
            this.setState({
                myMusicList: musicsList,
            });
        } else {
            let list = this.state.originalMusicsList;
            this.setState({
                myMusicList: list,
            })
        }
    };

    renderItem = ({ item }) => (
        <ListItem
            title={item.title}
            titleProps={{ numberOfLines: 1 }}
            titleStyle={styles.songTitleStyle}
            subtitle={item.artist}
            subtitleProps={{ numberOfLines: 1 }}
            subtitleStyle={styles.songArtistStyle}
            leftAvatar={{ source: { uri: (global.DOMAIN + 'api/songs/thumbnail/?sn=' + item.sn + '&token=' + this.state.apiToken + '&username=' + this.state.username) } }}
            onPress={() => this.handleSongTap(item)}
            containerStyle={styles.songListContainer}
            Component={TouchableScale}
            friction={90}
            tension={100} // These props are passed to the parent component (here TouchableScale)
            activeScale={0.95}
            bottomDivider={true}
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
        const { searchInput } = this.state;
        return (
            <View style={{ backgroundColor: '#efefef', minHeight: '100%' }}>
                <Header
                    centerComponent={{ text: 'Online', style: { color: '#061737' } }}
                    rightComponent={
                        <TouchableOpacity
                            onPress={() => { this.props.navigation.navigate('MediaPlayer') }}
                            style={{ padding: 8, }}>
                            <Icon
                                name='music'
                                type='font-awesome'
                                color={'#27a4de'}
                            />
                        </TouchableOpacity>
                    }
                    leftComponent={
                        <TouchableOpacity
                            onPress={() => { logoutUser(this); }}
                            style={{ padding: 8, }}><Icon
                                name='sign-out'
                                type='font-awesome'
                                color={'#27a4de'} />
                        </TouchableOpacity>}
                    backgroundColor={'white'}
                    containerStyle={{ borderBottomWidth: 2, borderBottomColor: '#27a4de' }}
                />
                <ScrollView style={{ backgroundColor: '#efefef', }}>
                    <StatusBar barStyle="dark-content" backgroundColor="transparent" />
                    <SearchBar
                        placeholder={'Search here'}
                        platform='ios'
                        onChangeText={(searchText) => this.updateSearch(searchText)}
                        value={searchInput}
                    />

                    <FlatList
                        style={{ paddingBottom: 80 }}
                        keyExtractor={this.keyExtractor}
                        data={this.state.myMusicList}
                        renderItem={this.renderItem}
                    />
                </ScrollView>
            </View>
        );
    }
}

export default OnlineScreen;