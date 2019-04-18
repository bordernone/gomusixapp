import React, {Component} from 'react';
import {Text, View, Image, StatusBar, Alert, Dimensions, Platform} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {Input, Button} from 'react-native-elements';
import { SafeAreaView } from 'react-navigation';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/FontAwesome';
import NetInfo from "@react-native-community/netinfo";
import AutoHeightImage from 'react-native-auto-height-image';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import styles from './style';
import '../../global/config';

class LoginScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            usernameInput: '',
            passwordInput: '',
            isDeviceOnline: false,
        }


        this.navigateToDashboard = this.navigateToDashboard.bind(this);
        this.signInNow = this.signInNow.bind(this);
        this.handleLoginResponse = this.handleLoginResponse.bind(this);
        this.storeApiKeys = this.storeApiKeys.bind(this);
        this.isUserLoggedIn = this.isUserLoggedIn.bind(this);
        this.checkInternetConnection = this.checkInternetConnection.bind(this);

        this.initSession();
        this.checkInternetConnection();
    }

    initSession = async() => {
        let isLoggedIn = await this.isUserLoggedIn();
        if (isLoggedIn == true){
            this.setState({isUserLoggedIn:true});
            this.navigateToDashboard();
        } else {
            this.setState({isUserLoggedIn:false});
        }
    }

    checkInternetConnection = () =>{
        // check if device is online
        NetInfo.getConnectionInfo().then(data => {
            if (data.type == 'wifi' || data.type=='cellular'){
                this.setState({isDeviceOnline:true});
            } else {
                this.setState({isDeviceOnline:false});
            }
            console.log("Connection type", data.type);
            console.log("Connection effective type", data.effectiveType);
        });

        // add event listener to check internet connection
        const listener = data => {
            if (data.type == 'wifi' || data.type=='cellular'){
                this.setState({isDeviceOnline:true});
            } else {
                this.setState({isDeviceOnline:false});
            }
            console.log("Connection type", data.type);
            console.log("Connection effective type", data.effectiveType);
        };
        
        // Subscribe
        const subscription = NetInfo.addEventListener('connectionChange', listener);
    }

    navigateToDashboard() {
        this.props.navigation.navigate('Dashboard');
    }

    signInNow(){
        console.warn(this.state.isDeviceOnline);
        let username = this.state.usernameInput;
        let password = this.state.passwordInput;
        if (username == null || password == null){
            Alert.alert('Incorrect username or password');
        } else if (this.state.isDeviceOnline == false){
            Alert.alert('No internet connection');
        } else {
            var formData = new FormData();
            formData.append('username',username);
            formData.append('password',password);
            var data = {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            };
            fetch(global.DOMAIN  + 'api/token/', data)
                .then((res) => res.json())
                .then((res) => {this.handleLoginResponse(res)})
                .catch((error) => {
                    console.warn(error);
                });
        }
    }
    handleLoginResponse = async (responseObj) => {
        console.warn('right');
        if (responseObj.hasOwnProperty('apiToken') && responseObj.hasOwnProperty('apiRefreshToken')){
            let apiToken = responseObj.apiToken;
            let apiRefreshToken = responseObj.apiRefreshToken;
            let storeKeys = await this.storeApiKeys(apiToken, apiRefreshToken, this.state.usernameInput);
            if (storeKeys === true){
                this.navigateToDashboard();
            } else {
                Alert.alert('Something went wrong.');
            }
        } else {
            Alert.alert('Incorrect Username or Password');
        }
    }
    storeApiKeys = async (apiToken, apiRefreshToken, username) => {
        let successful = false;
        try {
            await AsyncStorage.setItem('@GoMusix:apiToken', (apiToken));
            await AsyncStorage.setItem('@GoMusix:apiRefreshToken', (apiRefreshToken));
            await AsyncStorage.setItem('@GoMusix:username', (username));
            this.setState({isUserLoggedIn:true});
            successful = true;
        } catch (error) {
            console.warn(error);
            successful = false;
        }
        return successful;
    }
    isUserLoggedIn = async () =>{
        let loggedIn = false;
        try {
            let apiToken  = await AsyncStorage.getItem('@GoMusix:apiToken');
            let apiRefreshToken = await AsyncStorage.getItem('@GoMusix:apiRefreshToken');
            let username = await AsyncStorage.getItem('@GoMusix:username');
            if (apiToken == null || apiRefreshToken == null || username == null){
                loggedIn = false;
            } else {
                loggedIn = true;
            }
        } catch(error){
            console.warn(error);
            loggedIn = false;
        }
        return loggedIn;
    }

    render() {
        return (
            <View style={styles.container}>
                <StatusBar barStyle={ Platform.OS === 'ios' ? "light-content" : 'dark-content'} backgroundColor="transparent"/>

                <SafeAreaView>
                    <ScrollView 
                        styles={styles.contentsWrapper}
                        showsVerticalScrollIndicator={false}>
                        <View style={styles.bodyContainer}>
                            <View style={styles.loginFormContainer}>
                                <View style={styles.headerContainer}>
                                    <View style={styles.signUpButtonWrapper}>
                                        <TouchableOpacity style={styles.signUpButton}>
                                            <Text style={[styles.textBlue, styles.signUpButtonText]}>Sign Up</Text>
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
                                            inputContainerStyle={{ borderBottomWidth:0 }} 
                                            inputStyle={styles.inputField}
                                            ref={(input) => { this.usernameInput = input; }}
                                            returnKeyType = { "next" }
                                            onSubmitEditing={() => { this.passwordInput.focus(); }}
                                            blurOnSubmit={false}
                                            onChangeText={usernameInput => this.setState({usernameInput})}
                                            autoCapitalize={'none'}
                                            autoCorrect={false}
                                        />
                                </View>

                                <View style={styles.formInputContainer}>
                                        <Input 
                                            placeholder={'Your password here'} 
                                            placeholderTextColor={'white'} 
                                            inputContainerStyle={{ borderBottomWidth:0 }} 
                                            inputStyle={styles.inputField}
                                            ref={(input) => { this.passwordInput = input; }}
                                            returnKeyType = { "done" }
                                            blurOnSubmit={false}
                                            onChangeText={passwordInput => this.setState({passwordInput})}
                                            autoCapitalize={'none'}
                                            autoCorrect={false}
                                            secureTextEntry={true}
                                        />
                                </View>

                                <View style={styles.forgotPasswordContainer}>
                                    <TouchableOpacity style={styles.forgotPasswordButton}>
                                        <Text style={styles.forgotPasswordLink}>Forgot password?</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.formSubmitContainer}>
                                    <Button
                                        onPress={() => this.signInNow()}
                                        buttonStyle={styles.loginButton}
                                        titleStyle={styles.loginTitle}
                                        icon={
                                            <Icon
                                                style={styles.loginTitle}
                                                name="sign-in"
                                                color="white"
                                                />
                                        }
                                        title={" Sign In"}
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

export default LoginScreen;