import React, { Component } from 'react';
import { Text, View, Platform } from 'react-native';
import { Button, Header, Icon } from 'react-native-elements';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import { material } from 'react-native-typography'
import styles from './style';
import { SafeAreaView } from 'react-navigation';
import { TouchableOpacity } from 'react-native-gesture-handler';

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
            <SafeAreaView>
                <Header
                    placement={'center'}
                    rightComponent={<TouchableOpacity
                        onPress={() => { this.props.navigation.navigate('MediaPlayer') }}
                        style={{ padding: 8, }}>
                        <Icon
                            name='music'
                            type='font-awesome'
                            color={'#27a4de'}
                        />
                    </TouchableOpacity>}
                    backgroundColor={'white'}
                    containerStyle={{ borderBottomWidth: 2, borderBottomColor: '#27a4de', marginTop: Platform.OS === 'ios' ? 0 : - 26, }}
                />
                <View style={styles.contentWrapper}>
                    <Text style={material.display1}>You're not logged in!</Text>
                    <Button
                        icon={
                            <IconFontAwesome
                                name="sign-in"
                                size={15}
                                color="white"
                            />
                        }
                        iconLeft
                        title="  Login"
                        onPress={() => {this.props.navigation.navigate('Login')}}
                    />
                </View>
            </SafeAreaView>
        );
    }
}

export default OfflineScreen;