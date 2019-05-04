import { StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { scale, moderateScale, verticalScale } from '../../global/scaling';
import { material } from 'react-native-typography';

const styles = StyleSheet.create({
    settingsWrapper: {
        padding: 10,
    },
    generalSettingsWrapper:{
        marginBottom:5,
        marginTop:5,
    },
    accountSettingsWrapper:{
        marginBottom:5,
        marginTop:5,
    },
});

export default styles;