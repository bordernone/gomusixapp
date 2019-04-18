import {StyleSheet} from 'react-native';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { scale, moderateScale, verticalScale} from '../../global/scaling';

const styles = StyleSheet.create({
    mainWrapper:{
        paddingTop:10,
        backgroundColor:'#061737',
        flex:1,
        flexDirection:'row',
        alignItems:'center',
    },
    components:{
        flex:1,
        flexDirection:'column',
    },
    notLoggedInMsg:{
        color:'white',
        textAlign:'center',
        fontSize:scale(30),
        margin:8,
    },
});

export default styles;