import React, { Component } from 'react';
import { Text, View, Image, StatusBar, Alert, FlatList } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { ListItem, Divider } from 'react-native-elements';
import TouchableScale from 'react-native-touchable-scale';
import RNFS from 'react-native-fs';
import UserSongs from '../../global/database';
import styles from './style';
import { playThisSongOffline } from '../../global/utils';

class MusicsScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            musicsList: [],
        }

        this.navigateToOnline = this.navigateToOnline.bind(this);
        this.handleSongTap = this.handleSongTap.bind(this);
        this.getSongsList = this.getSongsList.bind(this);
        this.initiate = this.initiate.bind(this);
        this.getLocalThumbnailUrl = this.getLocalThumbnailUrl.bind(this);

        // creating database object
        this.userSongsObj = new UserSongs();

        this.initiate();


    }

    navigateToOnline() {
        this.props.navigation.navigate('Online')
    }

    initiate = () => {
        // create thumbnail folder if doesn't exist
        RNFS.mkdir(RNFS.DocumentDirectoryPath + '/thumbnails');

        this.getSongsList();
    }

    // other functions
    getSongsList = async () => {
        let songsList = await this.userSongsObj.getSongsList(this);
        console.log(songsList);
    }

    getLocalThumbnailUrl = (sn) => {
        let fileName = sn + '.jpeg';
        return RNFS.DocumentDirectoryPath + '/thumbnails/' + fileName;
    }

    // user interaction functions
    handleSongTap = (item) => {
        playThisSongOffline(item.sn);
    }

    renderItem = ({ item }) => (
        <ListItem
            title={item.title}
            titleProps={{ numberOfLines: 1 }}
            titleStyle={styles.songTitleStyle}
            subtitle={item.artist}
            subtitleProps={{ numberOfLines: 1 }}
            subtitleStyle={styles.songArtistStyle}
            leftAvatar={{ source: { uri: item.thumbnailUrl } }}
            onPress={() => this.handleSongTap(item)}
            containerStyle={styles.songListContainer}
            Component={TouchableScale}
            friction={50}
            tension={100}
            activeScale={0.95}
        />
    )

    keyExtractor = (item, index) => index.toString()

    render() {
        return (
            <ScrollView style={{ backgroundColor: '#efefef' }}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" />
                <FlatList
                    keyExtractor={this.keyExtractor}
                    data={this.state.musicsList}
                    renderItem={this.renderItem}
                />
                <Text>{this.state.name}</Text>
            </ScrollView>
        );
    }
}

export default MusicsScreen;