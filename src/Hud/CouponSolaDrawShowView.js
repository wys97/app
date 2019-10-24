
// 券单种类型领取View

import React from 'react'
import {StyleSheet, View, Text, TouchableOpacity, Image, DeviceEventEmitter, ImageBackground} from 'react-native'

import {SCREEN_WIDTH, STATUSBAR_HEIGHT, unitWidth} from '../../Tools/Layout';
import LayoutTool from '../../Tools/Layout'
import NetService from '../../Tools/NetService'

export default class CouponSolaDrawShowView extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            couponData: "",     // 券数据模型
            dataList: [],
            titleImg: require("../../images/CouponHudImg/icon_newsManCouponTitle.png"),

            imgUrl: require("../../images/CouponHudImg/icon_couponcutter.gif"), // GIF图地址

            showGif: false, // 是否展示GIF图
        }
    }

    componentDidMount(){

        let {info} = this.props;
        console.log('info-------->' + info);
        if (info == 'TakeMeals') {
            this.setState({
                showGif: true,
            });
            // GIF动图配置
            this.timer = setTimeout(() => {
                    console.log('2s后动画结束操作');
                    this.setState({
                        showGif: false,
                        imgUrl: null,
                    });
                }, 2000
            );
        }

        if (global.userId) {
            let param = {"userId":userId};
            NetService.GET('heque-coupon/discount_coupon/get_not_read', param, data=>{
                if (data.length > 0) {
                    let tempData = data[0];
                    this.setState({
                        couponData: tempData,
                        dataList: data,
                    });
                    // receiveType 1注册成功 2邀请好友成功 3下单
                    if (tempData.receiveType == 1) {
                        this.setState({
                            titleImg: require("../../images/CouponHudImg/icon_newsManCouponTitle.png"),
                        });
                    }else if(tempData.receiveType == 2) {
                        this.setState({
                            titleImg: require("../../images/CouponHudImg/icon_yaoQingCouponTitle.png"),
                        });
                    }else if(tempData.receiveType == 3) {
                        this.setState({
                            titleImg: require("../../images/CouponHudImg/icon_goOrderCouponTitle.png"),
                        });
                    }
                }
            });
        }
    }
    // 移除通知事件
    componentWillUnmount(){
        // 如果存在this.timer，则使用clearTimeout清空。
        // 如果你使用多个timer，那么用多个变量，或者用个数组来保存引用，然后逐个clear
        this.timer && clearTimeout(this.timer);
    }

    render(){

        let startTime = "";
        let endTime = "";
        if (this.state.couponData) {
            // 时间转时间戳
            let date = this.state.couponData.receiveTime;
            date = date.replace(/-/g,'/');
            let timestamp = new Date(date).getTime();
            startTime = this.timestampToTime(timestamp);

            let endDate = this.state.couponData.expireTime;   // 到期时间
            endDate = endDate.replace(/-/g,'/');
            let endtimestamp = new Date(endDate).getTime();
            endTime = this.timestampToTime(endtimestamp);
        }


        return (

            <View style={styles.container}>
                <ImageBackground style={styles.bgViewStyle}
                                 source={require("../../images/CouponHudImg/icon_couponDrawHudBgView.png")}
                >
                    <Image style={styles.titleImgStyle} source={this.state.titleImg}/>

                    <Text style={styles.faceValueStyle}>{this.state.couponData.faceValue ? this.state.couponData.faceValue + "元":"0元"}</Text>

                    <Text style={styles.couponNameStyle}>{(this.state.dataList.length > 1)?this.state.couponData.name + " x" + this.state.dataList.length:this.state.couponData.name}</Text>

                    <Text style={styles.timeStyle}>{startTime + "-" + endTime}</Text>

                    <TouchableOpacity activeOpacity={1} onPress={()=>this.closeBtnClick()}>
                        <Image style={styles.knowImgStyle} source={require("../../images/CouponHudImg/icon_knowBtn.png")}/>
                    </TouchableOpacity>

                </ImageBackground>

                <TouchableOpacity activeOpacity={1} onPress={()=>this.closeBtnClick()}>
                    <Image style={styles.closeImgStyle} source={require("../../images/CouponHudImg/icon_close.png")}/>
                </TouchableOpacity>

                {/*{this.state.showGif?<View style={styles.gifBgViewStyle}>*/}
                                        {/*<Image style={styles.gifImgStyle} source={this.state.imgUrl}/>*/}
                                    {/*</View>:null}*/}

            </View>
        )
    }

    closeBtnClick() {
        let couponIdArray = [];
        for (let i = 0; i < this.state.dataList.length; i++) {
            let tempData = this.state.dataList[i];
            couponIdArray.push(tempData.id);
        }
        let param = {"userCardMedalId":couponIdArray.join(',')};
        NetService.GET("heque-coupon/discount_coupon/user_has_read", param, data=>{
            // 发送事件
            DeviceEventEmitter.emit('drawCouponNotification', '');
        }, response=>{
            // 发送事件
            DeviceEventEmitter.emit('drawCouponNotification', '');
        });
    }

    // 时间戳转时间
    timestampToTime(timestamp) {
        var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000

        var date = (date.getFullYear()) + "." +
            (date.getMonth() + 1) + "." +
            (date.getDate());
        return date;
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
        width: 590*unitWidth,
        height: 782*unitWidth,
        borderRadius: 10*unitWidth,
        alignItems: 'center',
    },

    titleImgStyle: {
        width: 216*unitWidth,
        height: 52*unitWidth,
        marginTop: 50*unitWidth,
    },

    faceValueStyle: {
        color: "#FF3F31",
        marginTop: 145*unitWidth,
        fontSize: LayoutTool.setSpText(70),
        fontWeight: 'bold',
    },
    couponNameStyle: {
        color: "#C66B0C",
        marginTop: 55*unitWidth,
        fontSize: LayoutTool.setSpText(28),
    },
    timeStyle: {
        color: "#C66B0C",
        marginTop: 12*unitWidth,
        fontSize: LayoutTool.setSpText(20),
    },

    knowImgStyle: {
        width: 399*unitWidth,
        height: 86*unitWidth,
        marginTop: 80*unitWidth,
    },
    closeImgStyle: {
        width: 52*unitWidth,
        height: 52*unitWidth,
        marginTop: 30*unitWidth,
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
