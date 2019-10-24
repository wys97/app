

// 券单种类型领取View

import React from 'react'
import {StyleSheet, View, Text, TouchableOpacity, Image, DeviceEventEmitter, ImageBackground} from 'react-native'

import {SCREEN_WIDTH, STATUSBAR_HEIGHT, unitWidth} from '../../Tools/Layout';
import LayoutTool from '../../Tools/Layout'
import NetService from '../../Tools/NetService'

export default class RedPackageGifManyView extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            shareArray: [],
            orderArray: [],

            newsData: "",
            shareData: "",
            orderData: "",
            couponIdArray: [],      // 存放券的ID数组

            imgUrl: require("../../images/CouponHudImg/icon_couponcutter.gif"),   // GIF图地址

            showGif: true, // 是否展示GIF图

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
                console.log('2s后动画结束操作');
                this.setState({
                    showView: true,
                });
            }, 500
        );

        if (global.userId) {
            let param = {"userId":userId};
            NetService.GET('heque-coupon/discount_coupon/get_not_read', param, data=>{
                let tempShareArr = [];
                let orderTempArr = [];
                let idArray = [];
                data.sort(function (a, b) {
                    return (a.receiveType - b.receiveType)
                });
                // receiveType 1注册成功 2邀请好友成功 3下单
                for (let i = 0; i < data.length; i ++) {
                    let tempData = data[i];
                    idArray.push(tempData.id);
                    if (tempData.receiveType == 1) {
                        this.setState({
                            newsData: tempData,
                        });
                    } else if (tempData.receiveType == 2) {
                        tempShareArr.push(tempData);
                        this.setState({
                            shareData: tempData,
                        });
                    } else if (tempData.receiveType == 3) {
                        orderTempArr.push(tempData);
                        this.setState({
                            orderData: tempData,
                        });
                    }
                }
                this.setState({
                    shareArray: tempShareArr,
                    orderArray: orderTempArr,
                    couponIdArray: idArray,
                });
                // 有下单红包
                if (orderTempArr.length > 0) {
                    this.setState({
                        imgUrl: require("../../images/CouponHudImg/icon_couponcutter.gif"),
                        showGif: true,
                    });
                    this.timer = setTimeout(() => {
                            console.log('2s后动画结束操作');
                            this.setState({
                                showGif: false,
                                imgUrl: null,
                            });
                        }, 2000
                    );
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
        if (this.state.newsData) {
            let date = this.state.newsData.receiveTime;
            date = date.replace(/-/g,'/');
            let timestamp = new Date(date).getTime();
            startTime = this.timestampToTime(timestamp);

            let endDate = this.state.newsData.expireTime;   // 到期时间
            endDate = endDate.replace(/-/g,'/');
            let endtimestamp = new Date(endDate).getTime();
            endTime = this.timestampToTime(endtimestamp);
        }

        let shareStartTime = "";
        let shareEndTime = "";
        let shareLength = "";
        if (this.state.shareData) {
            let date = this.state.shareData.receiveTime;
            date = date.replace(/-/g,'/');
            let timestamp = new Date(date).getTime();
            shareStartTime = this.timestampToTime(timestamp);

            let endDate = this.state.shareData.expireTime;   // 到期时间
            endDate = endDate.replace(/-/g,'/');
            let endtimestamp = new Date(endDate).getTime();
            shareEndTime = this.timestampToTime(endtimestamp);

            shareLength = this.state.shareArray.length;
        }

        let orderStartTime = "";
        let orderEndTime = "";
        let orderLength = "";
        if (this.state.orderData) {
            let date = this.state.orderData.receiveTime;
            date = date.replace(/-/g,'/');
            let timestamp = new Date(date).getTime();
            orderStartTime = this.timestampToTime(timestamp);

            let endDate = this.state.orderData.expireTime;   // 到期时间
            endDate = endDate.replace(/-/g,'/');
            let endtimestamp = new Date(endDate).getTime();
            orderEndTime = this.timestampToTime(endtimestamp);

            orderLength = this.state.orderArray.length;
        }

        return (
            <View style={styles.container}>
                {this.state.showView?<ImageBackground style={styles.bgViewStyle}
                                                      source={require("../../images/CouponHudImg/icon_manyTypeCouponBgImg.png")}
                >
                    <Image style={styles.titleImgStyle} source={require("../../images/CouponHudImg/icon_couponNameTitle.png")}/>

                    <View style={styles.oneViewStyle}>
                        <View style={styles.leftViewStyle}>
                            <Text style={styles.faceValueStyle}>{this.state.newsData?this.state.newsData.faceValue:this.state.shareData?this.state.shareData.faceValue:""}</Text>
                            <Text style={{
                                color: "#FF3F31",
                                fontSize: LayoutTool.setSpText(20),
                                marginLeft: 4*unitWidth,
                                marginTop: LayoutTool.scaleSize(24),
                            }}>元</Text>
                        </View>

                        <View style={styles.rightViewStyle}>
                            <Text style={styles.couponNameStyle}>{this.state.newsData?this.state.newsData.name:this.state.shareData?this.state.shareData.name + "x" + this.state.shareArray.length:""}</Text>
                            <Text style={styles.timeStyle}>{this.state.newsData?startTime + "-" + endTime : shareStartTime + "-" + shareEndTime}</Text>
                        </View>

                    </View>


                    <View style={styles.twoViewStyle}>
                        <View style={styles.leftViewStyle}>
                            <Text style={styles.faceValueStyle}>{this.state.newsData?(this.state.shareData?this.state.shareData.faceValue:this.state.orderData.faceValue):(this.state.orderData.faceValue?this.state.orderData.faceValue:'0')}</Text>
                            <Text style={{
                                color: "#FF3F31",
                                fontSize: LayoutTool.setSpText(20),
                                marginLeft: 4*unitWidth,
                                marginTop: LayoutTool.scaleSize(24),
                            }}>元</Text>
                        </View>

                        <View style={styles.rightViewStyle}>
                            <Text style={styles.couponNameStyle}>{this.state.newsData?(this.state.shareData?this.state.shareData.name + " x" + this.state.shareArray.length:this.state.orderData.name + " x" + this.state.orderArray.length):(this.state.orderData.name?this.state.orderData.name:"") + " x" + this.state.orderArray.length}</Text>
                            <Text style={styles.timeStyle}>{this.state.newsData?(this.state.shareData?shareStartTime + "-" + shareEndTime:orderStartTime + "-" + orderEndTime): orderStartTime + "-" + orderEndTime}</Text>
                        </View>
                    </View>


                    <TouchableOpacity activeOpacity={1} onPress={()=>this.closeBtnClick()}>
                        <Image style={styles.knowImgStyle} source={require("../../images/CouponHudImg/icon_knowBtn.png")}/>
                    </TouchableOpacity>

                </ImageBackground>:null}


                <TouchableOpacity activeOpacity={1} onPress={()=>this.closeBtnClick()}>
                    <Image style={styles.closeImgStyle} source={require("../../images/CouponHudImg/icon_close.png")}/>
                </TouchableOpacity>

                {this.state.showGif?<View style={styles.gifBgViewStyle}>
                    <Image style={styles.gifImgStyle} source={this.state.imgUrl}/>
                </View>:null}

            </View>
        )
    }

    closeBtnClick() {
        let param = {"userCardMedalId":this.state.couponIdArray.join(',')};
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
        width: 400*unitWidth,
        height: 49*unitWidth,
        marginTop: 50*unitWidth,
    },

    oneViewStyle: {
        width: 427*unitWidth,
        height: 127*unitWidth,
        marginTop: 115*unitWidth,
        flexDirection: 'row',
    },

    twoViewStyle: {
        width: 427*unitWidth,
        height: 127*unitWidth,
        marginTop: 10*unitWidth,
        flexDirection: 'row',
    },
    leftViewStyle: {
        width: 138*unitWidth,
        height: 127*unitWidth,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: LayoutTool.scaleSize(10),
        marginLeft: LayoutTool.scaleSize(8),
    },
    rightViewStyle: {
        width: 290*unitWidth,
        height: 127*unitWidth,
        alignItems: 'center',
        justifyContent: 'center',
    },

    faceValueStyle: {
        color: "#FF3F31",
        fontSize: LayoutTool.setSpText(55),
        fontWeight: 'bold',
    },
    couponNameStyle: {
        color: "#C66B0C",
        fontSize: LayoutTool.setSpText(28),
        marginTop: LayoutTool.scaleSize(16),
    },
    timeStyle: {
        color: "#C66B0C",
        fontSize: LayoutTool.setSpText(20),
        marginTop: 12*unitWidth,
    },

    knowImgStyle: {
        width: 399*unitWidth,
        height: 86*unitWidth,
        marginTop: 45*unitWidth,
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
