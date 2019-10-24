
import React from 'react'
import {Platform, StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, DeviceEventEmitter, Alert} from 'react-native'

import {createStackNavigator} from 'react-navigation'

import LoginView from '../Login/Login'

import MyInfoEditView from './MyInfoEditView'   // 我的信息编辑
import MyCouponListView from './MyCouponList'   // 我的优惠券列表
import MyOrderListView from './MyOrderListView' // 我的订单列表
import MyShareFriendWebView from './MyShareFriendWebView'   // 分享有礼

import LayoutTool from "../../Tools/Layout"
import {SCREEN_HEIGHT} from "../../Tools/Layout";
import {SCREEN_WIDTH, STATUSBAR_HEIGHT} from '../../Tools/Layout';
import {unitWidth} from "../../Tools/Layout";
import {fontScale} from "../../Tools/Layout";
import NetService from "../../Tools/NetService";
import Loading from "../../Tools/Loading";

import Storage from 'react-native-storage';
import asyncStorage from "@react-native-community/async-storage";

import Home from "../Home/Home"


const storage = new Storage({
    size: 1000,// 最大容量，默认值1000条数据循环存储
    storageBackend: asyncStorage, // 存储引擎：对于RN使用AsyncStorage，如果不指定则数据只会保存在内存中，重启后即丢失
    defaultExpires: null,// 数据过期时间，默认一整天（1000 * 3600 * 24 毫秒），设为null则永不过期
    enableCache: true,// 读写时在内存中缓存数据。默认启用。
    sync: {

    } // 如果storage中没有相应数据，或数据已过期,则会调用相应的sync方法，无缝返回最新数据。
});

type Props = {};
export default class Mine extends React.Component<Props>{

    static navigationOptions = ({navigation}) => {
        return {
            header:null,  //隐藏顶部导航栏
            title:'我的',
        };
    };

    // 构造
    constructor(props) {
        super(props);
        // 初始状态
        this.state = {
            data: "",
            show: false,

            couponId: "",
        };
    }

    // 接收登录成功发送的通知
    componentDidMount(){
        // 券使用调到首页点餐模块
        this.props.navigation.addListener(
            'willFocus',
            payload => {
                if (this.state.couponId) {
                    this.props.navigation.navigate('Home');
                    this.setState({
                        couponId: "",
                    })
                }
                if (!this.state.data && isLogin === true){
                    this.getUserInfoNet({'id': userId});
                }
            }
        );

        let that = this;
        this.listener =DeviceEventEmitter.addListener('loginSuccessNotification',function(param){
            console.log('...DeviceEventEmitter...');
            storage.load({
                key: 'userInfo',
            }).then(ret => {
                console.log(ret);

                that.getUserInfoNet({'id':ret.userId});
            }).catch(err => {
                console.warn(err.message);
            });
        });
        // 注册成功后通知
        this.listener =DeviceEventEmitter.addListener('registerSuccessNotification',function(param){
            storage.load({
                key: 'userInfo',
            }).then(ret => {
                console.log(ret);

                that.getUserInfoNet({'id':ret.userId});
            }).catch(err => {
                console.warn(err.message);
            });
        });

        // 已登录状态
        if (global.isLogin === true) {
            this.getUserInfoNet({'id': userId});
        }

    }
    // 移除通知事件
    componentWillUnmount(){
        this.listener.remove();
        Loading.dismiss();
    }

