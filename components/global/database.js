import { openDatabase } from 'react-native-sqlite-storage';

var db = openDatabase({ name: 'gomusix.sqlite', createFromLocation: "~www/gomusix.sqlite" }, function () { }, function (err) { console.log(err) });

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
}

export default UserSongs;