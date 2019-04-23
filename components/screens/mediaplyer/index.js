import React, { Component } from 'react';
import { Text, View, StatusBar, Alert, FlatList } from 'react-native';
import { Image, Icon } from 'react-native-elements';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-navigation';
import Carousel from 'react-native-snap-carousel';
import UserSongs from '../../global/database';
import styles, { carouselItemWidth, carouselWidth } from './style';
import { playThisSongOffline, pauseThisSong, isSongPlaying , playThisPausedSong} from '../../global/utils';


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

        this.initiate();
    }

    // component related functions
    _isMounted = false;
    componentDidMount = () => {
        this._isMounted = true;
    }

    componentDidUpdate() {
        if (this._isMounted == true && this.state.firstMove == false && this.state.originalMusicsList.length > 0) {
            this.moveToCurrentPlayingItem();
            this.setState({
                firstMove: true,
            });
        }
    }

    // initial function
    initiate = async () => {
        // load songs list
        await this.getSongsList();

        // if requested from main screen (Music/Online)
        try {
            let currentItem = this.props.navigation.state.params.item;
            this.playButtonPressed(currentItem);
            await this.setState({
                songPlayingSn:currentItem.sn,
                firstMove:false,
            });
            this.moveToCurrentPlayingItem();
        } catch (error){
            console.log(error);
        }
    }

    getSongsList = async () => {
        await this.userSongsObj.getSongsList(this);
    }

    indexFromSn = (sn) => {
        return this.state.musicsList.findIndex(song => song.sn == sn)
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
        }, 1000);
    }

    moveToCurrentPlayingItem = () => {
        let currentPlayingIndex = this.indexFromSn(this.state.songPlayingSn);
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
            this.setState({
                isSongPlaying:false,
            });
        } else if (this.state.songPlayingSn == item.sn) {
            playThisPausedSong();
            this.setState({
                isSongPlaying:true,
            });
        } else {
            playThisSongOffline(item.sn, item.title, item.artist, this);
            this.setState({
                isSongPlaying:true,
            });
        }
    }

    render() {
        return (
            <SafeAreaView>
                <View style={styles.mediaPlayerTopNavContainer}>
                    <TouchableOpacity style={styles.backButtonContainer} onPress={() => {this.navigateToDashboard();}}>
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
                                <View style={styles.carouselContainer}>
                                    <View style={styles.songThumbnailContainer}>
                                        <Image
                                            containerStyle={styles.songThumbnailImgContainer}
                                            style={styles.songThumbnailImg}
                                            source={{ uri: item.thumbnailUrl }}
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
                                            name={this.state.songPlayingSn == item.sn && this.state.isSongPlaying == true? 'pause-circle' : 'play-circle'}
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
                    />
                </View>
            </SafeAreaView>
        );
    }
}

export default MediaPlayerScreen;