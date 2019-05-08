import React, { Component } from 'react';
import { View } from 'react-native';
import { Icon } from 'react-native-elements';
import { logoutUser } from '../../global/auth';

class LogoutScreen extends Component {
    constructor(props) {
        super(props);

        logoutUser(this);
    }

    static navigationOptions = {
        drawerLabel: 'Logout / Login',
        drawerIcon: ({ tintColor }) => (
            <Icon
                name='sign-out'
                type='font-awesome'
                color={'#27a4de'}
            />
        ),
    };

    render() {
        return (
            <View></View>
        )
    }
}

export default LogoutScreen;