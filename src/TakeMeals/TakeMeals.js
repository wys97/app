

import React from 'react'
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    ScrollView,
    ImageBackground,
    Linking,
    DeviceEventEmitter,
    Alert, ActionSheetIOS, Modal
} from 'react-native'

import {ANDROID, IOS, SCREEN_WIDTH, unitWidth} from "../../Tools/Layout";
import LayoutTool from "../../Tools/Layout"

import LoginView from '../Login/Login'
import MyOrderListView from '../Mine/MyOrderListView'   // 我的订单列表

import Carousel, { Pagination } from 'react-native-snap-carousel';
import NetService from "../../Tools/NetService";
import LoadingView from "../../Tools/Loading";
import ToastView from "../../Tools/ToastHudView";
import MapUntil from "../../Tools/MapUntil"

import * as WeChat from 'react-native-wechat';

import PayRedPackageShowView from "../Hud/PayRedPackageShowView"
import RedPackageNoPrize from "../Hud/RedPackageNoPrize"
import RedPackageGifManyView from "../Hud/RedPackageGifManyView"
import RedPackageGifShowView from "../Hud/RedPackageGifShowView"
import SelectCouponView from "./SelectUseCouponView"    // 选择优惠券
import Home from "../Home/Home"


const Rad = ((d)=>{
    return d * Math.PI / 180.0;//经纬度转换成三角函数中度分表形式。
});

export default class TakeMeals extends React.Component{

    static navigationOptions = ({navigation}) => {
        return {
            title:'取餐',
            headerLeft: <View/>,
            headerRight: (
                <TouchableOpacity activeOpacity={0.7} onPress={() =>that.canCelOrderNet()}>
                    <View style={{width:LayoutTool.scaleSize(100), height:44, justifyContent: "center"}}>
                        <Image style={{marginLeft:LayoutTool.scaleSize(25),
                                        width: LayoutTool.scaleSize(44),
                                        height: LayoutTool.scaleSize(8),}}
                               source={require("../../images/TakeMealsImg/icon_navRightD.png")}/>
                    </View>
                </TouchableOpacity>
            ),
        }
    };

    canCelOrderNet(){
        if(this.state.dataList.length === 0){
            ToastView.showShortHudView("您当前无餐可取");
            return false;
        }else {
            if (this.state.showCancelView === false) {
                this.setState({
                    showCancelView: true,
                })
            } else {
                this.setState({
                    showCancelView: false,
                })
            }
        }
    }

    constructor(props) {
        super(props);
        that = this;
        // 初始状态
        this.state = {
            dataList: [],       // 存放订单模型数组

            slider1ActiveSlide: 0,      // 当前显示View的下标

            weChatLoginViewShow: true,  // 判断是否有安装微信

            showCancelView: false,  // 是否显示取消订单View

            useCouponDataList: [],  // 可用使用的券数组

            noPayOrderId: "",       // 未支付订单Id

            selectCouponData: "",   // 选中的优惠券数据模型

            selectCouponId: "",       // 选中的优惠券Id

            realPayPrice: "",       // 实际支付金额

            showGifView: false,         // 红包动画弹框\是否展示领券View

            showMoreView: false,    // 是否展示多种领券View

            showPayRedView: false,  // 是否展示支付提示红包弹框

            showNoPayReadPriceView: false,  // 支付红包领取金额为0元

            redPackageShowTag: "",  // 1:单张下单  2:多张下单  3:多种类型的包含下单

            drawCouponArray: [],    // 券领取数组
        };

        this.setUpOrderInfoView = this.setUpOrderInfoView.bind(this)
    }

    // 移除通知事件
    componentWillUnmount(){
        this.listener.remove();
    }
    componentDidMount(){
        this.props.navigation.addListener(
            'willFocus',
            payload => {
                if (global.isLogin === true) {
                    this.getTakeMealsNet();
                }
            }
        );

        WeChat.registerApp('wx589d650bd9ecd315');

        WeChat.isWXAppInstalled()
            .then( ( isInstalled ) => {
                if ( isInstalled ) {
                    this.setState({
                        weChatLoginViewShow: true,
                    })
                } else { // 没有安装微信
                    this.setState({
                        weChatLoginViewShow: false,
                    })
                }
            } );

        // 获取网络请求
        let that = this;
        this.listener =DeviceEventEmitter.addListener('loginSuccessNotification',function(param){
            if (global.isLogin === true) {
                // 查询订单数据
                that.getTakeMealsNet();
            }
        });
        // 取消订单通知
        this.listener =DeviceEventEmitter.addListener('cancelOrderNotification',function(param){
            that.setState({
                selectCouponData: "",   // 选中的优惠券数据模型

                selectCouponId: "",       // 选中的优惠券Id

                realPayPrice: "",       // 实际支付金额
            });
            if (ANDROID) {
                // 查询订单数据
                that.getOrderNetData({"userId": userId});
                that.setState({
                    dataList: [],
                });
            }
        });
        // 退出登录事件通知
        this.listener =DeviceEventEmitter.addListener('outLoginNotification',function(param){
            that.setState({
                dataList: [],

                slider1ActiveSlide: 0,      // 当前显示View的下标

                weChatLoginViewShow: true,  // 判断是否有安装微信

                showCancelView: false,  // 是否显示取消订单View

                useCouponDataList: [],  // 可用使用的券数组

                noPayOrderId: "",       // 未支付订单Id

                selectCouponData: "",       // 选中的优惠券
            });
        });

        // 领取优惠券通知
        this.listener =DeviceEventEmitter.addListener('drawCouponNotification',function(type){
            that.setState({
                showGifView: false,
                showMoreView: false,
                redPackageShowTag: "",
            });
        });
        // 关闭支付红包提示框通知(拆红包)
        this.listener =DeviceEventEmitter.addListener('openPayReadNotification',function(type){
            // 未领取的单张下单券
            that.setState({
                showPayRedView: false,
            });
            // 1:单张下单  2:多张下单  3:多种类型的包含下单
            if (that.state.redPackageShowTag == 1) {
                let tempData = that.state.drawCouponArray[0];
                if (tempData.faceValue) {
                    that.setState({
                        showGifView: true,
                        showMoreView: false,
                    });
                } else {
                    that.setState({
                        showGifView: false,
                        showMoreView: false,
                        showNoPayReadPriceView: true,
                    });
                }
            } else if (that.state.redPackageShowTag == 2) {// 未领取的多张下单券
                that.setState({
                    showGifView: true,
                    showMoreView: false,
                });
            } else if (that.state.redPackageShowTag == 3) {// 未领取的多种类型券包含下单券
                that.setState({
                    showGifView: false,
                    showMoreView: true,
                });
            }
        });


        // 没有支付红包金额
        this.listener =DeviceEventEmitter.addListener('closeNoPayReadNotification',function(type){
            that.setState({
                showNoPayReadPriceView: false,
            });
        });

        // 确认订单界面支付成功
        this.listener =DeviceEventEmitter.addListener('sureOrderPaySuccessNotification',function(type){
            that.getDrawCouponNet();
        });
    }
    // 获取网络请求
    getTakeMealsNet(){
        // 查询订单数据
        this.getOrderNetData({"userId": userId});
    }

