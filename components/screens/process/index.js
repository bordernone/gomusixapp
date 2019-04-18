import React, {Component} from 'react';
import {Text, View, Image, StatusBar, Alert, ActivityIndicator} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

class ProcessScreen extends Component {
    constructor(props) {
        super(props)

        this.navigateToOffline  = this.navigateToOffline.bind(this);
        this.navigateToOnline   = this.navigateToOnline.bind(this);
        this.isUserLoggedIn = this.isUserLoggedIn.bind(this);
        this.authorization = this.authorization.bind(this);

        this.authorization();
    }

    authorization = async() => {
        let loggedIn = await this.isUserLoggedIn();
        if (loggedIn == true){
            this.navigateToOnline();
        } else {
            this.navigateToOffline();
        }
    }

    navigateToOffline(){
        this.props.navigation.navigate('OnlineLoggedOut');
    }

    navigateToOnline(){
        this.props.navigation.navigate('OnlineLoggedIn');
    }

    isUserLoggedIn = async () => {
        let loggedIn = false;
        try {
            let username = await AsyncStorage.getItem('@GoMusix:username');
            let apiToken = await AsyncStorage.getItem('@GoMusix:apiToken');
            let apiRefreshToken = await AsyncStorage.getItem('@GoMusix:apiRefreshToken');
            if (username == null || apiToken == null || apiRefreshToken == null){
                loggedIn = false;
            } else {
                loggedIn = true;
            }
        } catch (error) {
            loggedIn= false;
            console.warn(error);
        }
        return loggedIn;
    }

    render() {
        return (
            <View style={{paddingTop:80}}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }
}

export default ProcessScreen;