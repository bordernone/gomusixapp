import AsyncStorage from '@react-native-community/async-storage';

export async function logoutUser(_this) {
    await AsyncStorage.clear();
    _this.props.navigation.navigate('Login');
}