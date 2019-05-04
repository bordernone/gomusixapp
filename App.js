import React, { Component } from 'react';
import { createStackNavigator, createAppContainer, createSwitchNavigator, createDrawerNavigator } from 'react-navigation';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';
import { Icon as IconRNElements } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import LoginScreen from './components/screens/login';
import MusicsScreen from './components/screens/musics';
import OnlineScreen from './components/screens/online';
import OfflineScreen from './components/screens/offline';
import ProcessScreen from './components/screens/process';
import MediaPlayerScreen from './components/screens/mediaplyer';
import SettingsScreen from './components/screens/settings';
import LogoutScreen from './components/screens/logout';


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
        navigationOptions: {
            title: 'Musics',
            tabBarIcon: ({ tintColor }) => (
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
        navigationOptions: {
            title: 'Online',
            tabBarIcon: ({ tintColor }) => (
                <Icon
                    name="cloud"
                    color={tintColor}
                    size={24}
                />
            )
        },
    },
},
    {
        initialRouteName: 'Musics',
        activeColor: '#27a4de',
        inactiveColor: 'grey',
        barStyle: { backgroundColor: 'white' },
    });


const dashboardDrawer = createDrawerNavigator({
    Home: {
        screen: dashboardTabNavigator,
        navigationOptions: {
            drawerLabel: 'Home',
            drawerIcon: ({ tintColor }) => (
                <IconRNElements
                    name='home'
                    type='font-awesome'
                    color={'#27a4de'}
                />
            ),
        },
    },
    Settings: {
        screen: SettingsScreen,
        navigationOptions: {
            drawerLabel: 'Settings',
            drawerIcon: ({ tintColor }) => (
                <IconRNElements
                    name='cogs'
                    type='font-awesome'
                    color={'#27a4de'}
                />
            ),
        }
    },
    Logout: {
        screen: LogoutScreen,
        navigationOptions: {
            drawerLabel: 'Logout',
            drawerIcon: ({ tintColor }) => (
                <IconRNElements
                    name='sign-out'
                    type='font-awesome'
                    color={'#27a4de'}
                />
            ),
        }
    },
});

const dashboardStackWrapper = createStackNavigator(
    {
        Dashboard: {
            screen: dashboardDrawer,
            navigationOptions: ({ navigation }) => {
                const { routeName } = navigation.state.routes
                [navigation.state.index];
                return {
                    header: null,
                    title: routeName,
                    headerTitleStyle: {
                        color: '#061737',
                    },
                }
            },
        },
        MediaPlayer: {
            screen: MediaPlayerScreen,
            navigationOptions: {
                header: null,
            },
        },
    },
    {
        initialRouteName: 'Dashboard',
    }
);

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