    // 查询订单数据
    getOrderNetData(param) {
        NetService.GET("heque-eat/eat/no_meal_order_info", param, data=>{
            this.setState({
                dataList: data,
                noPayOrderId: "",
            });

            for (let i = 0; i < data.length; i++) {
                var tempData = data[i];
                if (tempData.state == 1 || tempData.state == 2) {
                    this.setState({
                        noPayOrderId: tempData.id,
                    });
                }
            }
            if (data.length > 0) {
                console.log(data.length + "......slider1ActiveSlide....." + this.state.slider1ActiveSlide);
                if(data.length <= this.state.slider1ActiveSlide + 1){
                    this.setState({
                        slider1ActiveSlide: data.length-1,
                    });
                }
                if (this.state.noPayOrderId) {
                    // 查询是否有可使用的券
                    this.getUseCouponNetData({"orderId":this.state.noPayOrderId});
                }
            }else {
                this.setState({
                    slider1ActiveSlide: 0,
                });
            }
        }, response=>{
            if (response.code === NetService.Token_Lose) {
                global.isLogin = false;
                // 删除数据
                this.setState({
                    dataList: [],

                    slider1ActiveSlide: 0,      // 当前显示View的下标

                    weChatLoginViewShow: true,  // 判断是否有安装微信

                    showCancelView: false,  // 是否显示取消订单View

                    useCouponDataList: [],  // 可用使用的券数组

                    noPayOrderId: "",       // 未支付订单Id

                    selectCouponData: "",       // 选中的优惠券
                })
            }
        });
    }
    // 查询是否有券可以使用
    getUseCouponNetData(param) {
        NetService.GET("heque-coupon/discount_coupon/query_card_rolls_use", param, data=>{
            var useArray = [];
            for (let i = 0; i < data.length; i++) {
                var couponData = data[i];
                // type 1:不可使用   2:可使用
                if (couponData.type == 2) {
                    useArray.push(couponData);
                }
            }
            this.setState({
                useCouponDataList: useArray,
            })
        }, response=>{
            if (response.code === NetService.Token_Lose) {
            global.isLogin = false;
            // 删除数据
            this.setState({
                dataList: [],

                slider1ActiveSlide: 0,      // 当前显示View的下标

                weChatLoginViewShow: true,  // 判断是否有安装微信

                showCancelView: false,  // 是否显示取消订单View

                useCouponDataList: [],  // 可用使用的券数组

                noPayOrderId: "",       // 未支付订单Id

                selectCouponData: "",       // 选中的优惠券
            })
        }
        });
    }

    // 点击取消订单按钮网络请求
    rightOrderBtnClick(){
        if (global.isLogin) {
            let index = this.state.slider1ActiveSlide;
            let data = this.state.dataList[index];
            LoadingView.showLoading();
            let param = {"id":data.id};
            NetService.GET("heque-eat/eat/delete_order", param, data=>{
                LoadingView.dismiss();

                if (ANDROID) {
                    this.setState({
                        dataList: [],
                    });
                }
                this.setState({

                    selectCouponData: "",   // 选中的优惠券数据模型

                    selectCouponId: "",       // 选中的优惠券Id

                    realPayPrice: "",       // 实际支付金额

                    showCancelView: false,
                    slider1ActiveSlide: 0,      // 当前显示View的下标
                });
                // 查询订单数据
                this.getOrderNetData({"userId": userId});
                ToastView.showShortHudView("订单取消成功");
            }, response=>{
                this.setState({
                    showCancelView: false,
                });
                LoadingView.dismiss();
                if (response.code === NetService.Token_Lose) {
                    global.isLogin = false;
                    // 删除数据
                    this.setState({
                        dataList: [],
                    })
                }
            });
        }
    }

    // 查询是否有领取的优惠券
    getDrawCouponNet(){
        // 获取是否有券可以领取
        let param = {"userId":userId};
        NetService.GET('heque-coupon/discount_coupon/get_not_read', param, data=>{
            data.sort(function (a, b) {
                return (a.receiveType - b.receiveType)
            });
            this.setState({
                drawCouponArray: data,
            });
            // receiveType 1注册成功 2邀请好友成功 3下单
            let orderArray = [];
            let shareArray = [];
            if (data.length > 1) {
                for (let i = 0; i < data.length; i++) {
                    let tempData = data[i];
                    if (tempData.receiveType == 2) {
                        shareArray.push(tempData);
                    } else if (tempData.receiveType == 3) {
                        orderArray.push(tempData);
                    }
                }
                // 有多种类型的券
                if (shareArray.length > 0 && orderArray.length > 0) {
                    this.setState({
                        showPayRedView: true,
                        redPackageShowTag: "3",
                    });
                } else { // 单种类型的券
                    // 显示支付红包券提示框
                    if (orderArray.length > 0) {
                        this.setState({
                            redPackageShowTag: "2",
                            showPayRedView: true,
                        });
                    }else {
                        this.setState({
                            showGifView: true,
                            showMoreView: false,
                            showPayRedView: false,
                        });
                    }
                }
            } else {
                if (data.length === 1) {
                    let tempData = data[0];
                    // 显示支付红包券提示框
                    if (tempData.receiveType == 3) {
                        console.log("显示支付红包券提示框");
                        this.setState({
                            redPackageShowTag: "1",
                            showPayRedView: true,
                        });
                    }else {
                        this.setState({
                            showGifView: true,
                            showMoreView: false,
                            showPayRedView: false,
                        });
                    }
                } else {
                    this.setState({
                        showGifView: false,
                        showMoreView: false,
                        showPayRedView: false,
                    });
                }
            }

        });
    }


