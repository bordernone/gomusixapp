import React, { Component } from 'react';
import { Text, View, Image, StatusBar, Alert, FlatList, Platform } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { ListItem, Icon, SearchBar, Header } from 'react-native-elements';
import TouchableScale from 'react-native-touchable-scale';
import NetInfo from '@react-native-community/netinfo';
import TrackPlayer from 'react-native-track-player';
import * as Progress from 'react-native-progress';
import UserSongs from '../../global/database';
import { playThisSongOffline, getApiCredentials, getMusicFiles, downloadThisSong } from '../../global/utils';
import { logoutUser } from '../../global/auth';
import styles from './style';
import '../../global/config';
import Myplaceholder from './customplaceholder';

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
            myMusicList: [],
        }


        this.isDeviceOnline = false;
        this.navigateToMusics = this.navigateToMusics.bind(this);
        this.handleSongTap = this.handleSongTap.bind(this);
        this.initiate = this.initiate.bind(this);

        this.initiate();

        // instantiating UserSongs object
        this.userSongsObj = new UserSongs();
    }

    // initials
    initiate = async () => {
        await getApiCredentials(this);
        this.checkInternetConnection();
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
        getApiCredentials(this);

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

    indexFromSn = (sn) => {
        return this.state.originalMusicsList.findIndex(song => song.sn == sn)
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
                        getMusicFiles(this);
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
        <Myplaceholder
            lineNumber={3}
            textSize={16}
            lineSpacing={5}
            color='#c1c1c1'
            width="100%"
            animate="shine"
            onReady={this.state.isReady}
        >
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
                rightElement={item.isDownloading == true ?
                    <View style={{ paddingRight: 10 }}><Progress.Circle size={30} indeterminate={true} /></View>
                    :
                    <Icon
                        reverse
                        name='download'
                        type='font-awesome'
                        color='#27a4de'
                        size={15}
                        onPress={() => downloadThisSong(this, item)} />
                }
            />
        </Myplaceholder>
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
                    containerStyle={{ borderBottomWidth: 2, borderBottomColor: '#27a4de', marginTop: Platform.OS === 'ios' ? 0 : - 26, }}
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