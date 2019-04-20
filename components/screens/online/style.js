import { StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { scale, moderateScale, verticalScale } from '../../global/scaling';

const styles = StyleSheet.create({
    songTitleStyle: {
        color: '#383838',
    },
    songArtistStyle: {
        color: 'grey',
    },
    songListContainer: {
        backgroundColor: '#efefef',
    },
});

export default styles;