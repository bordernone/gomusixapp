import { StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { scale, moderateScale, verticalScale } from '../../global/scaling';

export const carouselWidth = wp('100%');
export const carouselItemWidth = hp('85%') * 0.5;

const styles = StyleSheet.create({
    mediaPlayerTopNavContainer: {
        minHeight: scale(40),
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    backButtonContainer: {
        padding: scale(8),
        margin: scale(5),
    },
    goBackText: {
        color: '#3c434f',
    },
    carouselContainer: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.36,
        shadowRadius: 6.68,
        elevation: 11,
        backgroundColor: 'white',
        marginTop: 15,
        marginBottom: 15,
        padding: scale(20),
        borderRadius: scale(20),
        height: hp('85%'),
        borderBottomWidth:8,
        borderBottomColor:'#27a4de',
    },
    mediaPlayerContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    songThumbnailContainer: {
        alignItems: 'center',
        paddingTop: 15,
    },
    songThumbnailImgContainer: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 12,
        },
        shadowOpacity: 0.48,
        shadowRadius: 10.00,
        elevation: 10,
    },
    songThumbnailImg: {
        width: scale(160),
        height: scale(160),
    },
    songTitleContainer: {
        padding: 4,
        paddingTop: 25,
    },
    songTitleText: {
        textShadowColor: '#b5b5b5',
        textShadowOffset: {
            width: -1,
            height: 1
        },
        textShadowRadius: 3,
        fontSize: scale(20),
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#5b5b5b',
    },
    songArtistContainer: {
        padding: 4,
        paddingTop: 10,
    },
    songArtistText: {
        textShadowColor: '#b5b5b5',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 3,
        fontSize: scale(15),
        textAlign: 'center',
        color: '#5b5b5b',
    },
    mediaPlayerActionContainer:{
        minHeight:5,
        alignItems:'center',
        justifyContent:'center',
        flexDirection:'row',
    },
});

export default styles;