    render() {
        return (
            <View style={styles.container}>
                {/*<LoadingView style={styles.loadingStyle} gif='triangles' />*/}
                <ScrollView contentContainerStyle={styles.sViewStyle}>
                    {/*头部HeadView*/}
                    <View style={styles.headBgStyles}>

                        <TouchableOpacity activeOpacity={1} onPress={()=>this.headBtnClick()}>
                            <View style={styles.headIconNameViewStyle}>
                                <Image source={this.state.data ? {uri:this.state.data.portraitFid}:require('../../images/MineImg/icon_headIcon.png')} style={styles.headIconImgStyle}/>
                                <View style={styles.headNamePhoneViewStyle}>
                                    <Text style={styles.headNameStyle} allowFontScaling={false}>
                                        {global.isLogin?(this.state.data?this.state.data.petName:""):"未登录"}
                                    </Text>
                                    {this.state.data?<Text style={styles.headPhoneStyle} allowFontScaling={false}>
                                        {phoneNo.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</Text>:null}

                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity activeOpacity={1} onPress={()=>this.editBtnClick()}>
                            {this.state.data ? <View style={styles.editViewStyle}>
                                <Image source={require('../../images/MineImg/icon_right.png')} style={styles.itemRightImgStyle}/>
                            </View>:null}
                        </TouchableOpacity>

                    </View>

                    {/*第一组item*/}
                    <View style={styles.oneSectionViewStyle}>
                        <TouchableOpacity activeOpacity={0.7} onPress={()=>this.onPressTapCouponClick()}>
                            <View style={styles.itemViewStyle}>
                                <Image source={require('../../images/MineImg/icon_myCoupon.png')} style={styles.itemImgStyle}/>
                                <Text style={styles.itemTextStyle} allowFontScaling={false}>我的优惠券</Text>
                                <Image source={require('../../images/MineImg/icon_right.png')} style={styles.itemRightImgStyle}/>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.lineStyle}>
                        </View>

                        <TouchableOpacity activeOpacity={0.7} onPress={()=>this.onPressTapOrderClick()}>
                            <View style={styles.itemViewStyle}>
                                <Image source={require('../../images/MineImg/icon_myOrder.png')} style={styles.itemImgStyle}/>
                                <Text style={styles.itemTextStyle} allowFontScaling={false}>我的订单</Text>
                                <Image source={require('../../images/MineImg/icon_right.png')} style={styles.itemRightImgStyle}/>
                            </View>
                        </TouchableOpacity>

                    </View>

                    <View style={styles.otherSectionViewStyle}>
                        <TouchableOpacity activeOpacity={0.7} onPress={()=>this.onPressTapShareClick()}>
                            <View style={styles.itemViewStyle}>
                                <Image source={require('../../images/MineImg/icon_friendGift.png')} style={styles.itemImgStyle}/>
                                <Text style={styles.itemTextStyle} allowFontScaling={false}>邀请有礼</Text>
                                <Image source={require('../../images/MineImg/icon_right.png')} style={styles.itemRightImgStyle}/>
                            </View>
                        </TouchableOpacity>

                    </View>

                    {/*<View style={styles.otherSectionViewStyle}>*/}
                        {/*<TouchableOpacity activeOpacity={0.7} onPress={()=>this.onPressTapNewsClick()}>*/}
                            {/*<View style={styles.itemViewStyle}>*/}
                                {/*<Image source={require('../../images/MineImg/icon_News.png')} style={styles.itemImgStyle}/>*/}
                                {/*<Text style={styles.itemTextStyle} allowFontScaling={false}>行业资讯</Text>*/}
                                {/*<Image source={require('../../images/MineImg/icon_right.png')} style={styles.itemRightImgStyle}/>*/}
                            {/*</View>*/}
                        {/*</TouchableOpacity>*/}

                    {/*</View>*/}

                    {/*退出登录View*/}
                    {this.state.data ? <TouchableOpacity activeOpacity={0.7} onPress={()=>this.onPressTapLoginOutClick()}>
                        <View style={styles.outLoginViewStyle}>
                            <Text style={styles.outLoginTextStyle} allowFontScaling={false}>退出登录</Text>
                        </View>
                    </TouchableOpacity>:null}

                </ScrollView>

                <Loading ref={(view)=>{Loading.loadingDidCreate(view)}}>
                </Loading>
            </View>
        );
    }

    // 头像按钮点击
    headBtnClick() {
        if (global.isLogin === false) {
            this.props.navigation.push('LoginView');
        }
    }

    // 用户信息编辑按钮点击
    editBtnClick() {
        if (global.isLogin === true) {
            this.props.navigation.push('MyInfoEditView');
        }
    }

    // 我的优惠券
    onPressTapCouponClick(){
        if (global.isLogin === true) {
            this.props.navigation.navigate('MyCouponListView', {
                callback: (data) => {
                    this.setState({
                        couponId: data,
                    })
                }
            });
        }else {
            this.props.navigation.push('LoginView');
        }

    }
    // 我的订单
    onPressTapOrderClick(){
        if (global.isLogin === true) {
            this.props.navigation.push('MyOrderListView');
        }else {
            this.props.navigation.push('LoginView');
        }
    }
    // 邀请有礼
    onPressTapShareClick(){
        if (global.isLogin === true) {
            this.props.navigation.push('MyShareFriendWebView');
        }else {
            this.props.navigation.push('LoginView');
        }
    }
    // 行业资讯按钮
    onPressTapNewsClick() {
        if (global.isLogin === true) {

        }else {
            this.props.navigation.push('LoginView');
        }
    }

