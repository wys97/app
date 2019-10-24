
// 支付红包提示View

import React from 'react'
import {StyleSheet, View, Text, TouchableOpacity, Image, DeviceEventEmitter, ImageBackground} from 'react-native'

import LayoutTool from '../../Tools/Layout'

export default class PayRedPackageShowView extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            imgUrl: require("../../images/TakeMealsImg/icon_redPackageBg.png"),
            openImgUrl: require("../../images/TakeMealsImg/icon_redPackageOpen.png"),
        }
    }

    componentDidMount(){

    }
    componentWillUnmount() {

    }

    render(){

        return (
            <View style={styles.container}>

                <ImageBackground style={styles.bgViewStyle}
                                 source={require("../../images/TakeMealsImg/icon_redPackageBg.png")}
                >
                    <TouchableOpacity activeOpacity={1} onPress={()=>this.openRedBtnClick()}>
                        <Image style={styles.closeImgStyle} source={this.state.openImgUrl}/>
                    </TouchableOpacity>

                </ImageBackground>

            </View>
        )
    }

    openRedBtnClick() {
        // 点击打开红包按钮发送事件
        DeviceEventEmitter.emit('openPayReadNotification', '');
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent:'center',
    },
    bgViewStyle:{
        // backgroundColor: "#fff",
        width: LayoutTool.scaleSize(590),
        height: LayoutTool.scaleSize(782),
        borderRadius: LayoutTool.scaleSize(10),
        alignItems: 'center',
        backgroundColor: 'transparent'
    },
    closeImgStyle: {
        width: LayoutTool.scaleSize(162),
        height: LayoutTool.scaleSize(162),
        marginTop: LayoutTool.scaleSize(508),
    },

});
