import { Alert } from 'react-native';
import RNFS from 'react-native-fs';
import TrackPlayer from 'react-native-track-player';
import UserSongs from './database';
import AsyncStorage from '@react-native-community/async-storage';
import { imgData } from './imgdata';

// login credential functions
export async function getApiCredentials(_this) {
    if (_this._isMounted) {
        try {
            let username = await AsyncStorage.getItem('@GoMusix:username');
            let apiToken = await AsyncStorage.getItem('@GoMusix:apiToken');
            let apiRefreshToken = await AsyncStorage.getItem('@GoMusix:apiRefreshToken');

            _this.setState({
                username: username,
                apiToken: apiToken,
                apiRefreshToken: apiRefreshToken,
                tokenObtained: true,
            });
        } catch (error) {
            console.log('Cannot get api credentails from AsyncStorage');
            console.log(error);
        }
    }
}

// refresh token
export async function refreshToken(_this) {
    if (_this.isDeviceOnline == true && _this.state.tokenObtained == true) {
        let url = global.DOMAIN + 'api/refresh/';
        let formData = new FormData();
        formData.append('username', getUsername(_this));
        formData.append('refreshtoken', getApiRefreshToken(_this));
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
                        _this.props.navigation.navigate('OnlineLoggedOut')
                        Alert.alert('Please login again');
                    } else {
                        console.log(error);
                    }
                } else {
                    if (res.hasOwnProperty('apiToken')) {
                        _this.setState({
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

// get username
export async function getUsername(_this) {
    if (_this.state.tokenObtained == true) {
        return _this.state.username;
    } else {
        await getApiCredentials(_this);
        if (_this.state.tokenObtained == false) {
            console.log('Error: api.js getUsername() Could not get api credentails');
        } else {
            return _this.state.username;
        }
    }
}

//get api token
export async function getApiToken(_this) {
    if (_this.state.tokenObtained == true) {
        return _this.state.apiToken;
    } else {
        await getApiCredentials(_this);
        if (_this.state.tokenObtained == false) {
            console.warn('Could not get api credentails');
        } else {
            return _this.state.apiToken;
        }
    }
}

//get api refresh token
export async function getApiRefreshToken(_this) {
    if (_this.state.tokenObtained == true) {
        return _this.state.apiRefreshToken;
    } else {
        await getApiCredentials(_this);
        if (_this.state.tokenObtained == false) {
            console.warn('Could not get api credentails');
        } else {
            return _this.state.apiRefreshToken;
        }
    }
}


// get music files
export async function getMusicFiles(_this) {

    if (_this.state.tokenObtained == false) {
        await getApiCredentials(_this);
    }

    if (_this.isDeviceOnline == true && _this.state.tokenObtained == true) {
        // sending request
        var formData = new FormData();
        let username = await getUsername(_this);
        let apiToken = await getApiToken(_this);
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
                        refreshToken(_this);
                    } else {
                        console.log(error);
                    }
                } else {
                    var musicsList = res;

                    if (_this._isMounted) {
                        _this.setState({
                            myMusicList: musicsList,
                            originalMusicsList: musicsList,
                            isReady: true,
                        });
                    }
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }
}

//download this song
export async function downloadThisSong(_this, item) {
    if (_this.state.tokenObtained == true && _this._isMounted) {
        let username = await getUsername(_this);
        let apiToken = await getApiToken(_this);
        let fileName = item.sn + '.' + item.extension;

        // Downloading the song
        changeStatusDownload(_this, item.sn);
        RNFS.downloadFile({
            fromUrl: global.DOMAIN + 'api/songs/play/?sn=' + item.sn + '&username=' + username + '&token=' + apiToken,
            toFile: `${RNFS.DocumentDirectoryPath}/${fileName}`,
        }).promise.then((r) => {
            // Download complete
            if (r.statusCode == 200) {
                console.log(r.statusCode);
                _this.userSongsObj.newSongEntry(item.sn, item.artist, item.title);
                changeStatusIdle(_this, item.sn);
            } else {
                console.warn(r);
            }
        });

        // downloading the thumbnail
        downloadThisSongThumbnail(_this, item.sn);
        console.log(`${RNFS.DocumentDirectoryPath}/${fileName}`);

        // setting musics list changed flag true
        setMusicsListChangedFlagTrue();
    }
}

export async function changeStatusDownload(_this, sn) {
    let indexOfThisSong = _this.indexFromSn(sn);
    if (_this._isMounted) {
        let newList = _this.state.myMusicList;
        newList[indexOfThisSong].isDownloading = true;
        _this.setState({
            myMusicList: newList,
        })
    }
}

export async function changeStatusIdle(_this, sn) {
    let indexOfThisSong = _this.indexFromSn(sn);
    if (_this._isMounted) {
        let newList = _this.state.myMusicList;
        newList[indexOfThisSong].isDownloading = false;
        _this.setState({
            myMusicList: newList,
        })
    }
}

export async function downloadThisSongThumbnail(_this, sn) {
    if (_this.state.tokenObtained == true) {
        let username = await getUsername(_this);
        let apiToken = await getApiToken(_this);
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

export async function setMusicsListChangedFlagTrue() {
    await AsyncStorage.setItem('@GoMusix:musicsListChanged', 'true');
}

export async function isMusicsListChanged() {
    let flag = await AsyncStorage.getItem('@GoMusix:musicsListChanged');
    if (flag == 'true') {
        return true;
    } else {
        return false;
    }
}

export async function playThisSongOffline(sn, title, artist, _this = null) {
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
    console.log(filePath);
    if (fileExist) {
        // reset the queue
        TrackPlayer.reset();

        // Adds a track to the queue
        await TrackPlayer.add({
            id: sn.toString(),
            url: `file://${filePath}`,
            title: title.toString(),
            artist: artist.toString(),
            artwork: await getLocalThumbnailUrl(sn),
        });

        // Starts playing it
        TrackPlayer.play();
        TrackPlayer.setVolume(1);

        // update state
        if (_this != null) {
            _this.setState({
                songPlayingSn: sn,
            })
        }
    } else {
        Alert.alert('Please download it first');
    }
}

export async function playThisPausedSong(_this = null) {
    TrackPlayer.play();
}

export async function pauseThisSong(_this = null) {
    TrackPlayer.pause();
}

export async function isSongPlaying() {
    let playerState = await TrackPlayer.getState();
    if (playerState == TrackPlayer.STATE_PLAYING) {
        return true;
    } else {
        return false;
    }
}

export async function playingSongSn() {
    return await TrackPlayer.getCurrentTrack();
}

export async function deleteThisSong(sn) {
    // instantiate a database object
    var userSongsObj = new UserSongs();

    // delete the song
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
        RNFS.unlink(filePath)
            .then(() => {
                console.log('Song removed from file system');
            })
            // `unlink` will throw an error, if the item to unlink does not exist
            .catch((err) => {
                console.log('Could not delete song');
                console.log(err.message);
            });
    }

    // delete thumbnail
    filePath = RNFS.DocumentDirectoryPath + '/thumbnails/' + sn + '.jpeg';
    if (await RNFS.exists(filePath)) {
        fileExist = true;
    } else {
        // file doesn't exist
        fileExist = false;
    }
    if (fileExist) {
        RNFS.unlink(filePath)
            .then(() => {
                console.log('thumbnail removed from file system');
            })
            // `unlink` will throw an error, if the item to unlink does not exist
            .catch((err) => {
                console.log('Could not delete thumbnail');
                console.log(err.message);
            });
    }

    // remove from database
    userSongsObj.deleteSongEntry(sn);
}

export async function thumbnailExist(sn) {
    let filePath = RNFS.DocumentDirectoryPath + '/thumbnails/' + sn + '.jpeg';
    let fileExist = false;
    if (await RNFS.exists(filePath)) {
        fileExist = true;
    }
    return fileExist;
}

export async function getLocalThumbnailUrl(sn) {
    if (await thumbnailExist(sn)) {
        return 'file://' + RNFS.DocumentDirectoryPath + '/thumbnails/' + sn + '.jpeg';
    } else {
        let imgBase64 = imgData();
        return imgBase64;
    }
}