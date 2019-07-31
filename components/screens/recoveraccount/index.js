import React, { Component } from 'react';
import { Text, View, Image, StatusBar, Alert, Dimensions, Platform, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Input, Button } from 'react-native-elements';
import { SafeAreaView } from 'react-navigation';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/FontAwesome';
import NetInfo from "@react-native-community/netinfo";
import AutoHeightImage from 'react-native-auto-height-image';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import styles from './style';
import '../../global/config';

class RecoverAccountScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            emailInput: '',
            isDeviceOnline: false,
            isLoadingRecoverAccount: false,
        }


        this.navigateToDashboard = this.navigateToDashboard.bind(this);
        this.recoverAccountNow = this.recoverAccountNow.bind(this);
        this.handleRecoverResponse = this.handleRecoverResponse.bind(this);
        this.isUserLoggedIn = this.isUserLoggedIn.bind(this);
        this.checkInternetConnection = this.checkInternetConnection.bind(this);

        this.checkInternetConnection();
    }

    // MISC functions
    _isMounted = false;

    componentDidMount() {
        this._isMounted = true;
        this.initSession();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    initSession = async () => {
        let isLoggedIn = await this.isUserLoggedIn();
        if (this._isMounted) {
            if (isLoggedIn == true) {
                this.setState({ isUserLoggedIn: true });
                this.navigateToDashboard();
            } else {
                this.setState({ isUserLoggedIn: false });
            }
        }
    }

    checkInternetConnection = () => {
        // check if device is online
        NetInfo.getConnectionInfo().then(data => {
            if (this._isMounted) {
                if (data.type == 'wifi' || data.type == 'cellular') {
                    this.setState({ isDeviceOnline: true });
                } else {
                    this.setState({ isDeviceOnline: false });
                }
            }
        });

        // add event listener to check internet connection
        const listener = data => {
            if (this._isMounted) {
                if (data.type == 'wifi' || data.type == 'cellular') {
                    this.setState({ isDeviceOnline: true });
                } else {
                    this.setState({ isDeviceOnline: false });
                }
            }
        };

        // Subscribe
        const subscription = NetInfo.addEventListener('connectionChange', listener);
    }

    navigateToDashboard() {
        this.props.navigation.navigate('Dashboard');
    }

    recoverAccountNow() {
        let email = this.state.emailInput;
        if (email == null || email == '') {
            Alert.alert('Invalid email address');
        } else if (this.state.isDeviceOnline == false) {
            Alert.alert('No internet connection');
        } else {
            this.setState({
                isLoadingRecoverAccount: true,
            });
            var formData = new FormData();
            formData.append('recoveryemail', email);
            var data = {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            };
            fetch(global.DOMAIN + 'api/recover/', data)
                .then((res) => res.json())
                .then((res) => { this.handleRecoverResponse(res) })
                .catch((error) => {
                    this.setState({
                        isLoadingRecoverAccount: false,
                    });
                    console.warn(error);
                });
        }
    }
    handleRecoverResponse = async (responseObj) => {
        if (responseObj.hasOwnProperty('successMsg')) {
            let responseMsg = responseObj.successMsg;
            Alert.alert(responseMsg);
        } else if (responseObj.hasOwnProperty('errorMsg')) {
            let responseMsg = responseObj.errorMsg;
            Alert.alert(responseMsg);
        }

        this.setState({
            isLoadingRecoverAccount: false,
        });
    }

    isUserLoggedIn = async () => {
        let loggedIn = false;
        try {
            let apiToken = await AsyncStorage.getItem('@GoMusix:apiToken');
            let apiRefreshToken = await AsyncStorage.getItem('@GoMusix:apiRefreshToken');
            let username = await AsyncStorage.getItem('@GoMusix:username');
            if (apiToken == null || apiRefreshToken == null || username == null) {
                loggedIn = false;
            } else {
                loggedIn = true;
            }
        } catch (error) {
            console.warn(error);
            loggedIn = false;
        }
        return loggedIn;
    }

    renderRecoverAccountBtn = () => {
        if (this.state.isLoadingRecoverAccount == true) {
            return (
                <Button
                    buttonStyle={styles.recoverButton}
                    titleStyle={styles.recoverTitle}
                    loading
                    title={" Recover account"}
                />
            );
        } else {
            return (
                <Button
                    onPress={() => this.recoverAccountNow()}
                    buttonStyle={styles.recoverButton}
                    titleStyle={styles.recoverTitle}
                    icon={
                        <Icon
                            style={styles.recoverTitle}
                            name="sign-in"
                            color="white"
                        />
                    }
                    title={" Recover account"}
                />
            );
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <StatusBar barStyle={Platform.OS === 'ios' ? "light-content" : 'dark-content'} backgroundColor="transparent" />

                <SafeAreaView>
                    <ScrollView
                        styles={styles.contentsWrapper}
                        showsVerticalScrollIndicator={false}>
                        <View style={styles.bodyContainer}>
                            <View style={styles.recoverFormContainer}>
                                <View style={styles.headerContainer}>
                                    <View style={styles.signUpButtonWrapper}>
                                        <TouchableOpacity
                                            style={styles.signUpButton}
                                            onPress={() => { this.props.navigation.navigate('Signup') }}>
                                            <Text style={[styles.textBlue, styles.signUpButtonText]}>Sign Up</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <AutoHeightImage width={wp('50%')} source={require('../../global/images/gomusix.png')} style={styles.headerImg} />

                                    <Text style={styles.welcomeMsg}>Welcome to</Text>
                                    <Text style={styles.gomusixMsg}><Text style={styles.textBlue}>G</Text>o<Text style={styles.textBlue}>M</Text>usix</Text>
                                </View>

                                <View style={styles.formInputContainer}>
                                    <Input
                                        placeholder={'Enter your email address'}
                                        placeholderTextColor={'white'}
                                        inputContainerStyle={{ borderBottomWidth: 0 }}
                                        inputStyle={styles.inputField}
                                        ref={(input) => { this.emailInput = input; }}
                                        returnKeyType={"next"}
                                        onSubmitEditing={() => { Keyboard.dismiss }}
                                        blurOnSubmit={false}
                                        onChangeText={emailInput => this.setState({ emailInput })}
                                        autoCapitalize={'none'}
                                        autoCorrect={false}
                                    />
                                </View>

                                <View style={styles.formSubmitContainer}>
                                    { this.renderRecoverAccountBtn() }
                                </View>

                                <View style={styles.skipButtonWrapper}>
                                    <TouchableOpacity style={styles.skipButton} onPress={() => this.navigateToDashboard()}>
                                        <Text style={styles.skipButtonText}>Skip >>></Text>
                                    </TouchableOpacity>
                                </View>

                            </View>
                        </View>
                    </ScrollView>
                </SafeAreaView>

            </View>
        );
    }
}

export default RecoverAccountScreen;