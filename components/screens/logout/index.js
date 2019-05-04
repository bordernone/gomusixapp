import React, { Component } from 'react';
import { View } from 'react-native';
import { Icon } from 'react-native-elements';
import { logoutUser } from '../../global/auth';

class LogoutScreen extends Component {
    constructor(props) {
        super(props);

        logoutUser(this);
    }
    render() {
        return (
            <View></View>
        )
    }
}

export default LogoutScreen;