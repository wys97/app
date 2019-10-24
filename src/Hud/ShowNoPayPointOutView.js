
// 未支付订单弹框提示

import React from 'react'
import {StyleSheet, View, Text, TouchableOpacity, Image, DeviceEventEmitter} from 'react-native'

import {SCREEN_WIDTH, STATUSBAR_HEIGHT, unitWidth} from '../../Tools/Layout';
import LayoutTool from '../../Tools/Layout'

export default class ShowNoPayPointOutView extends React.Component{

    constructor(props) {
        super(props);
        this.state = {

        }
    }

    render(){
        // 1:未支付；2:已支付未取餐
        let {info} = this.props;
        let imgUrl = "";
        let btnImg = "";
        if (info == 1) {
            imgUrl = require("../../images/HomeImg/icon_face.png");
            btnImg = require("../../images/HomeImg/icon_hudGoPay.png");
        } else {
            imgUrl = require("../../images/HomeImg/icon_noTakeMealsImg.png");
            btnImg = require("../../images/HomeImg/icon_hudBtnKnow.png");
        }

        return (
            <View style={styles.container}>
                <View style={styles.bgViewStyle}>
                    <Image style={{
                                width: LayoutTool.scaleSize(142),
                                height: LayoutTool.scaleSize(122),
                                marginTop: 54*unitWidth,
                    }} source={imgUrl}/>

                    <Text style={{
                                fontSize: LayoutTool.setSpText(30),
                                color:"#F2D3AB",
                                marginTop: LayoutTool.scaleSize(40),
                    }}>{(info == 1)?"当前存在未支付订单":"当前待取餐订单达到上限"}</Text>

                    <Text style={{
                        fontSize: LayoutTool.setSpText(30),
                        color:"#FF9C43",
                        fontWeight: 'bold',
                        marginTop: LayoutTool.scaleSize(20),//20*unitWidth,
                    }}>{(info == 1)?"请先完成支付":"请先取餐"}</Text>

                    <TouchableOpacity activeOpacity={0.7} onPress={()=>this.goPayBtnClick()}>
                        <Image style={{
                                width: LayoutTool.scaleSize(479),
                                height: LayoutTool.scaleSize(84),
                                marginTop: LayoutTool.scaleSize(80),
                        }} source={btnImg}/>
                    </TouchableOpacity>

                </View>
            </View>
        )
    }

    goPayBtnClick() {
        // 发送事件
        DeviceEventEmitter.emit('goPayNotification', '');
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent:'center',
    },
    bgViewStyle:{
        backgroundColor: "#2F2F30",
        width: LayoutTool.scaleSize(560),
        height: LayoutTool.scaleSize(520),
        borderRadius: LayoutTool.scaleSize(10),
        alignItems: 'center',
    },
});