    render(){
        return (
            <View style={styles.container}>

                {this.setUpView(this.state.dataList)}

                {/*取消订单按钮弹框*/}
                {this.state.showCancelView?<TouchableOpacity style={{height:LayoutTool.scaleSize(89),//89*unitWidth,
                                                                    width:SCREEN_WIDTH,
                                                                    position: "absolute",
                                                                    flexDirection:'row',
                                                                    justifyContent:'flex-end'}}
                                                             activeOpacity={0.7}
                                                             onPress={()=>this.rightOrderBtnClick()}>
                    <Image style={{height:LayoutTool.scaleSize(89), width:LayoutTool.scaleSize(231),}}
                           source={require("../../images/TakeMealsImg/icon_cancelOrder.png")}>
                    </Image>
                </TouchableOpacity>:null}

                <Modal animationType={'none'}
                       transparent={true}
                       visible={this.state.showPayRedView}>
                    <PayRedPackageShowView>

                    </PayRedPackageShowView>
                </Modal>

                <Modal animationType={'none'}
                       transparent={true}
                       visible={this.state.showNoPayReadPriceView}>
                    <RedPackageNoPrize>

                    </RedPackageNoPrize>
                </Modal>

                <Modal animationType={'none'}
                       transparent={true}
                       visible={this.state.showGifView}>
                    <RedPackageGifShowView>

                    </RedPackageGifShowView>
                </Modal>

                <Modal animationType={'none'}
                       transparent={true}
                       visible={this.state.showMoreView}>
                    <RedPackageGifManyView>

                    </RedPackageGifManyView>
                </Modal>

                <LoadingView ref={(view)=>{LoadingView.loadingDidCreate(view)}}>
                </LoadingView>
            </View>
        )
    }

