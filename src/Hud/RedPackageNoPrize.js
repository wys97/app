
// 支付红包提示View

import React from 'react'
import {StyleSheet, View, Text, TouchableOpacity, Image, DeviceEventEmitter, ImageBackground} from 'react-native'

import LayoutTool from '../../Tools/Layout'

export default class RedPackageNoPrize extends React.Component{

    constructor(props) {
        super(props);
        this.state = {

            showGif: true,

            showView: false,
        }
    }

    componentDidMount(){
        this.timer = setTimeout(() => {
                console.log('2s后动画结束操作');
            this.setState({
                    showGif: false,
                });
            }, 2000
        );
        this.timer = setTimeout(() => {
                console.log('0.5后动画结束操作');
                this.setState({
                    showView: true,
                });
            }, 500
        );
    }
    // 移除通知事件
    componentWillUnmount(){
        // 如果存在this.timer，则使用clearTimeout清空。
        // 如果你使用多个timer，那么用多个变量，或者用个数组来保存引用，然后逐个clear
        this.timer && clearTimeout(this.timer);
    }

    render(){

        return (
            <View style={styles.container}>

                {this.state.showView?<ImageBackground style={styles.bgViewStyle}
                                                      source={require("../../images/TakeMealsImg/icon_noRedPackagePrize.png")}
                >

                </ImageBackground>:null}


                <TouchableOpacity activeOpacity={1} onPress={()=>this.closeBtnClick()}>
                    <Image style={styles.closeImgStyle} source={require("../../images/CouponHudImg/icon_close.png")}/>
                </TouchableOpacity>

                {this.state.showGif?<View style={styles.gifBgViewStyle}>
                                        <Image style={styles.gifImgStyle} source={require("../../images/CouponHudImg/icon_couponcutter.gif")}/>
                                    </View>:null}
            </View>
        )
    }

    closeBtnClick() {
        // 关闭按钮发送事件
        DeviceEventEmitter.emit('closeNoPayReadNotification', '');
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
        backgroundColor: "#fff",
        width: LayoutTool.scaleSize(590),
        height: LayoutTool.scaleSize(782),
        borderRadius: LayoutTool.scaleSize(10),
        alignItems: 'center',
    },
    closeImgStyle: {
        width: LayoutTool.scaleSize(52),
        height: LayoutTool.scaleSize(52),
        marginTop: LayoutTool.scaleSize(30),
    },

    gifBgViewStyle: {
        backgroundColor: 'transparent',
        width: LayoutTool.scaleSize(590),
        height: LayoutTool.scaleSize(782+82),
        borderRadius: LayoutTool.scaleSize(10),
        alignItems: 'center',
        position:'absolute',
    },
    gifImgStyle: {
        width: LayoutTool.scaleSize(590),
        height: LayoutTool.scaleSize(782),
        borderRadius: LayoutTool.scaleSize(10),
    },

});
