import { Platform } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage';
import { thumbnailExist, getLocalThumbnailUrl } from './utils';

if (Platform.OS == 'ios') {
    var db = openDatabase({ name: 'gomusix.sqlite', createFromLocation: "~www/gomusix.sqlite" }, function () { console.log('database opened') }, function (err) { console.log(err) });
} else {
    var db = openDatabase({ name: 'gomusix.sqlite', createFromLocation: 1 });
}

class UserSongs {
    constructor() {
        this.addNewEntry = this.addNewEntry.bind(this);
        this.newSongEntry = this.newSongEntry.bind(this);
        this.updateEntry = this.updateEntry.bind(this);
    }

    newSongEntry = (SN, Artist, Name) => {
        var _this = this;
        db.transaction(function (txn) {
            txn.executeSql(
                'SELECT * FROM songsdetail WHERE SN=?',
                [SN],
                function (tx, res) {
                    let rows = res.rows.length;
                    if (rows > 0) {
                        // this entry exists
                        _this.updateEntry(SN, Artist, Name);
                    } else {
                        // this entry doesn't exists
                        _this.addNewEntry(SN, Artist, Name);
                    }
                }
            );
        });
    }

    addNewEntry = (SN, Artist, Name) => {
        var _this = this;
        db.transaction(function (txn) {
            txn.executeSql(
                'INSERT INTO songsdetail (SN, Artist, Name) VALUES (?,?,?)',//Query to execute as prepared statement
                [SN, Artist, Name],//Argument to pass for the prepared statement
                function (tx, res) {
                    let rowsAffected = res.rowsAffected;
                    if (rowsAffected > 0) {
                        console.log('Added new entry');
                    } else {
                        console.log('New entry failed');
                        console.log(res);
                        console.log(tx);
                    }
                }
            );
        });
    }

    updateEntry = (SN, Artist, Name) => {
        var _this = this;
        db.transaction(function (txn) {
            txn.executeSql(
                'UPDATE songsdetail SET Artist=?, Name=? WHERE SN=?',//Query to execute as prepared statement
                [Artist, Name, SN],//Argument to pass for the prepared statement
                function (tx, res) {
                    let rowsAffected = res.rowsAffected;
                    if (rowsAffected > 0) {
                        console.log('Entry updated');
                    } else {
                        console.log('Failed to update entry');
                        console.log(res);
                        console.log(tx);
                    }
                }
            );
        });
    }

    deleteSongEntry = (sn) => {
        var _this = this;
        db.transaction(function (txn){
            txn.executeSql(
                'DELETE FROM songsdetail WHERE SN=?',
                [sn],
                function (tx, res){
                    let rowsAffected  =res.rowsAffected;
                    if (rowsAffected > 0){
                        console.log('Song removed from database');
                    } else {
                        console.warn('Failed to remove from database');
                        console.log(res);
                        console.log(tx);
                    }
                }
            );
        });
    }

    getSongsList = async (_this) => {
        db.transaction(async function (txn) {
            txn.executeSql(
                'SELECT * FROM songsdetail', [],
                async function (tx, response) {
                    let rows = response.rows.length;
                    if (rows > 0) {
                        var i = 0;
                        var thisRow;
                        var musicsList = [];
                        var thumbnail = '';
                        for (i = 0; i < rows; i++) {
                            thisRow = response.rows.item(i);
                            thumbnail = await getLocalThumbnailUrl(thisRow.SN);
                            musicsList.push({
                                sn: thisRow.SN,
                                title: thisRow.Name,
                                artist: thisRow.Artist,
                                thumbnailUrl: thumbnail,
                            });
                        }
                        await _this.setState({
                            musicsList: musicsList,
                            originalMusicsList: musicsList,
                        });
                        console.log('Songs List Loaded');
                        console.log(musicsList);
                    } else {
                        console.log('Cannot get songs list');
                        console.log(response);
                        console.log(tx);
                    }
                }
            );
        });
    }
}

export default UserSongs;