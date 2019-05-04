import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-navigation';
import { Image, Icon } from 'react-native-elements';
import Placeholder from 'rn-placeholder';
import TrackPlayer from 'react-native-track-player';
import { isSongPlaying, playingSongSn, playThisPausedSong, playThisSongOffline, pauseThisSong } from '../../global/utils';
import UserSongs from '../../global/database';
import styles from './style';

class MediaPlayerScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentlyPlayingSong: {
                sn: 1,
                title: 'Title',
                artist: 'Artist',
                thumbnailUrl: ''
            },
            isReady: null,
        }

        this.navigateToDashboard = this.navigateToDashboard.bind(this);
        this.indexFromSn = this.indexFromSn.bind(this);

        // creating database object
        this.userSongsObj = new UserSongs();
    }

    _isMounted = false;

    componentDidMount() {
        let _this = this;

        this._isMounted = true;

        this.initialize();

        // Adds an event handler for the playback-state
        this.onTrackChange = TrackPlayer.addEventListener('playback-state', async (data) => {
            const state = await TrackPlayer.getState();
            if (state == TrackPlayer.STATE_PLAYING && this._isMounted == true) {
                _this.updatePlaying();
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

    componentWillUnmount() {
        this._isMounted = false;

        // remove event listener
        this.onTrackChange.remove();
    }

    updatePlaying = async () => {
        if (await isSongPlaying()) {
            let currentlyPlayingSongSn = await playingSongSn();
            this.userSongsObj.getSongEntry(this, currentlyPlayingSongSn);
        }
    }

    initialize = async () => {
        if (this._isMounted) {
            // updating UI
            if (await isSongPlaying()) {
                let currentlyPlayingSongSn = await playingSongSn();
                if (currentlyPlayingSongSn != undefined) {
                    this.userSongsObj.getSongEntry(this, currentlyPlayingSongSn);
                }

                this.setState({
                    isSongPlaying: true,
                });
            }

            // getting songs list
            await this.userSongsObj.getSongsList(this);
        }
    }

    navigateToDashboard = () => {
        this.props.navigation.navigate("Dashboard");
    }

    indexFromSn = (sn) => {
        return this.state.originalMusicsList.findIndex(song => song.sn == sn)
    }

    playButtonPressed = async (item) => {
        let currentlyPlayingSongSn = await playingSongSn();
        if (currentlyPlayingSongSn == item.sn && await isSongPlaying() == true) {
            pauseThisSong(this);
        } else if (currentlyPlayingSongSn == item.sn) {
            playThisPausedSong();
        } else {
            playThisSongOffline(item.sn, item.title, item.artist, this);
        }
    }

    playNextSong = async () => {
        let musicsListLength = this.state.originalMusicsList.length;
        if (musicsListLength > 1) {
            let currentlyPlayingSongSn = await playingSongSn();
            if (currentlyPlayingSongSn != undefined) {
                let currentIndex = this.indexFromSn(currentlyPlayingSongSn);
                let nextIndex = currentIndex + 1;
                if (nextIndex >= musicsListLength){
                    nextIndex = 0;
                }
                let nextSong = this.state.originalMusicsList[nextIndex];
                playThisSongOffline(nextSong.sn, nextSong.title, nextSong.artist, this);
            }
        }
    }

    playPrevSong = async () => {
        let musicsListLength = this.state.originalMusicsList.length;
        if (musicsListLength > 1) {
            let currentlyPlayingSongSn = await playingSongSn();
            if (currentlyPlayingSongSn != undefined) {
                let currentIndex = this.indexFromSn(currentlyPlayingSongSn);
                let nextIndex = currentIndex - 1;
                if (nextIndex < 0){
                    nextIndex = musicsListLength - 1;
                }
                let nextSong = this.state.originalMusicsList[nextIndex];
                playThisSongOffline(nextSong.sn, nextSong.title, nextSong.artist, this);
            }
        }
    }

    render() {
        return (
            <SafeAreaView>
                <View style={styles.mediaPlayerTopNavContainer}>
                    <TouchableOpacity style={styles.backButtonContainer} onPress={() => { this.navigateToDashboard(); }}>
                        <Text style={styles.goBackText}>{'< Go Back'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.contentContainer}>
                    <View style={styles.thumbnailContainer}>
                        <Placeholder.ImageContent
                            size={200}
                            animate="shine"
                            lineNumber={4}
                            lineSpacing={5}
                            lastLineWidth="30%"
                            onReady={this.state.isReady}
                        >
                            <Image
                                containerStyle={styles.songThumbnailImgContainer}
                                style={styles.songThumbnailImg}
                                source={{ uri: this.state.currentlyPlayingSong.thumbnailUrl }}
                                elevation={1}
                            />
                        </Placeholder.ImageContent>
                    </View>


                    <View style={styles.songTitleContainer}>
                        <Placeholder.Line
                            color="grey"
                            width="100%"
                            onReady={this.state.isReady}
                        >
                            <Text style={styles.songTitleText} numberOfLines={1}>{this.state.currentlyPlayingSong.title}</Text>
                        </Placeholder.Line>
                    </View>

                    <View style={styles.songArtistContainer}>
                        <Placeholder.Line
                            color="grey"
                            width="100%"
                            onReady={this.state.isReady}
                        >
                            <Text style={styles.songArtistText} numberOfLines={1}>{this.state.currentlyPlayingSong.artist}</Text>
                        </Placeholder.Line>
                    </View>

                    <View style={styles.mediaPlayerActionContainer}>
                        <Icon
                            reverse
                            name='caret-left'
                            type='font-awesome'
                            color='#27a4de'
                            onPress={() => { this.playPrevSong(); }} />
                        <Icon
                            name={this.state.isSongPlaying == true ? 'pause-circle' : 'play-circle'}
                            type='font-awesome'
                            color='#27a4de'
                            size={80}
                            onPress={() => {
                                this.playButtonPressed(this.state.currentlyPlayingSong);
                            }} />
                        <Icon
                            reverse
                            name='caret-right'
                            type='font-awesome'
                            color='#27a4de'
                            onPress={() => { this.playNextSong(); }} />

                    </View>
                </View>
            </SafeAreaView>
        )
    }
}

export default MediaPlayerScreen;