import {Platform} from 'react-native';

global.DOMAIN = Platform.OS === 'ios' ? 'http://127.0.0.1:8000/' : 'http://192.168.1.16:8000/';