import React, { Component } from 'react';
import { Text, View, Image, StatusBar, Alert, Dimensions, Platform } from 'react-native';
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

class SignupScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            usernameInput: null,
            passwordInput: null,
            confirmPasswordInput: null,
            emailInput: null,
            isDeviceOnline: false,
        }


        this.navigateToDashboard = this.navigateToDashboard.bind(this);
        this.signupNow = this.signupNow.bind(this);
        this.handlesignupResponse = this.handlesignupResponse.bind(this);
        this.storeApiKeys = this.storeApiKeys.bind(this);
        this.isUserLoggedIn = this.isUserLoggedIn.bind(this);
        this.checkInternetConnection = this.checkInternetConnection.bind(this);

        this.initSession();
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

    signupNow() {
        let username = this.state.usernameInput;
        let password = this.state.passwordInput;
        let cpassword = this.state.confirmPasswordInput;
        let email = this.state.emailInput;
        if (username == null || password == null || cpassword == null || email == null) {
            Alert.alert('Please fill all fields');
        } else if (password != cpassword) {
            Alert.alert('Passwords did not match');
        } else if (this.state.isDeviceOnline == false) {
            Alert.alert('No internet connection');
        } else {
            var formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);
            formData.append('email', email);
            var data = {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            };
            fetch(global.DOMAIN + 'api/signup/', data)
                .then(response => {
                    const statusCode = response.status;
                    let data = '';
                    if (statusCode == 200) {
                        data = response.json();
                    }
                    return Promise.all([statusCode, data]);
                })
                .then(([statusCode, data]) => {
                    if (statusCode == 200) {
                        this.handlesignupResponse(data);
                    } else {
                        Alert.alert('Something went wrong');
                    }
                    console.log(data);
                })
                .catch((error) => {
                    Alert.alert('Something went wrong');
                    console.log(error);
                });
        }
    }

    handlesignupResponse = async (responseObj) => {
        if (responseObj.hasOwnProperty('successMsg')) {
            let responseMsg = responseObj.successMsg;
            Alert.alert(responseMsg);
        } else if (responseObj.hasOwnProperty('errorMsg')) {
            let responseMsg = responseObj.errorMsg;
            Alert.alert(responseMsg);
        }
    }
    
    storeApiKeys = async (apiToken, apiRefreshToken, username) => {
        let successful = false;
        try {
            await AsyncStorage.setItem('@GoMusix:apiToken', (apiToken));
            await AsyncStorage.setItem('@GoMusix:apiRefreshToken', (apiRefreshToken));
            await AsyncStorage.setItem('@GoMusix:username', (username));
            this.setState({ isUserLoggedIn: true });
            successful = true;
        } catch (error) {
            console.warn(error);
            successful = false;
        }
        return successful;
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

    render() {
        return (
            <View style={styles.container}>
                <StatusBar barStyle={Platform.OS === 'ios' ? "light-content" : 'dark-content'} backgroundColor="transparent" />

                <SafeAreaView>
                    <ScrollView
                        styles={styles.contentsWrapper}
                        showsVerticalScrollIndicator={false}>
                        <View style={styles.bodyContainer}>
                            <View style={styles.signupFormContainer}>
                                <View style={styles.headerContainer}>
                                    <View style={styles.signUpButtonWrapper}>
                                        <TouchableOpacity
                                            style={styles.signUpButton}
                                            onPress={() => { this.props.navigation.navigate('Login') }}>
                                            <Text style={[styles.textBlue, styles.signUpButtonText]}>Sign In</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <AutoHeightImage width={wp('50%')} source={require('../../global/images/gomusix.png')} style={styles.headerImg} />

                                    <Text style={styles.welcomeMsg}>Welcome to</Text>
                                    <Text style={styles.gomusixMsg}><Text style={styles.textBlue}>G</Text>o<Text style={styles.textBlue}>M</Text>usix</Text>
                                </View>

                                <View style={styles.formInputContainer}>
                                    <Input
                                        placeholder={'Your username here'}
                                        placeholderTextColor={'white'}
                                        inputContainerStyle={{ borderBottomWidth: 0 }}
                                        inputStyle={styles.inputField}
                                        ref={(input) => { this.usernameInput = input; }}
                                        returnKeyType={"next"}
                                        onSubmitEditing={() => { this.passwordInput.focus(); }}
                                        blurOnSubmit={false}
                                        onChangeText={usernameInput => this.setState({ usernameInput })}
                                        autoCapitalize={'none'}
                                        autoCorrect={false}
                                    />
                                </View>

                                <View style={styles.formInputContainer}>
                                    <Input
                                        placeholder={'Your email here'}
                                        placeholderTextColor={'white'}
                                        inputContainerStyle={{ borderBottomWidth: 0 }}
                                        inputStyle={styles.inputField}
                                        ref={(input) => { this.emailInput = input; }}
                                        returnKeyType={"next"}
                                        onSubmitEditing={() => { this.emailInput.focus(); }}
                                        blurOnSubmit={false}
                                        onChangeText={emailInput => this.setState({ emailInput })}
                                        autoCapitalize={'none'}
                                        autoCorrect={false}
                                    />
                                </View>

                                <View style={styles.formInputContainer}>
                                    <Input
                                        placeholder={'Your password here'}
                                        placeholderTextColor={'white'}
                                        inputContainerStyle={{ borderBottomWidth: 0 }}
                                        inputStyle={styles.inputField}
                                        ref={(input) => { this.passwordInput = input; }}
                                        returnKeyType={"next"}
                                        blurOnSubmit={false}
                                        onChangeText={passwordInput => this.setState({ passwordInput })}
                                        autoCapitalize={'none'}
                                        autoCorrect={false}
                                        secureTextEntry={true}
                                    />
                                </View>

                                <View style={styles.formInputContainer}>
                                    <Input
                                        placeholder={'Confirm your password'}
                                        placeholderTextColor={'white'}
                                        inputContainerStyle={{ borderBottomWidth: 0 }}
                                        inputStyle={styles.inputField}
                                        ref={(input) => { this.confirmPasswordInput = input; }}
                                        returnKeyType={"done"}
                                        blurOnSubmit={false}
                                        onChangeText={confirmPasswordInput => this.setState({ confirmPasswordInput })}
                                        autoCapitalize={'none'}
                                        autoCorrect={false}
                                        secureTextEntry={true}
                                    />
                                </View>
                                <View style={styles.formSubmitContainer}>
                                    <Button
                                        onPress={() => this.signupNow()}
                                        buttonStyle={styles.signupButton}
                                        titleStyle={styles.signupTitle}
                                        icon={
                                            <Icon
                                                style={styles.signupTitle}
                                                name="sign-in"
                                                color="white"
                                            />
                                        }
                                        title={" Create account"}
                                    />
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

export default SignupScreen;