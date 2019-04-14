import {Platform} from 'react-native';

global.DOMAIN = Platform.OS === 'ios' ? 'http://127.0.0.1:8000/' : 'http://192.168.100.21:8000/';