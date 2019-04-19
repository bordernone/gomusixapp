import React, {Component} from 'react';
import {createStackNavigator, createAppContainer, createSwitchNavigator} from 'react-navigation';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import LoginScreen from './components/screens/login';
import MusicsScreen from './components/screens/musics';
import OnlineScreen from './components/screens/online';
import OfflineScreen from './components/screens/offline';
import ProcessScreen from './components/screens/process';


const switchNavigatorForOnlineTab = createSwitchNavigator(
    {
        Process: ProcessScreen,
        OnlineLoggedIn: OnlineScreen,
        OnlineLoggedOut: OfflineScreen,
    },
    {
        initialRouteName: 'Process',
    }
);

const dashboardTabNavigator = createMaterialBottomTabNavigator({
    Musics: { 
        screen: MusicsScreen,
        navigationOptions:{
            title: 'Musics',
            tabBarIcon: ({tintColor}) => (
                <Icon
                    name="music"
                    color={tintColor}
                    size={24}
                />
            )
        },
    },
    Online: { 
        screen: switchNavigatorForOnlineTab,
        navigationOptions:{
            title: 'Online',
            tabBarIcon: ({tintColor}) => (
                <Icon
                    name="cloud"
                    color={tintColor}
                    size={24}
                />
            )
        },
    },
}, {
    initialRouteName: 'Musics',
    activeColor: '#27a4de',
    inactiveColor: 'grey',
    barStyle: { backgroundColor: 'white' },
});

const dashboardStackWrapper = createStackNavigator({
    Dashboard:{
        screen: dashboardTabNavigator,
        navigationOptions: ({ navigation }) => {
            const { routeName } = navigation.state.routes
            [navigation.state.index];
            return {
                title: routeName,
                headerStyle:{
                    //backgroundColor:'#061737',
                },
                headerTitleStyle:{
                    color:'#061737',
                },
            }
        },
    },
});

const mainStackNavigator = createSwitchNavigator(
    {
        Login: LoginScreen,
        Dashboard: dashboardStackWrapper,
    },
    {
        initialRouteName: 'Login',
    }
);

export default createAppContainer(mainStackNavigator);