import {StyleSheet} from 'react-native';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { scale, moderateScale, verticalScale} from '../../global/scaling';

const styles = StyleSheet.create({
    contentWrapper:{
        height:'100%',
        alignItems:'center',
        justifyContent:'center',
    },
    notLoggedInMsg:{
        color:'black',
        textAlign:'center',
        fontSize:moderateScale(25),
        margin:8,
    },
});

export default styles;