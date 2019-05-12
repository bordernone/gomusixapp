import React, { Component } from 'react';
import { View, Text, Platform, Switch, Alert } from 'react-native';
import { Header, Icon, ListItem } from 'react-native-elements';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { material } from 'react-native-typography';
import DefaultPreference from 'react-native-default-preference';
import styles from './style';

class SettingsScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            autoSyncStatus: false,
        }

        this.toggleAsync = this.toggleAsync.bind(this);
        this.initialize = this.initialize.bind(this);

    }

    _isMounted = false;
    componentDidMount() {
        this._isMounted = true;

        this.initialize();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    initialize = () => {
        let _this = this;
        if (this._isMounted == true) {
            DefaultPreference.get('GoMusix:autosync').then(function (autoSyncStatus) {
                console.log('current auto sync is set to ' + autoSyncStatus)

                if (autoSyncStatus === undefined) {
                    _this.setState({
                        autoSyncStatus: true,
                    });
                    DefaultPreference.set('GoMusix:autosync', 'true');
                } else if (autoSyncStatus == 'true') {
                    _this.setState({
                        autoSyncStatus: true,
                    });
                } else if (autoSyncStatus == 'false') {
                    _this.setState({
                        autoSyncStatus: false,
                    });
                } else {
                    _this.setState({
                        autoSyncStatus: true,
                    });
                    DefaultPreference.set('GoMusix:autosync', 'true');
                }
            });
        }
    }

    toggleAsync = () => {
        if (this.state.autoSyncStatus == true) {
            DefaultPreference.set('GoMusix:autosync', 'false')
                .then(function () { console.log('auto sync set to false') });
            this.setState({
                autoSyncStatus: false,
            });
        } else {
            DefaultPreference.set('GoMusix:autosync', 'true')
                .then(function () { console.log('auto sync set to true') });
            this.setState({
                autoSyncStatus: true,
            });
        }

        Alert.alert('Please restart the app')
    }

    render() {
        return (
            <View style={{ backgroundColor: '#efefef', minHeight: '100%' }}>
                <Header
                    placement={'center'}
                    centerComponent={{ text: 'Settings', style: { color: '#061737' } }}
                    rightComponent={<TouchableOpacity
                        onPress={() => { this.props.navigation.navigate('MediaPlayer') }}
                        style={{ padding: 8, }}>
                        <Icon
                            name='music'
                            type='font-awesome'
                            color={'#27a4de'}
                        />
                    </TouchableOpacity>}
                    leftComponent={
                        <TouchableOpacity
                            onPress={() => { this.props.navigation.toggleDrawer(); }}
                            style={{ padding: 8, }}><Icon
                                name='bars'
                                type='font-awesome'
                                color={'#27a4de'} />
                        </TouchableOpacity>}
                    backgroundColor={'white'}
                    containerStyle={{ borderBottomWidth: 2, borderBottomColor: '#27a4de', marginTop: Platform.OS === 'ios' ? 0 : - 26, }}
                />

                <View style={styles.settingsWrapper}>
                    <View style={styles.generalSettingsWrapper}>
                        <Text style={material.title}>General</Text>

                        <ListItem
                            title='Auto Sync'
                            subtitle={'This will auto download deleted songs.'}
                            subtitleStyle={{ color: 'grey' }}
                            leftIcon={
                                <Icon
                                    name='cloud'
                                    type='font-awesome'
                                    color={'#27a4de'}
                                />
                            }
                            rightElement={
                                <Switch onValueChange={() => { this.toggleAsync(); }} value={this.state.autoSyncStatus} />
                            }
                        />
                    </View>

                    <View style={styles.accountSettingsWrapper}>
                        <Text style={material.title}>Account Settings</Text>

                        <ListItem
                            title='Change Password'
                            subtitle={'Change your account password'}
                            subtitleStyle={{ color: 'grey' }}
                            leftIcon={
                                <Icon
                                    name='key'
                                    type='font-awesome'
                                    color={'#27a4de'}
                                />
                            }
                            rightIcon={
                                <Icon
                                    name={'angle-right'}
                                    type='font-awesome'
                                    color={'#27a4de'}
                                />
                            }
                        />
                    </View>
                </View>

            </View>
        )
    }
}

export default SettingsScreen;