    // 退出登录
    onPressTapLoginOutClick() {
        Alert.alert('确认退出登录？', '',
            [
                {text: '取消'},
                {
                    text: '确认',
                    onPress: () => {
                        global.isLogin = false;
                        global.phoneNo = "";
                        global.userId = "";
                        storage.remove({
                            key: 'userInfo'
                        });
                        // 删除数据
                        this.setState({
                            data: "",
                        });
                        DeviceEventEmitter.emit('outLoginNotification', '1');
                    }
                }
            ],
            {cancelable: false}
        )
    }


    // 获取用户信息数据
    getUserInfoNet(param) {
        console.log('getUserInfoNet');
        Loading.showLoading();
        NetService.POST('heque-user/user/getUserPortraitAndPetName', param, data=>{
            Loading.dismiss();
            this.setState({
                data: data,
            })
        }, response=>{
            Loading.dismiss();
            if (response.code === NetService.Token_Lose) {
                global.isLogin = false;
                // 删除数据
                this.setState({
                    data: "",
                })
            }
        });
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#222224',
    },
    sViewStyle: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#222224',
        width: SCREEN_WIDTH,
        height:SCREEN_HEIGHT,
    },
    loadingStyle:{
        position: 'absolute',
        marginTop: SCREEN_HEIGHT/2,
    },
    headBgStyles: {
        backgroundColor: '#2F2F30',
        width: SCREEN_WIDTH,
        height: STATUSBAR_HEIGHT + 305*unitWidth,

        // 设置主轴方向  row:水平  column:竖直
        flexDirection: 'row',
        // 设置主轴对齐方式
        justifyContent:'space-between',
    },
    headIconNameViewStyle: {
        backgroundColor: '#2F2F30',
        width: 500*unitWidth,
        height: 120*unitWidth,
        marginTop: STATUSBAR_HEIGHT + 109*unitWidth,

        // 设置主轴方向  row:水平  column:竖直
        flexDirection: 'row',
    },
    headIconImgStyle: {
        width: 120*unitWidth,
        height: 120*unitWidth,
        marginLeft: 37*unitWidth,
        borderRadius: 60*unitWidth,
    },
    headNamePhoneViewStyle: {
        backgroundColor: '#2F2F30',
        marginLeft: 26*unitWidth,
        width: 320*unitWidth,
        height: 120*unitWidth,
    },
    headNameStyle: {
        marginTop: 16*unitWidth,
        color: '#F2D3AB',
        fontSize: LayoutTool.setSpText(32),//16*fontScale,
        fontWeight: 'bold',
    },
    headPhoneStyle: {
        marginTop: 16*unitWidth,
        color: '#8B8782',
        fontSize: 12*fontScale,
    },

    editViewStyle:{
        backgroundColor: '#2F2F30',
        width: LayoutTool.scaleSize(100),
        height: 120*unitWidth,
        marginTop: STATUSBAR_HEIGHT + 109*unitWidth,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editStyle: {
        width: 160*unitWidth,
        height: 60*unitWidth,
        marginRight: -30*unitWidth,
        marginTop: 25*unitWidth,
    },

    oneSectionViewStyle: {
        alignItems: 'center',
        backgroundColor: '#2F2F30',
        width: SCREEN_WIDTH,
        height: 241*unitWidth,

        marginTop: 15*unitWidth,
    },
    itemViewStyle: {
        backgroundColor: '#2F2F30',
        width: SCREEN_WIDTH,
        height: 120*unitWidth,
        // 设置主轴方向  row:水平  column:竖直
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemImgStyle: {
        width: LayoutTool.scaleSize(60),
        height: LayoutTool.scaleSize(60),
        marginLeft: 30*unitWidth,
    },
    itemTextStyle: {
        marginLeft: 15*unitWidth,
        color: '#F2D3AB',
        fontSize: LayoutTool.setSpText(32),//16*fontScale,
    },
    itemRightImgStyle: {
        width: 15*unitWidth,
        height: 24*unitWidth,
        marginLeft: 688*unitWidth,
        position: 'absolute',
    },

    lineStyle: {
        width: SCREEN_WIDTH - 146*unitWidth,
        height: 1,
        backgroundColor: '#39393B',
        marginLeft: 110*unitWidth,
        marginRight: 36*unitWidth,
    },

    otherSectionViewStyle: {
        alignItems: 'center',
        backgroundColor: '#2F2F30',
        width: SCREEN_WIDTH,
        height: 120*unitWidth,

        marginTop: 15*unitWidth,
    },

    outLoginViewStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2F2F30',
        width: SCREEN_WIDTH,
        height: 80*unitWidth,

        marginTop: 15*unitWidth,
    },
    outLoginTextStyle: {
        color: '#F2D3AB',
        fontSize: LayoutTool.setSpText(30),//15*fontScale,
    },
});