    setUpView(dataList){
        if (dataList.length > 0){

            let index = "";
            if (dataList.length < (this.state.slider1ActiveSlide + 1)) {
                index = this.state.slider1ActiveSlide - 1;
            }else {
                index = this.state.slider1ActiveSlide;
            }

            return (
                <View style={styles.container}>
                    <Carousel data={dataList}
                              renderItem={this._renderItem}
                              itemWidth={SCREEN_WIDTH}
                              sliderWidth={SCREEN_WIDTH}
                              showSpinner={true}
                              onSnapToItem={(index) =>
                                  this.setState({ slider1ActiveSlide: index })
                              }
                    >
                    </Carousel>

                    {(dataList.length > 1)?<Pagination
                        containerStyle={{
                            paddingVertical: 25*unitWidth,
                        }}
                        dotsLength={dataList.length}
                        activeDotIndex={index}
                        dotColor={'rgba(114, 114, 114, 1)'}
                        dotStyle={{
                            width: 16*unitWidth,
                            height: 16*unitWidth,
                            borderRadius: 8*unitWidth,
                        }}
                        inactiveDotColor={'rgba(114, 114, 114, 0.6)'}
                        inactiveDotScale={1}
                    />:<View style={{
                        width: SCREEN_WIDTH,
                        height: 66*unitWidth,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <View style={{width: 16*unitWidth,
                                    height: 16*unitWidth,
                                    borderRadius: 8*unitWidth,
                                    backgroundColor:'#727272'}}/>
                    </View>}

                </View>
            )
        } else {
            return(
                <View style={styles.noDataBgViewStyle}>
                    <Image style={{
                        marginTop: LayoutTool.scaleSize(20),
                        width: LayoutTool.scaleSize(672),
                        height: LayoutTool.scaleSize(735),
                    }} source={require('../../images/TakeMealsImg/icon_noTakeMeals.png')}/>

                    <TouchableOpacity activeOpacity={0.7} onPress={()=>this.goBtnClick()}>

                        <Image style={styles.goEatImageStyle} source={require("../../images/TakeMealsImg/icon_takeMealsGoEat.png")}/>

                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity={0.7} onPress={()=>this.orderBtnClick()}>
                        <View style={{
                            flexDirection: 'row',
                            marginTop: 38*unitWidth,
                        }}>
                            <Text style={{
                                fontSize: LayoutTool.setSpText(28),
                                color: '#DFB881',
                            }}>历史订单</Text>
                            <Image style={{
                                marginLeft: 14*unitWidth,
                                width: 15*unitWidth,
                                height: 24*unitWidth,
                                marginTop: 4*unitWidth,
                            }} source={require('../../images/TakeMealsImg/icon_takeMealsRight.png')}/>
                        </View>
                    </TouchableOpacity>
                </View>
            )
        }
    }

    _renderItem({item, index}) {
        // 1未完成 (用户添加订单未支付)  2失败(微信支付失败)  3已完成(支付完成)  4已取消(支付订单取消) 5 退款中(用户发起退款)
        // 6退款失败(微信返回失败) 7退款成功(微信返回成功) 8.拒绝退款 9取消退款

        if (item.state == 1 || item.state == 2) { //未支付订单
            let color = '#8B8782';
            if (that.state.selectCouponData){
                color = '#F2D3AB';
            } else {
                color = '#8B8782';
            }
            let couponTextStyle = {
                fontSize: LayoutTool.setSpText(24),
                color: color,
                marginRight: LayoutTool.scaleSize(10),//10*unitWidth,
            };

            return (
                <View style={styles.carouselItemBgViewStyle}>
                    <ScrollView showsVerticalScrollIndicator={false}>

                        {that.setUpNoPayHeadInfoView(item)}

                        <View style={styles.couponSelectViewStyle}>

                            <View style={{
                                    backgroundColor: '#39393B',
                                    height: LayoutTool.scaleSize(1),
                                    marginLeft: LayoutTool.scaleSize(36),
                                    marginRight: LayoutTool.scaleSize(36),
                            }}/>

                            <TouchableOpacity activeOpacity={1} onPress={()=>that.couponBtnClick()}>
                                <View style={styles.couponSelectInfoViewStyle}>
                                    <Text style={{ fontSize: LayoutTool.setSpText(30),
                                                    color: "#F2D3AB",
                                                    marginLeft: LayoutTool.scaleSize(42),//42*unitWidth,
                                            }}>优惠券</Text>
                                    <View style={{height:LayoutTool.scaleSize(80), flexDirection: 'row', alignItems:'center'}}>

                                        <Text style={couponTextStyle}>{that.state.selectCouponData?"-￥"+that.state.selectCouponData.faceValue:that.state.useCouponDataList.length>0?"请选择优惠券":"暂无优惠券可用"}</Text>

                                        <Image style={{
                                                        width: LayoutTool.scaleSize(10),//10*unitWidth,
                                                        height: LayoutTool.scaleSize(15),//15*unitWidth,
                                                        marginRight: LayoutTool.scaleSize(30),//30*unitWidth,
                                        }} source={require("../../images/TakeMealsImg/icon_rightCoupon.png")}>
                                        </Image>

                                    </View>
                                </View>
                            </TouchableOpacity>

                            <View style={{
                                backgroundColor: '#39393B',
                                height: LayoutTool.scaleSize(1),
                                marginLeft: LayoutTool.scaleSize(36),
                                marginRight: LayoutTool.scaleSize(36),
                            }}/>
                        </View>

                        <View style={styles.totalPriceViewStyle}>
                            <Text style={{
                                        fontWeight: 'bold',
                                        fontSize: LayoutTool.setSpText(30),
                                        color: '#F2D3AB',
                                        marginLeft: LayoutTool.scaleSize(42),//42*unitWidth,
                                        marginTop: LayoutTool.scaleSize(20),//20*unitWidth,
                            }}>合计</Text>

                            <View style={{  flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            height: LayoutTool.scaleSize(80),//80*unitWidth
                                    }}>
                                <Text style={{
                                    fontSize: LayoutTool.setSpText(26),
                                    color: '#F2D3AB',
                                    marginRight: LayoutTool.scaleSize(4),//4*unitWidth,
                                    marginTop: LayoutTool.scaleSize(40),//40*unitWidth,
                                }}>￥</Text>

                                <Text style={{
                                    fontWeight: 'bold',
                                    fontSize: LayoutTool.setSpText(38),
                                    color: '#F2D3AB',
                                    marginTop: LayoutTool.scaleSize(30),//30*unitWidth,
                                    marginRight: LayoutTool.scaleSize(30),//30*unitWidth,
                                }}>{that.state.selectCouponData?(that.state.realPayPrice<0?0:that.state.realPayPrice):item.paymentPrice}</Text>

                            </View>

                        </View>

                        <Image style={styles.gapImgStyle}
                               source={require("../../images/TakeMealsImg/icon_gap.png")}>
                        </Image>

                        <Image style={{
                                        width: LayoutTool.scaleSize(670),
                                        height:LayoutTool.scaleSize(100),
                                }}
                               source={require("../../images/TakeMealsImg/icon_weChatPay.png")}>
                        </Image>

                        <Image style={styles.gapImgStyle}
                               source={require("../../images/TakeMealsImg/icon_gap.png")}>
                        </Image>

                        {that.setUpOrderInfoView(item)}

                        <View style={{
                                    backgroundColor:'#2F2F30',
                                    marginLeft: LayoutTool.scaleSize(20),//20*unitWidth,
                                    marginRight: LayoutTool.scaleSize(20),//20*unitWidth,
                                    height: LayoutTool.scaleSize(80),//80*unitWidth,
                                    borderBottomRightRadius: LayoutTool.scaleSize(10),//10*unitWidth,
                                    borderBottomLeftRadius: LayoutTool.scaleSize(10),//10*unitWidth,
                                }}>
                        </View>

                    </ScrollView>

                    <ImageBackground style={styles.bottomSurePayBgViewStyle}
                                     source={require("../../images/TakeMealsImg/icon_surePayBgImg.png")}>
                        <TouchableOpacity activeOpacity={1} onPress={()=>that.payBtnClick(item)}>
                            <Image style={{
                                        width: LayoutTool.scaleSize(633),
                                        height: LayoutTool.scaleSize(84),
                                        marginTop: LayoutTool.scaleSize(60),
                            }} source={require("../../images/TakeMealsImg/icon_takeMealsGoPay.png")}/>
                        </TouchableOpacity>
                    </ImageBackground>

                </View>
            );
        } else {    // 已支付未取餐订单
            return (
                <View style={styles.carouselItemBgViewStyle}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {that.setUpCommonInfoView(item)}

                        <View style={styles.couponSelectViewStyle}>

                            <View style={{
                                backgroundColor: '#39393B',
                                height: LayoutTool.scaleSize(1),
                                marginLeft: LayoutTool.scaleSize(36),
                                marginRight: LayoutTool.scaleSize(36),
                            }}/>

                            <View style={styles.couponSelectInfoViewStyle}>
                                <Text style={{ fontSize: LayoutTool.setSpText(30),
                                    color: "#F2D3AB",
                                    marginLeft: LayoutTool.scaleSize(42),}}
                                >优惠券</Text>
                                <View style={{height:LayoutTool.scaleSize(80), flexDirection: 'row', alignItems:'center'}}>

                                    <Text style={{
                                        fontSize: LayoutTool.setSpText(26),
                                        color: "#F2D3AB",
                                        marginRight: LayoutTool.scaleSize(38),}}>{"-￥"+item.discountPrice}</Text>

                                </View>
                            </View>

                            <View style={{
                                backgroundColor: '#39393B',
                                height: LayoutTool.scaleSize(1),
                                marginLeft: LayoutTool.scaleSize(36),
                                marginRight: LayoutTool.scaleSize(36),
                            }}/>
                        </View>

                        <View style={styles.totalPriceViewStyle}>
                            <Text style={{
                                fontWeight: 'bold',
                                fontSize: LayoutTool.setSpText(30),
                                color: '#F2D3AB',
                                marginLeft: LayoutTool.scaleSize(42),//42*unitWidth,
                                marginTop:LayoutTool.scaleSize(20),//20*unitWidth,
                            }}>合计</Text>

                            <View style={{  flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                height: LayoutTool.scaleSize(80),}}>
                                <Text style={{
                                    fontSize: LayoutTool.setSpText(26),
                                    color: '#F2D3AB',
                                    marginRight: LayoutTool.scaleSize(4),//4*unitWidth,
                                    marginTop: LayoutTool.scaleSize(40),//40*unitWidth,
                                }}>￥</Text>

                                <Text style={{
                                    fontWeight: 'bold',
                                    fontSize: LayoutTool.setSpText(38),
                                    color: '#F2D3AB',
                                    marginTop: LayoutTool.scaleSize(30),
                                    marginRight: LayoutTool.scaleSize(30),
                                }}>{item.paymentPrice}</Text>

                            </View>

                        </View>

                        <Image style={styles.gapImgStyle}
                               source={require("../../images/TakeMealsImg/icon_gap.png")}>
                        </Image>

                        {that.setUpOrderInfoView(item)}

                    </ScrollView>
                </View>
            );
        }
    }

    // 未支付订单头部View门店信息
    setUpNoPayHeadInfoView(data) {
        let radLat1 = Rad(lat);
        let radLat2 = Rad(data.latitude);
        let a = radLat1 - radLat2;
        let b = Rad(lon) - Rad(data.longitude);
        let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
        s = s * 6378.137;
        console.log("s......" + s);
        // EARTH_RADIUS;
        s = (Math.round(s * 10000) / 10000).toFixed(2);
        if (s >= 1) {
            s = s + 'km';
        } else {
            s = (Math.round(s * 1000)).toFixed(2) + 'm';
        }

        let foodTime1 = "";
        let foodTime2 = "";
        let foodTime3 = "";
        let foodTime4 = "";
        let timeArray = [];
        if (data.foodTime1) {
            foodTime1 = data.foodTime1.slice(0, 5) + "-" + data.foodTime1.slice(11, 16);
            timeArray.push(foodTime1);
        }
        if (data.foodTime2) {
            foodTime2 = data.foodTime2.slice(0, 5) + "-" + data.foodTime2.slice(11, 16);
            timeArray.push(foodTime2);
        }
        if (data.foodTime3) {
            foodTime3 = data.foodTime3.slice(0, 5) + "-" + data.foodTime3.slice(11, 16);
            timeArray.push(foodTime3);
        }
        if (data.foodTime4) {
            foodTime4 = data.foodTime4.slice(0, 5) + "-" + data.foodTime4.slice(11, 16);
            timeArray.push(foodTime4);
        }

        return(
            <View key={0}>
                <View style={styles.noPayHeadStoreInfoViewStyle}>
                    <View style={styles.storeNameViewStyle}>
                        <Text style={{
                            marginTop: LayoutTool.scaleSize(40),//40*unitWidth,
                            color: '#F2D3AB',
                            marginLeft: LayoutTool.scaleSize(36),//36*unitWidth,
                            fontSize: LayoutTool.setSpText(32),
                        }} numberOfLines={1}>{data.storeName}</Text>
                        <View style={styles.storeBtnViewStyle}>
                            <TouchableOpacity activeOpacity={1} onPress={()=>that.daoHangBtnClick(data)}>
                                <Image  style={{
                                    marginLeft: LayoutTool.scaleSize(12),//13*unitWidth,
                                    width: LayoutTool.scaleSize(49),//49*unitWidth,
                                    height: LayoutTool.scaleSize(49),//49*unitWidth,
                                    marginTop: LayoutTool.scaleSize(34),
                                }}
                                        source={require("../../images/MineImg/icon_daoHang.png")}>
                                </Image>
                            </TouchableOpacity>

                            <TouchableOpacity activeOpacity={1} onPress={()=>that.callPhoneBtnClick(data)}>
                                <Image style={{
                                    marginLeft: LayoutTool.scaleSize(27),//27*unitWidth,
                                    width: LayoutTool.scaleSize(49),//49*unitWidth,
                                    height: LayoutTool.scaleSize(49),//49*unitWidth,
                                    marginTop: LayoutTool.scaleSize(34),
                                }}
                                       source={require("../../images/TakeMealsImg/icon_commonPhone.png")}>
                                </Image>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/*地址信息*/}
                    <Text style={{
                        marginTop: LayoutTool.scaleSize(10),
                        marginLeft: LayoutTool.scaleSize(36),//36*unitWidth,
                        marginRight: LayoutTool.scaleSize(36),//36*unitWidth,
                        color: '#A7A39E',
                        fontSize: LayoutTool.setSpText(24),}}
                          numberOfLines={2}
                    >{"距您 " + s + " | " + data.storeAddress}</Text>

                    {/*时间*/}
                    <Text style={{
                        marginTop: LayoutTool.scaleSize(20),
                        marginLeft: LayoutTool.scaleSize(36),//36*unitWidth,
                        marginRight:LayoutTool.scaleSize(36),
                        color: '#A7A39E',
                        fontSize: LayoutTool.setSpText(24),}}
                          numberOfLines={3}
                    >{"供餐时间 " + timeArray.join('/')}</Text>

                    <View style={{height: LayoutTool.scaleSize(20)}}/>

                </View>

                <Image style={styles.gapImgStyle}
                       source={require("../../images/TakeMealsImg/icon_gap.png")}>
                </Image>

                {that.setUpFoodView(data.list)}
            </View>
        )
    }

    // 已支付订单头部View取餐码、门店信息
    setUpCommonInfoView(data){
        let radLat1 = Rad(lat);
        let radLat2 = Rad(data.latitude);
        let a = radLat1 - radLat2;
        let b = Rad(lon) - Rad(data.longitude);
        let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
        s = s * 6378.137;
        console.log("s......" + s);
        // EARTH_RADIUS;
        s = (Math.round(s * 10000) / 10000).toFixed(2);
        if (s >= 1) {
            s = s + 'km';
        } else {
            s = (Math.round(s * 1000)).toFixed(2) + 'm';
        }

        let foodTime1 = "";
        let foodTime2 = "";
        let foodTime3 = "";
        let foodTime4 = "";
        let timeArray = [];
        if (data.foodTime1) {
            foodTime1 = data.foodTime1.slice(0, 5) + "-" + data.foodTime1.slice(11, 16);
            timeArray.push(foodTime1);
        }
        if (data.foodTime2) {
            foodTime2 = data.foodTime2.slice(0, 5) + "-" + data.foodTime2.slice(11, 16);
            timeArray.push(foodTime2);
        }
        if (data.foodTime3) {
            foodTime3 = data.foodTime3.slice(0, 5) + "-" + data.foodTime3.slice(11, 16);
            timeArray.push(foodTime3);
        }
        if (data.foodTime4) {
            foodTime4 = data.foodTime4.slice(0, 5) + "-" + data.foodTime4.slice(11, 16);
            timeArray.push(foodTime4);
        }

        return(
            <View key={0}>
                {/*istakemeal 是否完成取餐 0 -没有完成取餐 1-完成取餐*/}
                {
                    (data.istakemeal == 1)? <View style={styles.topTakeMealsNumView}>
                                            <Text style={{
                                                marginTop: LayoutTool.scaleSize(62),
                                                color: '#A7A39E',
                                                fontWeight: 'bold',
                                                fontSize: LayoutTool.setSpText(50),
                                            }}>已取餐</Text>
                                            <Text style={{
                                                marginTop: LayoutTool.scaleSize(22),
                                                color: '#F2D3AB',
                                                fontSize: LayoutTool.setSpText(26),
                                            }}>{"取餐码："+ data.takeMealCode}</Text>
                                        </View>:
                                        <View style={styles.topTakeMealsNumView}>
                                            <Text style={{
                                                marginTop: LayoutTool.scaleSize(40),//40*unitWidth,
                                                color: '#A7A39E',
                                                fontSize: LayoutTool.setSpText(30),
                                            }}>取餐码</Text>
                                            <Text style={{
                                                marginTop: LayoutTool.scaleSize(10),//10*unitWidth,
                                                color: '#F2D3AB',
                                                fontWeight: 'bold',
                                                fontSize: LayoutTool.setSpText(100),
                                            }}>{data.takeMealCode}</Text>
                                        </View>
                }

                <Image style={styles.gapImgStyle}
                       source={require("../../images/TakeMealsImg/icon_gap.png")}>
                </Image>

                <View style={styles.storeInfoViewStyle}>
                    <View style={styles.storeNameViewStyle}>
                        <Text style={{
                                    marginTop: LayoutTool.scaleSize(20),//20*unitWidth,
                                    color: '#F2D3AB',
                                    marginLeft: LayoutTool.scaleSize(36),//36*unitWidth,
                                    fontSize: LayoutTool.setSpText(32),
                        }} numberOfLines={1}>{data.storeName}</Text>
                        <View style={styles.storeBtnViewStyle}>
                            <TouchableOpacity activeOpacity={1} onPress={()=>that.daoHangBtnClick(data)}>
                                <Image  style={{
                                            marginLeft: LayoutTool.scaleSize(13),//13*unitWidth,
                                            width: LayoutTool.scaleSize(49),//49*unitWidth,
                                            height: LayoutTool.scaleSize(49),//49*unitWidth,
                                }}
                                        source={require("../../images/MineImg/icon_daoHang.png")}>
                                </Image>
                            </TouchableOpacity>

                            <TouchableOpacity activeOpacity={1} onPress={()=>that.callPhoneBtnClick(data)}>
                                <Image style={{
                                        marginLeft: LayoutTool.scaleSize(27),//27*unitWidth,
                                        width: LayoutTool.scaleSize(49),//49*unitWidth,
                                        height: LayoutTool.scaleSize(49),//49*unitWidth,
                                }}
                                       source={require("../../images/TakeMealsImg/icon_commonPhone.png")}>
                                </Image>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {/*地址信息*/}
                    <Text style={{
                        marginLeft: LayoutTool.scaleSize(36),
                        marginRight: LayoutTool.scaleSize(36),
                        color: '#A7A39E',
                        fontSize: LayoutTool.setSpText(24),}}
                          numberOfLines={2}
                    >{"距您 " + s + " | " + data.storeAddress}</Text>

                    {/*时间*/}
                    <Text style={{
                                marginTop: LayoutTool.scaleSize(14),
                                marginLeft: LayoutTool.scaleSize(36),//36*unitWidth,
                                marginRight:LayoutTool.scaleSize(36),
                                color: '#A7A39E',
                                fontSize: LayoutTool.setSpText(24),}}
                          numberOfLines={3}
                    >{"供餐时间 "+ timeArray.join('/')}</Text>

                    <View style={{height: LayoutTool.scaleSize(20)}}/>
                </View>

                <Image style={styles.gapImgStyle}
                       source={require("../../images/TakeMealsImg/icon_gap.png")}>
                </Image>

                {that.setUpFoodView(data.list)}
            </View>
        )
    }
    // 穿件中间菜品、商品View
    setUpFoodView(listData) {
        let itemArr = [];
        for (let i = 0; i < listData.length; i++) {
            let data = listData[i];
            itemArr.push(
                <View key={i} style={styles.foodInfoViewStyle}>
                    <Text style={{fontSize:LayoutTool.setSpText(30),
                        color:"#F2D3AB",
                        marginLeft: LayoutTool.scaleSize(32),//32*unitWidth,
                        width: LayoutTool.scaleSize(300),//300*unitWidth,
                    }}>{data.dishesName}</Text>

                    <Text style={{fontSize:LayoutTool.setSpText(30),
                        color:"#F2D3AB",
                    }}>{"x " + data.number}</Text>

                    <Text style={{
                        fontSize:LayoutTool.setSpText(30),
                        color:"#F2D3AB",
                        marginRight: LayoutTool.scaleSize(32),//33*unitWidth,
                    }}>{"￥" + data.paymentPrice}</Text>
                </View>
            );
        }
        return itemArr;
    }

    // 订单信息
    setUpOrderInfoView = (data) =>{
        return(
            <View style={styles.orderInfoViewStyle}>
                <Text style={{
                            fontSize:LayoutTool.setSpText(20),
                            color: '#A7A39E',
                            marginLeft: LayoutTool.scaleSize(42),//42*unitWidth,
                            marginTop: LayoutTool.scaleSize(20),//20*unitWidth,
                }} numberOfLines={1}>{"下单时间：" + data.createTime}</Text>

                <Text style={{
                            fontSize:LayoutTool.setSpText(20),
                            color: '#A7A39E',
                            marginLeft: LayoutTool.scaleSize(42),//42*unitWidth,
                            marginTop: LayoutTool.scaleSize(20),//20*unitWidth,
                }} numberOfLines={1}>{"订单编号：" + data.orderNo}</Text>
            </View>
        )
    };


    // 去点餐按钮
    goBtnClick() {
        this.props.navigation.navigate('Home');
    }
    // 历史订单
    orderBtnClick() {
        if (isLogin === true) {
            this.props.navigation.push('MyOrderListView');
        } else {
            this.props.navigation.push('LoginView');
        }
    }

    // 导航按钮点击
    daoHangBtnClick(data) {
        if(IOS) {
            ActionSheetIOS.showActionSheetWithOptions({
                    options: ["百度地图","高德地图","取消"], // 字符串数组
                    cancelButtonIndex: 2, // 第几个元素(索引)是cancelButton
                    title: '请选择地图导航',

                },
                (buttonIndex) => this.actionSheetClick(buttonIndex, data)
            );
        }else if(ANDROID) {
            Alert.alert(
                '',
                '请选择地图导航',
                [
                    {text: '百度地图', onPress: () => MapUntil.turnMapApp(data.longitude,data.latitude, 'baidu', data.storeAddress)},
                    {text: '高德地图', onPress: () => MapUntil.turnMapApp(data.longitude,data.latitude, 'gaode', data.storeAddress)},
                    {text: '取消', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                ],
                { cancelable: false },
            );
        }
    }
    actionSheetClick(buttonIndex, data) {
        console.log(data.storeAddress);
        if (buttonIndex === 0) {
            MapUntil.turnMapApp(data.longitude,data.latitude, 'baidu', data.storeAddress)
        } else if (buttonIndex === 1) {
            MapUntil.turnMapApp(data.longitude,data.latitude, 'gaode', data.storeAddress)
        }
    }

    callPhoneBtnClick(data) {

        let brief = "确定拨打电话：" + data.storePhoneNumber + " 吗？";
        Alert.alert('提示', brief,
            [
                {text: '取消'},
                {
                    text: '确认',
                    onPress: () => {
                        let phone = "tel:" + data.storePhoneNumber;
                        Linking.canOpenURL(phone).then(supported => {
                            if (!supported) {
                                console.log('Can\'t handle url: ' + phone);
                            } else {
                                return Linking.openURL(phone);
                            }
                        }).catch(err => console.error('An error occurred', err));
                    }
                }
            ],
            {cancelable: false}
        );
    }

    // 去选择优惠券
    couponBtnClick() {
        if (this.state.useCouponDataList.length > 0) {
            if (isLogin === true) {
                this.props.navigation.navigate('SelectCouponView', {
                    callback: (selectCouponData) => {
                        console.log("是否选择了券返回......->" + selectCouponData);
                        this.setState({
                            selectCouponData: selectCouponData,
                        });
                        // 选择了优惠券
                        if (selectCouponData) {
                            console.log("......->");
                            // 获取使用券后实际支付金额
                            this.getRealPayPriceNet({"userCardMedalId":selectCouponData.id, "orderId":this.state.noPayOrderId,});
                        }

                    }, "orderId":this.state.noPayOrderId, "selectCouponId": this.state.selectCouponData.id,
                });
            }
        } else {
            ToastView.showShortHudView("暂无可用优惠券");
            return false;
        }
    }
    // 获取实际支付金额
    getRealPayPriceNet(param){
        NetService.GET("heque-coupon/discount_coupon/query_real_pay_price", param, data=>{
            this.setState({
                realPayPrice: data.totalPrice,
            })
        }, response=>{
            if (response.code === NetService.Token_Lose) {
                // 删除数据
                this.setState({
                    dataList: [],

                    slider1ActiveSlide: 0,      // 当前显示View的下标

                    weChatLoginViewShow: true,  // 判断是否有安装微信

                    showCancelView: false,  // 是否显示取消订单View

                    useCouponDataList: [],  // 可用使用的券数组

                    noPayOrderId: "",       // 未支付订单Id

                    selectCouponData: "",       // 选中的优惠券Id
                })
            }
        });
    }


    // 去支付按钮
    payBtnClick(data) {
        if (this.state.selectCouponData) {
            if (this.state.realPayPrice <= 0) {
                // 0元支付
                this.payPriceZeroNet({"userCardMedalId":this.state.selectCouponData.id,
                    "id":data.id,
                    "paymentPrice": this.state.realPayPrice,    // 支付总金额
                    "channel": 'app',})
            } else {
                if (this.state.weChatLoginViewShow === false) {
                    ToastView.showShortHudView("您未安装微信,无法完成支付");
                    return false;
                }
                // 优惠券非0元支付
                this.payPriceNoZeroNet({"id":data.id, "userCardMedalId":this.state.selectCouponData.id, "paymentPrice": this.state.realPayPrice, "channel":"app"});
            }
        } else {
            if (this.state.weChatLoginViewShow === false) {
                ToastView.showShortHudView("您未安装微信,无法完成支付");
                return false;
            }
            // 非0元无优惠券支付
            this.payPriceNoZeroNet({"id":data.id, "paymentPrice": data.paymentPrice, "channel":"app"});
        }
    }
    // 非0元支付
    payPriceNoZeroNet(param){
        NetService.POST("heque-eat/wechat_pay/hsf_user_payment", param, data=>{
            WeChat.pay({
                partnerId: data.partnerid,  // 商家向财付通申请的商家id
                prepayId: data.prepayid,   // 预支付订单
                nonceStr: data.noncestr,   // 随机串，防重发
                timeStamp: data.timestamp,  // 时间戳，防重发.
                package: data.package,    // 商家根据财付通文档填写的数据和签名
                sign: data.sign,       // 商家根据微信开放平台文档对数据做的签名
            }).then((requestJson) => {
                //支付成功回调
                if (requestJson.errCode == "0") {
                    this.setState({
                        selectCouponData: "",   // 选中的优惠券数据模型

                        selectCouponId: "",       // 选中的优惠券Id

                        realPayPrice: "",       // 实际支付金额
                    });
                    // 查询订单数据
                    this.getOrderNetData({"userId": userId});
                    //回调成功处理
                    ToastView.showShortHudView("支付成功");

                    // 查询是否有优惠券可领取
                    this.getDrawCouponNet();
                } else {

                }
            }).catch((err) => {
                if (err.code == -2) {
                    ToastView.showShortHudView("您已取消支付");
                }else {
                    ToastView.showShortHudView("支付失败");
                }
            })
        }, response=>{
            if (response.code === NetService.Token_Lose) {
                // 删除数据
                this.setState({
                    dataList: [],

                    slider1ActiveSlide: 0,      // 当前显示View的下标

                    weChatLoginViewShow: true,  // 判断是否有安装微信

                    showCancelView: false,  // 是否显示取消订单View

                    useCouponDataList: [],  // 可用使用的券数组

                    noPayOrderId: "",       // 未支付订单Id

                    selectCouponData: "",       // 选中的优惠券Id
                })
            }
        });
    }

    // 0元支付
    payPriceZeroNet(param){
        NetService.POST("heque-eat/wechat_pay/zero_element_pay", param, data=>{
            // 查询订单数据
            this.getOrderNetData({"userId": userId});
            //回调成功处理
            ToastView.showShortHudView("支付成功");

            this.setState({
                selectCouponData: "",   // 选中的优惠券数据模型

                selectCouponId: "",       // 选中的优惠券Id

                realPayPrice: "",       // 实际支付金额
            });
            // 查询是否有优惠券可领取
            this.getDrawCouponNet();
        }, response=>{
            ToastView.showShortHudView(response.message);
            if (response.code === NetService.Token_Lose) {
                // 删除数据
                this.setState({
                    dataList: [],

                    slider1ActiveSlide: 0,      // 当前显示View的下标

                    weChatLoginViewShow: true,  // 判断是否有安装微信

                    showCancelView: false,  // 是否显示取消订单View

                    useCouponDataList: [],  // 可用使用的券数组

                    noPayOrderId: "",       // 未支付订单Id

                    selectCouponData: "",       // 选中的优惠券Id
                })
            }
        });
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222224',
    },

    noDataBgViewStyle: {
        flex: 1,
        alignItems: 'center',
    },

    noPayHeadStoreInfoViewStyle: {
        backgroundColor: '#2F2F30',
        marginTop: LayoutTool.scaleSize(15),//15*unitWidth,
        borderTopRightRadius: LayoutTool.scaleSize(10),//10*unitWidth,
        borderTopLeftRadius: LayoutTool.scaleSize(10),//10*unitWidth,
    },
    carouselItemBgViewStyle: {
        flex: 1,
        backgroundColor: '#2F2F30',
        width: SCREEN_WIDTH - LayoutTool.scaleSize(80),
        marginLeft: LayoutTool.scaleSize(40),
        marginTop: LayoutTool.scaleSize(40),
        marginRight: LayoutTool.scaleSize(40),
        borderRadius: LayoutTool.scaleSize(16),
    },
    topTakeMealsNumView: {
        backgroundColor: '#2F2F30',
        marginTop: 15*unitWidth,
        height: 212*unitWidth,
        alignItems: 'center',
        borderTopRightRadius: 10*unitWidth,
        borderTopLeftRadius: 10*unitWidth,
    },
    storeInfoViewStyle: {
        backgroundColor: '#2F2F30',
    },
    storeNameViewStyle: {
        height: 88*unitWidth,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    storeBtnViewStyle: {
        height: 88*unitWidth,
        width: 180*unitWidth,
        flexDirection: 'row',
        justifyContent: 'center',
    },


    foodInfoViewStyle: {
        backgroundColor: '#2F2F30',
        height: 88*unitWidth,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    couponSelectViewStyle: {
        backgroundColor: '#2F2F30',
        height: LayoutTool.scaleSize(84),//84*unitWidth,
    },
    couponSelectInfoViewStyle: {
        height: LayoutTool.scaleSize(80),//80*unitWidth,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    totalPriceViewStyle: {
        backgroundColor: '#2F2F30',
        height: LayoutTool.scaleSize(80),//80*unitWidth,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    orderInfoViewStyle: {
        backgroundColor: '#2F2F30',
        height: LayoutTool.scaleSize(150),//150*unitWidth,
    },

    gapImgStyle:{
        width: LayoutTool.scaleSize(670),
        height: LayoutTool.scaleSize(38),
    },

    bottomSurePayBgViewStyle: {
        position: 'absolute',
        bottom: 0,
        left: LayoutTool.scaleSize(40),//20*unitWidth,
        right: LayoutTool.scaleSize(40),//20*unitWidth,
        height: LayoutTool.scaleSize(186),//156*unitWidth,
        alignItems:'center',
        justifyContent: 'center',
    },


    goEatImageStyle: {
        marginTop: LayoutTool.scaleSize(46),
        width: 500*unitWidth,
        height: 80*unitWidth,
    },
});
