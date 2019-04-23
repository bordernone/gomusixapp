import { Alert } from 'react-native';
import RNFS from 'react-native-fs';
import TrackPlayer from 'react-native-track-player';
import UserSongs from './database';

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
            id: sn,
            url: `file://${filePath}`,
            title: title,
            artist: artist,
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

export async function playThisPausedSong(_this = null){
    TrackPlayer.play();
}

export async function pauseThisSong(_this = null) {
    TrackPlayer.pause();
}

export async function isSongPlaying(){
    let playerState = await TrackPlayer.getState();
    if (playerState == 'playing'){
        return true;
    } else {
        return false;
    }
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
        let imgBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAewElEQVR4nO3de5RdVZ0n8O/e53HfVZXKq1J5kAdvUTDSNPgc0Wl8jTaICZA2isCEUWx1bNuxXb1m0b1mZvVabfdy1jgiBEXpJAREWdNrXD09tiOIigxiZBABI0aSqkq9b1Xde9577/nj3lukkkpIVd1br/P9rFUk69a952wq9fues/fZ+xyBReLuh+/vtpTcLKXcqpXeDIP1RohuKZA3xix084hmTggYAMLgOIBeYYkeIeThRKuXM37y0u7du70Fb+JC7fj+h+/vDmN5ubTk240xlwuYrZbtdNuOU2uUEPU/F6qFRM1hTOM/tT/8wA8sKQ5rZV6UtvV/lFY/2bqy69DVV1+t57tt81peex/Z34VIXi2FuVYI8UbHdbqltABjkCQJkiQBj/a0nAkhIKWE7TiQUgIAfM/TAA7ZUv6TUeq7H92566l5a8987GTvQ/u3W1LeLIT4Y8dxN0gpEEcxC54IgJQSrutCWhZ839NGm58IS36jKsJHPnndR0Zaue+WBsDeg/uutB37U8aY63O5nB1FMeIoBsCiJ5qOlBKZTAZCCvh+cNhAf9WT8X2tCoKWBMDeB751se1mvghjdmRzOTvwAyilWrEromUrk8nAsq1aECjzpZKw9u7YsSNp5j6aGgB7H9lblHHxc5Zt/Wkmk+kIfJ+FTzRHmWwGUloIg+DxxMRfvO1DH36sWdtuWgDce3DfWy3L+lIun788DEPEcdysTROlnhAC2VwOURxHOon/zusf+es77rhjzpcR5xwABw9eKyu4/i+cTOYLtmXlfd+f6yaJ6DRs20Yml0Xg+U/EQfKJ23btenou25tTAHz53ntXlTqKX83ncteHQYAkaWr3hIhOI18oIPT9sob5dx+7/sYHZrudWQfAVw5888K8m9mXz+e3VytVXs4jmmeu68IYgyiOv3jrjpv+82y2MasAuGvfviszWftANpvd7FWrs9kEETWBZVvIZDKoVv3/moyMffb222+f0Wn4jANg74H7r7Yc52E343YEfjDTjxNRk0kpkS/kMTE2sf9l6Xzkr2ZwqVDOZEd37f/WFZbrPOy4LH6ixUJrjWqlilJ7200bTXzPTD571gFwz4EDF2YymYOu63aEAYufaDExxsCrVlEsFj5698F9f3O2nzurALj34L2rLBsHstns5sBj8RMtRlprhEGIQi7353sfuP+Os/nMqwbAwYMHpUH2a4Vi4TKvWuXyXKJFTCkFpRRs1/3S1x745tWv9v5XDYBxHf1FsVS6rlrhaD/RUhDHMRzHcV07842vHziw4UzvPWMA3PPAP7zRcd2/DIOA1/mJlpDAD5AvFDZpqb98pvedNgD+24MP5oUUX3EzGTfhvH6iJadarSKXz19394F/+Njp3nPaAMjq6POlYuky3/MAwY4/0VJjtIbRGrZj/af7Dh7snu490wbA1/btO1/a9r8Pw7C1LSSilgrDEIVCsSs20X+c7vvTBoCw9J35fL7IJb1ES5/veXAc96Nff+D+y0/+3ikBcNf+b13hOM71AZf1Ei0LSilkczlXC/mFk793SgDYlvW5bDZn804+RMuH7/uwbOv9ew9+88oTX58SAPc8uG+7ZVl/zKm+RMuLVgrZXN4G7M+c+PqUAJBG3JLL53n0J1qGoiCAZcn37D148PzGa5MBcM/+e9YYmOujKFqY1hFRSyVJgly+UATUrsZrkwEgZP6d+Xx+DSf9EC1fSiUAzPsffPBBGzgxAIS4VgjBKb9Ey1gURrBt+3VVrbcD9QC46+H7uwzMW2Pe1JNoWdNaI5PNSiX0vwHqAWDH8opsLsvTf6IU0FpDAFcDjS6AwNsty+LpP1EKJHEMIXHxfd85sLUxBnCF0Sx+ojRQSiGTzXao2LxOfvXgfd0AtvKhHkTpYIyBEBIGeINtW9nNjpRdDACi9Kgv8L9MSq222q6zsK0honmltQaE2SCh9GZhwAFAohRRWkEYrJKw5Hre8YcoXYzWgEGnhJHdLH+idFFKw3adrAR0kff6J0ofx3GkBKAXuiFENP+MMTN7OCgRLS8MAKIUYwAQpRgDgCjFGABEKcYAIEoxBgBRijEAiFKMAUCUYgwAohRjABClGAOAKMUYAEQpxgAgSjEGAFGKMQCIUowBQJRiDACiFGMAEKUYA4AoxRgARCnGACBKMQYAUYoxAIhSjAFAlGIMAKIUYwAQpRgDgCjF7IVuANEZCUAKCQhACAEBASHE5OtxHENrPt92thgANO+EEBBSQgpR/7sAIAAYwNTeYxpvNgZRFCFJEsRRDKUUojCC0RpBEGD12jXI5XMMgVliAFBTCSEgpYSQon7kfqWwG0WdxDECz0cURYijCFEYIQpD+J4Pr+ohDEMEno8wDBH6IaI4QhKfEABRCKMNKhMVfOgjN2DbBechCsOF/N9eshgANGONIpeWhBASJ1Z3kiTwPA+BHyD0A/ieh2qlispEFX61imqlijAIENaLPopiRGGIJEkgIGCmnAKY+v5O6ALUvwDAtm1IyWGsuWAA0BlJKWFZVv00vSaJE1QmKrXinqhirFzG+Ng4JsYm4FWrCPyg/uUjiWMAJ9azAYSon/7XzhSEEHBdd8ZtawQBzR4DgCYJIWBZFqRVP6oawPd9jAwNY3xsHCODwxgZGsFYuQyv6sGr1IrdTJ4BNIq73gWQEs4sCpvmDwMgxU4+usdxgvLoKMojZQweH8BA/wDGR8sYL4/D8zwY88qpvrRkvcCdBfw/oLliAKSIkAK2bU+eOod+iJGhEQwNDOL4sV4MDQ5hbLSMibGJ+qi6gRASlm3BsZ3aQD0tKwyAZUwIAcu26gNlAlEYYqC3HwP9A+g92oOhgUGMj47Bq1ZrR/d6F8CyLdiCvxppwH/lZaZRwICAShKMDo1isH8APb8/isH+AQwPDsP3fEw5urOfnloMgCXulYE7C0Dt2vjwwDB6Xz6KnqPHMDw4gsr4BIzR9TMCG26GBU81DIAlqHFqb0kLSimUR0ZxvPc4Xn7pCI73Hkd5eBRJEgMQ9SM8B+poegyAJcSyLNi2DaUURodGcOz3R/G7wy9hoPc4JsYr0EbDkrJ+lM8sdHNpCWAALAVCwHUcVCYqOPLb3+Hw87/B8Z5eVMYrAAws2+ZRnmaFAbDINaa+/uLJn+PpJ57C6PAoGkXPvjzNFQNgkRNCII5j/PLnhzDUP4RcIbfQTaJlhCsplgjHcWA7zGtqLgYAUYoxAIhSjAFAlGIMAKIUYwAQpRgDgCjFGABEKcYAIEoxBgBRijEAiFKMAUCUYgwAohRjABClGJeX0cKoP19AGw1jDLSu/Tn5pQ1s3uik5RgA1BJa6ylfxhgIiMlnCzSeA5jNZZHJZJDNZuE4DlzXheM6yGZzKI+Ooq+3j8//ayEGAM2KMQZKqakFfsKz+nK5HEqlEnL5HHL5PIrFAto7OlAsFVEqlVBsK6JULCKTbQRABo7r1gLAcdDe0Y4f/O8fYO9/vweZLO9v2CoMADojrTWUUlBKTSly27ZRaiuhVCohX8hjRecKdHZ2YkXnCqxY2Vkr/lwO+UIe+XwBmWzt9mVi8hSg9jdtDMzJp//GIKw/MZhaiwFAkyaLPVGTr2WyGaxavQrt7e3oXNmJNWvXYPXaNVi5aiWKxSJKpSIKxSIcp95XF7UibxR24wwhDMPJfv/ZMGYGb6ZZYwCkmFIKSZxAGw0BgWwui5WrVmL1mtVYv2ED1nV3Ye26LrS3t6FjxQpk6rcaF6LWf9dKQ2kNrRSCIJhVG0Rtg6f83ZKSj/+eBwyAFJlS8EKgra0Nq89Zje4N3dh27jasW989eRpv2VZtoK7e11czLPJGMZ9Y1NPR9QBpjCNoY2CMRqwShGHIEGgxBsAyZoxBHMfQSsPAoFgs4pwt52DTpk3Yet42bNi4AWvWrkEun5ss9iRJkCQJ4jh+1e0LIaaM7J9Iaw2VJLU/612LWCWTYaJUgkQpaG2gTX0gsf53Ywxsx8bw6AgDoMUYAMuMUgpxHMNoA8d10LWuC+dsPgfnX3QBztl8DrrWdSGfzwOoFWkcxwj80x/ZJ4/kJxWiMQZJvZCVqh2xkziuhUcS176ndb2boOqPGz/9TsQJKSKEgGQXYF4wAJaBxlHbaINiqYgt27bgvPPPwwUXX4QNG9ejo6MDUsrJgvd9f9rtTFfsWutaYSuFOIkRxTGiKEKcxJNH86R+heCU7TX69vWCpsWHAbDEaa1RLBaxYdNGXPLa1+C8C8/H+g3rkc1mYWCQxAmiKDptgU5X7FEcIQhDRHGMMAqRKIWkfjp/0gYgptkOLR0MgCUsSRK0tbfh1ttvxYUXXwRpSWh1+qP8yYWqlKoVexTB932E9SN7kiRTAqPxOR7Flx8GwBJmjIHruljbtRYA4HunFr0UYnIUXimFKIrghyH8wJ88ymv9ynX/RrHziJ4ODIAlbnKkv356PlnAqM2yC+MYQRCgGngIggBhdGrB88ieXgyAZaBRxFJKKKUQRhG8wEe1WkUQTZ1SKyQLnl7BAFjiBAQSpVCpVjA6NgbP9xBG0ZQzAhY8nQ4DYAmTQiBRCXr6+pCrjCGK4tqoPI/ydJb4W7LEGWMQxREAAaveDRDTTc0jmgYDYBngiD3NFgOAKMUYAEQpxgAgSjEGAFGKMQCIUowBQJRiDACiFGMAEKUYA4AoxRgARCnGACBKMQYAUYoxAIhSjAFAlGIMAKIUYwAQpRgDgCjFGABEKcYAIEoxBgBRijEAiFKMAUCUYgwAohTjk4Go5aSUsGwLQkjghMeOT6o/1kArDaXUlEeTU2sxAKglpJSwbRtCCHjVKgb7yxgvj2O8PIYoiiYfZiKEQKFURHtHO9o62lFqL8G1XViOzQeezAMGADWVlBKO6yAMQrz0m9/ipRd/i75jPRgbHUPgBzjdU8ssy0KprYSOzhXYuGUTLnjNRRBSnPb91BwMAGoa13URJzF+dehZPPPzQ+g71oskTiAtCcuy4Gbc037WGIOJsXGUR8r43W9ewqEnn0a+UIBt81e0lfjTpTkTUsB1XRw7chRPPPoTHPnt72CMgeM6yGQzZ7cNIWDZNqz6b6RX9VCtVBkALcafLs2JtCSElHjqx0/ip4/+GL7nw824c+6/W5bVpBbSmTAAaNakJWFJC499/4d48kdPwHbssz7i0+LAAKBZEUJASokf/cujePLxn8FxHUjJaSVLDf/FaFbcjItnnvolnvzRT+E4Not/ieK/Gs2Y7TgY6BvATx99HFJaLP4ljP9yNGNCCPziyacwMTYB22EvciljANCMOI6Dgb5+/Oa5F+G6p7+uT0sD43uBCCnqp8+iNkceJ89/F5OvKaXmu3mnJaTEkcMvwat6HPFfBhgA80QIUZsbL2vXx6MwwvhYGb7vIwojeNUqkjiBEALGAJmsi1whj0KxiGwuu2j62UopHPv9Uc7TXyYYAC3WmBufxDEGBwbRd7QHfT19GB0ahlf14Hs+wjCsr5J7pagMDGzLQr5YQLFUxHh5fMH725ZloTpRwfjY+KIJJJobBkCLCCHgZlz4VR8v/Op5vPir59F7rAde1YNAbZGLJS0IKeDYzrSLXowxqFaqk4NtC33UFVIgDEJEYTh5JkNLGwOgBWzbhjEGvzr0LJ5+4in09/bBGAPbdpDJnH2/WQgBy7IWzbRYAYE4jhHH8YKHEQAYo6G1XuhmLGkMgCZzMy4qYxP40fcfxXPPPAuD2sj5YiiYuTIwsB0btuMgjuIFbUscx1jR2YnVa1ZDJcmCtmUpYwA0keu6GOwfxP965HvoPdqDTDazLAq/wWiDXD6HbDYLb6IKLOCJSRzF+IMrr8D6DesxODTEMYlZ4k+tSRzHwVh5DN97+H+g92gPsrnssip+oHYFoK2tDZ2dKxb00mQURVi7rgvvvOYdSJLFc4l0KWIANIGUEkmS4F/+5z+jv7cf2Vx2oZvUEsYYZDIZXPSaixas722MgdYa73n/e7G2qwtxHC1IO5YLBkATOK6DZ546hN++cHjZFj9QKz5jDC59/WVoa29DsgB9b6/q4co3XYk3v+1NCIJg3ve/3DAA5siybZRHRvH0kz9fNKP1LSMEwjDEho0bcPkfXl6bvzCPPM/DeReehx037oSUElEUIq5PnqLZYQDMkW1beOHZX6M8PLrgE3VaTQBQiUKSJLjmPe/C6jVrEEXzcwrueR42bFyPW2+/FSs6VyCJE4xNTCCMQgbAHDAA5kBKicAPcPj5w5ApmBgjhECiElS9KrrXd+P6G66HgGhpV8Do2mSobeduwyc+fQfWdXcjDENEcYzh8iiLf46W9yGrxWzbRl9PHwb7B2A7zkI3Z14YY1D1fbSFIa5601UYK4/hwf0HazcBbfLPIAojaKNx1Vuuws6bbkDnyk4EQQApJYZGhhHFESy5zLtdLcYAmAsBDBzvRxxFcGcww29JE0ClWkUcRzDG4F3vfRdc18W3H3gInuchm53b5U9jDOI4RhInWLd+Hd79vnfjTW97M6SQCIIAlmWhPDaG8vgYi78JGABzYAww3D+IND29QgqJIAwwXqmgs2MFwjDEO/7oHeje0I3vPvQdvPDrFwDU5kVYlnVWYWCMQRInSFRtQG9d9zpccdUf4i3/6i1YvWY1Aj9AohNY0oLne+gfGmj1/2ZqMADmxKAyUcGpa/mXNyEEhkdHUCwUYFs2fN/HhRdfiE/92afx8yefwpM/+7/oPdaD8kh5ynwBc8LPqbEgCgawHRtrutZg46aNeO1lr8Mlr70Enas6EUURvKoHoD7eEgXoOd6HOEk4869JGABztNCLURrX5ueTEAJhFGFgaAjda7sghEDgB3AcB299+9tw5ZuvwuDAIAaOD+B433GMDA2jUqlgYnxichVksa2IUqmENWvXYM3ateha14XOlZ2QUiKO48nCB2rv9wIfPcf7EEYRi7+JGABztNC/jI3Hbs37fqWs9cMtC12r1wCoTRX2fR9CCKztWov169fDoB5Q0z0UWLzy7L8kThBF0ZQwk0ICAihPjKF/aBBxHC/4z3u5YQDMSe3Jtgs1BpAkCp2dnejoXDHvk3KAV7oCxhisXbUKUlrQWtcG8qIYMeIp7z2RAaZ/VDgAKUTtLCOOMTQyjPL4WO11Fn/T8Sc6B1IIdK/vntK3nU9aa1xw4QVwXXfeuwFAraiFFBgpj+Llnh54vg8pJaSUpxZ8vasy2WU5qb2NB41IKRHGMQaGh3Dk2MsYGSsD9UCg5uMZwBxoUyvAx77/Q8RRDGnNX57W1sOvwPYr3oB4AVfmCdRCoOp7eLn3GErFEtpLJWRcF45lA2d5FSCKYwRhgEq1iopXnTzdt3jUbykGwBxEUYwtWzZj27nb8Mtf/BK5fG7e9h2GIa559zXYuGkTXjj84rzt93SklNBaY3SsjLHxMbiOA9d14Tou3PolwVeu2xskSkEphSiOEUYRojhCHNe6DI07IVHrMQDmwGgNx3Xw1qvfhmf/37PQWs9LP9X3fWw7dxuued+7EMcx9AKc/k9HCAGrfsRvFPZMPss+/vzjT3yOqtUqtl++HZdfcTl8z3v1D8xREAToWNGBD39sNzpWdMD3PSTJ4lsRd2Kf/my+Flv704IBMEd+EEBIget2fhAbNm6E7/ut25fvo72jHbfsuRXnnn8uwiBE1fcXZACQlgcGwBz5gY/A99HV1YV/+4k9WLt2LbwmnwkopVCpVLBl6xZ86s8+jUtffykCP0CcxJioTPDoSbPGAJgDKSX8IIAXBAjDEFvP3YqPf+rj2LJ1C6qVKtQc71enlIJX9WDZFt79vnfj03/+GWzZtgWe50FKibHxcQQh18PT7Fkf+NAHdzuuu7UxAkszU7uuDbQXS4jiCKtWr8Jlb3g9tNbo6+1DtVKFgTmrfq4xpjYyHkWIogiFQgHb/2A7du3ehbe/82rYto0orE2FDcIAfQP9MMYwAGjGGo+q41WAOZJSYqIygfHKBNrb2hAEAYqlInZ99E/wxre8CT9+7HH8+le/xkD/QO2BGhCnTBxqLIwRQqC9vR1r13Xh4ksuxqWvfx02btoEIQWCIIAxZvIGpH39/Ui4KIbmiAHQJP3Dg8hmMnBdF0mcQCUKm7dsxtZtWzEyMoJjR3tw7OWjGBocQnm0jKg+dTebz6FUKmJF5wp0r19fXxyzBtlcFkopxFE8OchnSYk4SdDT34dq4HOSDM0ZA6AJGqvjjh3vxYZ165FxHCitJ+fnl0olvPbSS/DaSy+ZfmGMqM+oEwJK1e6553v+lO1LKeH5PvoGjsMPAhY/NQUDoEms+oDgsd4edK/tQi6Xm1wYkyTJlPvmTTdPfjpCCEghobTC0OgIhkaGedpPTcUAaCIpJfwwwO97jmH1ypVob2uDLe3aQyxPKPIzXbcX9YUvAkCiFMa9CkbKo/B8j7PlqOkYAE0mZe2I3TfQj/L4ODra2lDIFeC6Z/eA0CRJEMURKp6HSrWCIAwnB/+Imo0B0AKNo7gf+PADH45tI+NmkM1m4dg2HNuGELWC1lojUbX74YVhhLC+KEZpDSFqN8XgZT5qFQZACzWO2olSiL3aMtdXVS96DvLRfGAAzAPBG1rQIsXDDFGKMQCIUowBQJRiDACiFGMAEKUYA4AoxRgARCnGACBKMQYAUYoxAIhSjAFAlGIMAKIUYwAQpRgDgCjFGABEKcYAIEoxBgBRijEAiFKMAUCUYgwAohRjABClGAOAKMUYAEQpJo0xDAGilJKQUi90I4hoYUghcPwMD6slomVICIEwCBIJZY6DCUCUKtKSMNqMS0AfXejGENH8ktKCERiRsMRhA/DhlUQpYlkWhBAD0ij7SBD4nuTjqIlSRRvzohyNoiNG65dt21no9hDRPBIGP5Of273bg5DPSYtnAERpIKVEFIZaWvKQBABpxKMcASBKB9txkCTJEWEHz0kA0NI8HvhBIi1rodtGRC1mWRYA8dTN1948LgGgzdjPKKWedV13gZtGRK0khACMgQXxj0B9MdCOHTsSAfM9i1cCiJY127bhe/6QgPwBcMJqQC2S7/q+r9kNIFq+HNeFgXnsozt39gInBMCx5373tFLqiQy7AUTLkhACKkkgpby/8dpkANx5550aUtwjpOCsQKJlyM1kEAT+8/FI/p8ar03p9I+Vq49UK9UjDs8CiJad+uj/1/bs+UDQeG1KAHz2ttvKwui/t2173htHRK3jZjLwKpUjUYL7Tnz9lGF/mUnuq1YqRzLZ7Lw1johay3EcAObLH9+1q3zi66cEwM3X3jxugL+prxaatwYSUWtkczlUK5XnS8K9++TvTXvhX41O7K1WKk/kcrnWt46IWkZKCWMMjDZ/uWPHDu/k75/2EP+NBx54o3DEoxDCVknS2lYSUUsUikVMTIw/ctvOP7l2uu+fdurfzTfc8BMVJ3+b5VgA0ZLkZjLwPW9AWuIzp3vPGef+FoV9Z7Uy8VS+UAB420CiJUNKCSklEhV/7pbrdx057fvOtJGdO3cGJkluCwK/7GY4N4BoqcgX8vC96t7bdn74W2d636uu/rn1po8cUkrtAQCL8wOIFr1CsYiJ8YmfqHL1k6/23rNa/nfrjl0PhkH0RdfNgPcOJFqkjEEun4Pv+4c11K49e/YEr/aRGV3o3/vggS+XSoU/rVaqMHyWANGiks3lEMXRQBhF19x+w4cPnc1nZnQ4Lxn5mYmxif2FYpFnAkSLhQGy2SziMBqPouTGsy1+YIYBsHPnTp2UJz4yPj5xXzabrS8uIKKFlCvkEEXxQBBHH9xzw64fzOSzs57re++D+/9LNpf9DypRiON4tpshojkoFAsIfP9wEMcfmsmRv2HW5/G37LjpC74ffBJAwMlCRPNLSolCqYgwCB/zguq/nk3xA3M4A2j4+rf3/ZGAdU++kN/EwUGi1nMzLqSwEAbB3R6GP3PHjjtOmeN/tpqy3O/u++/vzhQzf29b9g5jDMIwbMZmiegEQkrk83n4njegtfr8LTt23TfnbTahXZO+8dD+WyHknflCodv3PCilmrl5otTKZrMwxkCp5Nt+qD9/+403vtSM7TZ9wf9XDhzYUHTlFyDExzLZbDbwfQYB0SxlMpnarbx9/zmt9F/fsvOmB5q5/Zbd8ePeh/ZfIaX9WUBdl8vl7TAIkXBZMdGrEkIgk8lAWhaCwH9JGfNVpa279+zYMd70fTV7gyf7+kMHrhRSfBIQ78tls21KKURRBK11q3dNtKQ4jgPHdaGSBFEcP6thvqlC/fU9u3aNtGqf83bPr298e9/50nJvSOLkA0KK7blcFlobJHEMpRSvHlDqSClhOw4sy4IxBlEYDiiYHxqDAxk//ufdu3fPenT/bM37Tf/uuusuW7TnL3ds971G66shxMXZbKZDSAFAwGgNpTW01tBa8T4EtOQJKerr860ps2fDIAAMXlRGHRIa/yiNfOzmG298eV7bNp87m843v3Pg3CROLgHkGwCxHZboNkqvAkSH49hF23EAnh3QUlR7DidC39cGYkQAZQj0wuAlKfFTA/FMEOnnT75T73z6/3RTHmU6pemHAAAAAElFTkSuQmCC';
        return imgBase64;
    }
}