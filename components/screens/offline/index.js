import React, {Component} from 'react';
import {Text, View, Image, StatusBar, Alert} from 'react-native';
import {Button} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from './style';

class OfflineScreen extends Component {
    constructor(props) {
        super(props)

        this.navigateToLogin = this.navigateToLogin.bind(this);
    }

    navigateToLogin = () => {
        this.props.navigation.navigate('Login');
    }

    render() {
        return (
            <View style={styles.mainWrapper}>

                <View style={styles.components} >
                    <Text style={styles.notLoggedInMsg}>You are not logged in!</Text>
                    <Button
                        onPress={() => this.navigateToLogin()}
                        icon={
                            <Icon
                                name="sign-in"
                                size={20}
                                color="white"
                                />
                        }
                        iconLeft
                        title=" Login in now"
                        />
                </View>
            </View>
        );
    }
}

export default OfflineScreen;