import React, { Component } from 'react';
import { Text, View, StatusBar, Alert, FlatList, Platform } from 'react-native';
import { Image, Icon } from 'react-native-elements';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-navigation';
import Carousel from 'react-native-snap-carousel';
import TrackPlayer from 'react-native-track-player';
import UserSongs from '../../global/database';
import styles, { carouselItemWidth, carouselWidth } from './style';
import { playThisSongOffline, pauseThisSong, isSongPlaying, playThisPausedSong, playingSongSn } from '../../global/utils';

class MediaPlayerScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            firstMove: false,
            songPlayingSn: null,
            firstItemIndex: null,
            isSongPlaying: false,
            playButtonIcon: 'play-circle',
            originalMusicsList: [],
            musicsList: [],
        }

        this.initiate = this.initiate.bind(this);
        this.indexFromSn = this.indexFromSn.bind(this);
        this.moveToNext = this.moveToNext.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.getSongsList = this.getSongsList.bind(this);
        this.moveToPrev = this.moveToPrev.bind(this);
        this.moveToItem = this.moveToItem.bind(this);
        this.moveToCurrentPlayingItem = this.moveToCurrentPlayingItem.bind(this);
        this.playButtonPressed = this.playButtonPressed.bind(this);
        this.navigateToDashboard = this.navigateToDashboard.bind(this);

        // creating database object
        this.userSongsObj = new UserSongs();

    }

    // component related functions
    _isMounted = false;
    componentDidMount = async () => {
        this._isMounted = true;

        this.initiate();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    componentDidUpdate = async () => {
        // moving the carousel to correct position when loaded
        if (this._isMounted) {
            let isSongPlayingNow = await isSongPlaying();
            if (isSongPlayingNow) {
                if (this.state.firstMove == false) {
                    if (this.state.originalMusicsList.length > 0) {
                        let currentlyPlayingSongSn = await playingSongSn();
                        this.moveToCurrentPlayingItem(currentlyPlayingSongSn);
                        await this.setState({
                            firstMove: true,
                            songPlayingSn: currentlyPlayingSongSn,
                            isSongPlaying: true,
                        });
                    }
                }
            }
        }

    }

    // initial function
    initiate = async () => {
        // load songs list
        await this.getSongsList();

        // Adds an event handler for the playback-state
        this.onTrackChange = TrackPlayer.addEventListener('playback-state', async (data) => {
            const state = await TrackPlayer.getState();
            if (state == TrackPlayer.STATE_PAUSED && this._isMounted == true) {
                this.setState({
                    isSongPlaying: false,
                });
            }
        });
    }

    getSongsList = async () => {
        await this.userSongsObj.getSongsList(this);
    }

    indexFromSn = (sn) => {
        return this.state.originalMusicsList.findIndex(song => song.sn == sn)
    }

    // carousel navigation functions
    moveToNext = () => {
        this._carousel.snapToNext();
    }

    moveToPrev = () => {
        this._carousel.snapToPrev();
    }

    moveToItem = (index) => {
        setTimeout(() => {
            this._carousel.snapToItem(index);
        }, 500);
    }

    moveToCurrentPlayingItem = (sn) => {
        let currentPlayingIndex = this.indexFromSn(sn);
        console.log(currentPlayingIndex);
        console.log(this.state.musicsList);
        let currentPositionCarousel = this._carousel.currentIndex;
        if (currentPlayingIndex != currentPositionCarousel) {
            this.moveToItem(currentPlayingIndex);
        }
    }

    // navigation functions
    navigateToDashboard = () => {
        this.props.navigation.navigate('Dashboard');
    }

    // user interaction functions
    playButtonPressed = async (item) => {
        if (this.state.songPlayingSn == item.sn && await isSongPlaying() == true) {
            pauseThisSong(this);
            if (this._isMounted) {
                this.setState({
                    isSongPlaying: false,
                });
            }
        } else if (this.state.songPlayingSn == item.sn) {
            playThisPausedSong();
            if (this._isMounted) {
                this.setState({
                    isSongPlaying: true,
                });
            }
        } else {
            playThisSongOffline(item.sn, item.title, item.artist, this);
            if (this._isMounted) {
                this.setState({
                    isSongPlaying: true,
                });
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
                <View style={styles.mediaPlayerContainer}>
                    <Carousel
                        layout={'default'}
                        ref={(c) => { this._carousel = c; }}
                        data={this.state.musicsList}
                        renderItem={({ item, index }) => {
                            return (
                                <View style={Platform.OS == 'ios' ? styles.carouselContaineriOS : styles.carouselContainerAndroid}>
                                    <View style={styles.songThumbnailContainer}>
                                        <Image
                                            containerStyle={styles.songThumbnailImgContainer}
                                            style={styles.songThumbnailImg}
                                            source={{ uri: item.thumbnailUrl }}
                                            elevation={1}
                                        />
                                    </View>

                                    <View style={styles.songTitleContainer}>
                                        <Text style={styles.songTitleText} numberOfLines={1}>{item.title}</Text>
                                    </View>

                                    <View style={styles.songArtistContainer}>
                                        <Text style={styles.songArtistText} numberOfLines={1}>{item.artist}</Text>
                                    </View>

                                    <View style={styles.mediaPlayerActionContainer}>
                                        <Icon
                                            reverse
                                            name='caret-left'
                                            type='font-awesome'
                                            color='#27a4de'
                                            onPress={() => { this.moveToPrev(); }} />
                                        <Icon
                                            name={this.state.songPlayingSn == item.sn && this.state.isSongPlaying == true ? 'pause-circle' : 'play-circle'}
                                            type='font-awesome'
                                            color='#27a4de'
                                            size={80}
                                            onPress={() => {
                                                this.playButtonPressed(item);
                                            }} />
                                        <Icon
                                            reverse
                                            name='caret-right'
                                            type='font-awesome'
                                            color='#27a4de'
                                            onPress={() => { this.moveToNext(); }} />

                                    </View>
                                </View>
                            );
                        }}
                        sliderWidth={carouselWidth}
                        itemWidth={carouselItemWidth}
                        loop={true}
                    />
                </View>
            </SafeAreaView>
        );
    }
}

export default MediaPlayerScreen;