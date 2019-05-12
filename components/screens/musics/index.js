import React, { Component } from 'react';
import { View, StatusBar, Alert, FlatList, Platform } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { ListItem, SearchBar, Header, Icon, Badge } from 'react-native-elements';
import RNFS from 'react-native-fs';
import NetInfo from '@react-native-community/netinfo';
import DefaultPreference from 'react-native-default-preference';
import TrackPlayer from 'react-native-track-player';
import ActionSheet from 'react-native-actionsheet';
import UserSongs from '../../global/database';
import styles from './style';
import { playThisSongOffline, deleteThisSong, isMusicsListChanged, getMusicFilesFromServer, doesThisSongExist, getUsername, getApiToken, setMusicsListChangedFlagTrue, isSongPlaying, playingSongSn } from '../../global/utils';
import '../../global/config';

class MusicsScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            searchInput: null,
            originalMusicsList: [],
            musicsList: [],
            rowIndex: null,
            songPlayingSn: null,
            musicsListServer: [],
            syncStarted: false,
            syncSongsSn: [],
            longPressedItem: null,
        }

        this.navigateToOnline = this.navigateToOnline.bind(this);
        this.handleSongTap = this.handleSongTap.bind(this);
        this.getSongsList = this.getSongsList.bind(this);
        this.initiate = this.initiate.bind(this);
        this.getLocalThumbnailUrl = this.getLocalThumbnailUrl.bind(this);
        this.onSwipeClose = this.onSwipeClose.bind(this);
        this.onSwipeOpen = this.onSwipeOpen.bind(this);
        this.handleSongDelete = this.handleSongDelete.bind(this);
        this.updateSearch = this.updateSearch.bind(this);
        this.updateMusicsList = this.updateMusicsList.bind(this);
        this.checkInternetConnection = this.checkInternetConnection.bind(this);

        // creating database object
        this.userSongsObj = new UserSongs();

        this.initiate();
    }

    _isMounted = false;
    // Component functions
    componentDidMount() {
        var _this = this;
        this._isMounted = true;

        // event listener if this screen is focused
        this.didFocusListener = this.props.navigation.addListener(
            'didFocus',
            () => {
                this.updateMusicsList();
            },
        );

        // Adds an event handler for the playback-state
        this.onTrackChange = TrackPlayer.addEventListener('playback-state', async (data) => {
            const state = await TrackPlayer.getState();
            if (state == TrackPlayer.STATE_PLAYING && this._isMounted == true) {
                _this.setState({
                    isSongPlaying: true,
                });
            } else if (state == TrackPlayer.STATE_PAUSED && this._isMounted == true) {
                _this.setState({
                    isSongPlaying: false,
                });
            }
        });

    }

    componentDidUpdate = async () => {
        if (this._isMounted) {
            if (this.state.musicsListServer.length > 0 && this.state.syncStarted == false) {
                await this.setState({
                    syncStarted: true,
                });


                if (await DefaultPreference.get('GoMusix:autosync') == 'true') {
                    await this.setState({
                        userWantsToSync: true,
                    });
                    this.downloadNextSong();
                }
            }
        }
    }

    componentWillUnmount() {
        this._isMounted = false;

        //remove event listener
        this.onTrackChange.remove();
    }

    navigateToOnline() {
        this.props.navigation.navigate('Online')
    }

    initiate = async () => {
        // create thumbnail folder if doesn't exist
        RNFS.mkdir(RNFS.DocumentDirectoryPath + '/thumbnails');

        this.getSongsList();

        this.checkInternetConnection(); // this method automatically loads songs from server

        // checking if song is being played
        if (await isSongPlaying()) {
            await this.setState({
                isSongPlaying: true,
                songPlayingSn: await playingSongSn(),
            });
        }

    }

    checkInternetConnection = () => {
        // check if device is online
        NetInfo.getConnectionInfo().then(data => {
            if (this._isMounted) {
                if (data.type == 'wifi' || data.type == 'cellular') {
                    this.isDeviceOnline = true;
                    getMusicFilesFromServer(this);
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
                        getMusicFilesFromServer(this);
                    }
                } else {
                    this.isDeviceOnline = false;
                }
            }
        };

        // Subscribe
        const subscription = NetInfo.addEventListener('connectionChange', listener);
    }

    indexFromSn = (sn) => {
        return this.state.originalMusicsList.findIndex(song => song.sn == sn)
    }

    doesThisExistInDb = async (song) => {
        let index = this.indexFromSn(song.sn);
        if (index >= 0) {
            let downloadedSong = this.state.originalMusicsList[index];

            if (song.title == downloadedSong.title && song.artist == downloadedSong.artist) {
                return true;
            } else {
                console.log(song);
                console.log(downloadedSong);
                return false;
            }
        } else {
            return false;
        }
    }

    downloadNextSong = async () => {
        let numberOfSongs = this.state.musicsListServer.length;
        if (this.state.userWantsToSync == true && this.state.tokenObtained == true) {
            if (numberOfSongs != undefined && numberOfSongs > 0) {
                for (i = 0; i < numberOfSongs; i++) {
                    let currentSong = this.state.musicsListServer[i];
                    if ((await doesThisSongExist(currentSong.sn) == false || await this.doesThisExistInDb(currentSong) == false) && this.state.syncSongsSn.includes(currentSong.sn.toString()) == false) {
                        console.log('Downloading: ' + currentSong.title);
                        if (this.state.tokenObtained == true && this._isMounted == true) {
                            var _this = this;
                            let username = await getUsername(this);
                            let apiToken = await getApiToken(this);
                            let fileName = currentSong.sn + '.' + currentSong.extension;

                            // Downloading the song
                            RNFS.downloadFile({
                                fromUrl: global.DOMAIN + 'api/songs/play/?sn=' + currentSong.sn + '&username=' + username + '&token=' + apiToken,
                                toFile: `${RNFS.DocumentDirectoryPath}/${fileName}`,
                            }).promise.then((r) => {
                                // Download completed
                                if (r.statusCode == 200) {
                                    // Downloading the thumbnail
                                    let fileName = currentSong.sn + '.jpeg';
                                    RNFS.downloadFile({
                                        fromUrl: global.DOMAIN + 'api/songs/thumbnail/?sn=' + currentSong.sn + '&token=' + apiToken + '&username=' + username,
                                        toFile: `${RNFS.DocumentDirectoryPath}/thumbnails/${fileName}`,
                                    }).promise.then((r) => {
                                        // Download completed
                                        if (r.statusCode == 200) {
                                            console.log('Thumbnail saved');
                                        } else {
                                            console.warn(r);
                                        }
                                    });
                                    _this.userSongsObj.newSongEntry(currentSong.sn, currentSong.artist, currentSong.title);
                                    let syncSongsSn = _this.state.syncSongsSn;
                                    syncSongsSn.push(currentSong.sn.toString());
                                    _this.setState({
                                        syncSongsSn: syncSongsSn,
                                    });
                                    setMusicsListChangedFlagTrue();
                                } else {
                                    console.log(r);
                                }
                                _this.getSongsList();
                                _this.downloadNextSong();
                            });
                        }

                        if (i === numberOfSongs - 1) {
                            console.log('Sync finished');
                        }
                        break;
                    }
                }
            }
        }
    }

    // other functions
    getSongsList = async () => {
        await this.userSongsObj.getSongsList(this);
    }

    getLocalThumbnailUrl = (sn) => {
        let fileName = sn + '.jpeg';
        return RNFS.DocumentDirectoryPath + '/thumbnails/' + fileName;
    }

    updateMusicsList = async () => {
        if (await isMusicsListChanged()) {
            this.getSongsList();
        }
    }

    // user interaction functions
    handleSongTap = (item) => {
        playThisSongOffline(item.sn, item.title, item.artist, this);
        this.props.navigation.navigate('MediaPlayer');
    }

    handleLongPressSong = (item) => {
        this.setState({
            longPressedItem: item,
        });
        this.ActionSheet.show();
    }

    handleOptionSelection = (optionIndex) => {
        if (optionIndex == 0) {
            // handle song play
            let item = this.state.longPressedItem;
            playThisSongOffline(item.sn, item.title, item.artist, this);
        } else if (optionIndex == 1) {
            // handle song deletion
            let item = this.state.longPressedItem;
            let indexOfSong = this.indexFromSn(item.sn);
            this.handleSongDelete(item, indexOfSong);
            console.log('Delete Song ' + item.title + ' Index: ' + indexOfSong)
        } else if (optionIndex == 2) {
            // handle cancel
            this.setState({
                longPressedItem: null,
            });
        }
    }

    handleSongDelete = (item, index) => {
        deleteThisSong(item.sn);
        let musicsList = this.state.musicsList;
        musicsList.splice(index, 1);
        this.setState({
            musicsList: musicsList,
        });
    }

    updateSearch = (searchText) => {
        if (searchText.length > 0) {
            let musicsList = this.state.originalMusicsList.filter(item => item.title.toLowerCase().includes(searchText.toLowerCase()));
            this.setState({
                musicsList: musicsList,
            });
        } else {
            let list = this.state.originalMusicsList;
            this.setState({
                musicsList: list,
            })
        }
    };

    // close/open swipes
    onSwipeOpen(rowIndex) {
        this.setState({
            rowIndex: rowIndex
        })
    }

    onSwipeClose(rowIndex) {
        if (rowIndex === this.state.rowIndex) {
            this.setState({ rowIndex: null });
        }
    }


    keyExtractor = (item, index) => index.toString()

    render() {
        const { searchInput } = this.state;

        var optionArray = [
            'Play now',
            'Delete',
            'Cancel',
        ];

        return (
            <View style={{ backgroundColor: '#efefef', minHeight: '100%' }}>
                <Header
                    placement={'center'}
                    centerComponent={{ text: 'Musics', style: { color: '#061737' } }}
                    rightComponent={<TouchableOpacity
                        onPress={() => { this.props.navigation.navigate('MediaPlayer') }}
                        style={{ padding: 8, }}>
                        <Icon
                            name='music'
                            type='font-awesome'
                            color={'#27a4de'}
                        />
                    </TouchableOpacity>}
                    leftComponent={
                        <TouchableOpacity
                            onPress={() => { this.props.navigation.toggleDrawer(); }}
                            style={{ padding: 8, }}><Icon
                                name='bars'
                                type='font-awesome'
                                color={'#27a4de'} />
                        </TouchableOpacity>}
                    backgroundColor={'white'}
                    containerStyle={{ borderBottomWidth: 2, borderBottomColor: '#27a4de', marginTop: Platform.OS === 'ios' ? 0 : - 26, }}
                />

                <ScrollView style={{ backgroundColor: '#efefef' }}>
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
                        data={this.state.musicsList}
                        renderItem={({ item, index }) => (
                            <ListItem
                                onLongPress={() => { this.handleLongPressSong(item); }}
                                title={item.title}
                                titleProps={{ numberOfLines: 1 }}
                                titleStyle={styles.songTitleStyle}
                                subtitle={item.artist}
                                subtitleProps={{ numberOfLines: 1 }}
                                subtitleStyle={styles.songArtistStyle}
                                leftAvatar={{ source: { uri: item.thumbnailUrl } }}
                                onPress={() => this.handleSongTap(item)}
                                containerStyle={styles.songListContainer}
                                Component={TouchableOpacity}
                                friction={50}
                                tension={100}
                                activeScale={0.95}
                                bottomDivider={true}
                                rightElement={
                                    this.state.songPlayingSn == item.sn && this.state.isSongPlaying == true ? <Badge value={'Playing'} /> : <View></View>
                                }
                            />
                        )}
                        extraData={this.state.rowIndex}
                    />
                </ScrollView>

                <ActionSheet
                    ref={o => (this.ActionSheet = o)}
                    //Title of the Bottom Sheet
                    title={'Options'}
                    //Options Array to show in bottom sheet
                    options={optionArray}
                    //Define cancel button index in the option array
                    //this will take the cancel option in bottom and will highlight it
                    cancelButtonIndex={2}
                    //If you want to highlight any specific option you can use below prop
                    destructiveButtonIndex={1}
                    onPress={index => {
                        //Clicking on the option will give you the index of the option clicked
                        this.handleOptionSelection(index);
                    }}
                />
            </View>
        );
    }
}

export default MusicsScreen;