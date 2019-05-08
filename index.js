/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import TrackPlayer from 'react-native-track-player';
import DefaultPreference from 'react-native-default-preference';

AppRegistry.registerComponent(appName, () => App);
// initializing TrackPlayer
TrackPlayer.setupPlayer()
    .then(() => {
        TrackPlayer.updateOptions({
            capabilities: [
                TrackPlayer.CAPABILITY_PLAY,
                TrackPlayer.CAPABILITY_PAUSE,
                TrackPlayer.CAPABILITY_STOP,
                TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
                TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
            ],
            stopWithApp: true
        });
    });
TrackPlayer.registerPlaybackService(() => require('./components/screens/online/service.js'));

// Default preferences 
DefaultPreference.get('GoMusix:autosync').then(function (autoSyncStatus) {
    if (autoSyncStatus != 'true' && autoSyncStatus != 'false') {
        DefaultPreference.set('GoMusix:autosync', 'true');
        console.log('Setting auto sync to true');
    }

    console.log('current auto sync is set to ' + autoSyncStatus)
});