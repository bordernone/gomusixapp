import {StyleSheet} from 'react-native';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { scale, moderateScale, verticalScale} from '../../global/scaling';

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:'#061737',
        height:'100%',
        width:'100%',
        padding:scale(30),
        paddingBottom:scale(0),
        paddingTop:scale(10),
    },
    contentsWrapper:{
        flexGrow:1,
        backgroundColor:'#061737',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bodyContainer:{
        flexDirection:'row',
        justifyContent:'center',
    },
    recoverFormContainer:{
        minHeight:200,
        width:'100%',
        paddingBottom:40,
    },
    headerContainer:{
        width:'100%',
        marginTop:scale(60),
        paddingBottom:scale(10),
    },
    headerImg:{
        width:wp('50%'),
        resizeMode:'stretch',
        position:'absolute',
        right:0,
        top:0,
    },
    welcomeMsg:{
        color:'white',
        fontSize:scale(30),
        marginTop:scale(120),
    },
    gomusixMsg:{
        color:'white',
        fontSize:scale(50),
        fontFamily:'Optima-Italic',
        fontStyle:'italic',
    },
    textBlue:{
        color:'#27a4de',
    },
    formInputContainer:{
        justifyContent:'center',
        margin:'0.5%',
        marginTop:'1%',
        marginBottom:'1%',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    inputField:{
        backgroundColor: '#278ebd',
        textAlign:'center',
        padding:'6%',
        borderRadius:8,
        margin:0,
        width:'100%',
        color:'white',
        fontSize:moderateScale(20),
    },
    formSubmitContainer:{
        justifyContent:'center',
        alignItems:'center',
    },
    recoverButton:{
        marginTop:scale(5),
        padding:scale(10),
        paddingLeft:scale(30),
        paddingRight:scale(30),
        borderRadius:8,
        //width:'100%',
    },
    recoverTitle:{
        fontSize:scale(15),
        textAlign:'center',
    },
    forgotPasswordContainer:{
        justifyContent:'flex-end',
        marginLeft:'2%',
        marginRight:'2%',
        paddingLeft:'4%',
        paddingRight:'4%',
        flexDirection:'row',
    },
    forgotPasswordLink:{
        textAlign:'right',
        color:'white',
        fontSize:scale(10),
    },
    signUpButtonWrapper:{
        position:'absolute',
        top:0,
        left:0,
    },
    signUpButton:{
        padding:'4%',
        paddingBottom:'8%',
        borderBottomWidth:1,
        borderBottomColor:'#27a4de',
        color:'#27a4de',
    },
    signUpButtonText:{
        fontWeight:'bold',
        textAlign:'center',
        fontSize:scale(10),
    },
    skipButtonWrapper:{
        justifyContent:'center',
        flexDirection:'row',
        marginTop:10,
    },
    skipButton:{
        padding:scale(5),
        borderBottomWidth:1,
        borderBottomColor:'white',
    },
    skipButtonText:{
        color:'white',
        fontSize:scale(15),
    },
});

export default styles;