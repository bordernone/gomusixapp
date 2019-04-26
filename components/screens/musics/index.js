import React, { Component } from 'react';
import { View, StatusBar, Alert, FlatList } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { ListItem, SearchBar, Header, Icon } from 'react-native-elements';
import RNFS from 'react-native-fs';
import UserSongs from '../../global/database';
import styles from './style';
import { playThisSongOffline, deleteThisSong, isMusicsListChanged } from '../../global/utils';

class MusicsScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            searchInput: null,
            originalMusicsList: [],
            musicsList: [],
            rowIndex: null,
            songPlayingSn: null,
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

        // creating database object
        this.userSongsObj = new UserSongs();

        this.initiate();

    }

    // Component functions
    componentDidMount() {

        // event listener if this screen is focused
        this.didFocusListener = this.props.navigation.addListener(
            'didFocus',
            () => {
                this.updateMusicsList();
            },
        );
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
        playThisSongOffline(item.sn, item.title, item.artist);
        this.props.navigation.navigate('MediaPlayer');
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

    renderItem = ({ item, index }) => (
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
            Component={TouchableOpacity}
            friction={50}
            tension={100}
            activeScale={0.95}
            bottomDivider={true}
        />
    )

    keyExtractor = (item, index) => index.toString()

    render() {
        const { searchInput } = this.state;
        return (
            <View style={{ backgroundColor: '#efefef', minHeight: '100%' }}>
                <Header
                    //leftComponent={{ icon: 'menu', color: '#fff' }}
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
                    backgroundColor={'white'}
                    containerStyle={{ borderBottomWidth: 2, borderBottomColor: '#27a4de' }}
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
                        renderItem={(item, index) => this.renderItem(item, index)}
                        extraData={this.state.rowIndex}
                    />
                </ScrollView>
            </View>
        );
    }
}

export default MusicsScreen;