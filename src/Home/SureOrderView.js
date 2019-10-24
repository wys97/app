
// 确认点餐

import React from 'react'
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    Alert,
    ScrollView,
    ActionSheetIOS,
    DeviceEventEmitter
} from 'react-native'

import MapView from 'react-native-amap3d'

import {ANDROID, IOS, SCREEN_WIDTH, unitWidth} from '../../Tools/Layout';
import LayoutTool from '../../Tools/Layout'
import NetService from "../../Tools/NetService";
import MapUntil from "../../Tools/MapUntil";
import ToastView from "../../Tools/ToastHudView"
import Loading from "../../Tools/Loading";
import * as WeChat from 'react-native-wechat';

import SelectCouponView from "../TakeMeals/SelectUseCouponView"

export default class SureOrderView extends React.Component{

    static navigationOptions = ({navigation}) => {
        return {
            title: "点餐",
        }
    };

    constructor(props) {
        super(props);

        this.state = {
            provideStyle: "2",       // 供餐方式（1堂食，2外带)
            foodData: "",
            storeData: {
                latitude: 22.541566,
                longitude: 113.932544,
                name:""
            },
            numValue: 1,            // 菜品数量
            foodPriceValue: 0,     // 合计价格

            priceType: "",          // 价格类型
            longitude: "",          // 用户位置经度
            latitude: "",           // 用户位置纬度

            useCouponDataList: [],  // 可使用优惠券数组
            selectCouponData: "",   // 选中的优惠券
            weChatLoginViewShow: true,  // 判断是否安装微信

            realPayPrice: "",       // 实际支付金额
        }
    }

    componentDidMount() {
        const { params } = this.props.navigation.state;
        let price = "";
        let priceType = "";
        if (params.foodData.appSpecialOffer) {
            price = params.foodData.appSpecialOffer;
            priceType = "3";
        } else {
            price = params.foodData.originalPrice;
            priceType = "1";
        }
        this.setState({
            foodData: params.foodData,
            storeData: params.storeData,
            foodPriceValue: price,
            priceType: priceType,
        });

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

        // 查询是否有券可以使用
        this.getUseCouponNetData({"userId":global.userId,"totalPrice":price,"dishId":params.foodData.dishId,"storeId":params.storeData.id});
    }
    // 查询是否有券可以使用
    getUseCouponNetData(param) {
        NetService.GET("heque-coupon/discount_coupon/order_info_get_coupon", param, data=>{
            let useArray = [];
            for (let i = 0; i < data.length; i++) {
                let couponData = data[i];
                // type 1:不可使用   2:可使用
                if (couponData.type == 2) {
                    useArray.push(couponData);
                }
            }
            if (useArray.length > 0) {
                this.setState({
                    selectCouponData: useArray[0],
                })
            }
            this.setState({
                useCouponDataList: useArray,
            })
        }, response=>{
            if (response.code === NetService.Token_Lose) {
                global.isLogin = false;
                // 删除数据
                this.setState({

                    weChatLoginViewShow: true,  // 判断是否有安装微信

                    useCouponDataList: [],      // 可用使用的券数组

                    selectCouponData: "",       // 选中的优惠券
                });
                // 返回堆栈中的第一个页面
                this.props.navigation.popToTop();
            }
        });
    }

    render(){

        let distance = "";
        if (this.state.storeData.number > 1000) {
            distance = this.state.storeData.number / 1000;
            distance = '距您:' + distance.toFixed(2) + 'km';
        } else {
            distance = '距您:' + this.state.storeData.number + 'm';
        }

        let foodPriceValue = this.state.foodPriceValue;
        if (this.state.selectCouponData){
            foodPriceValue = foodPriceValue*100 - this.state.selectCouponData.faceValue*100;
            foodPriceValue = foodPriceValue/100;
        }
        foodPriceValue = foodPriceValue.toFixed(2);

        let bottomBtnStyle = {
            backgroundColor: '#31B1B0',
            width: SCREEN_WIDTH,
            height: LayoutTool.scaleSize(90),
            bottom: 0,
            position: 'absolute',
            justifyContent: 'center',
            alignItems: 'center',
        };

        // 优惠券金额显示样式
        let textColor = "";
        let textFont = "";
        if (this.state.selectCouponData) {
            textColor = '#F2D3AB';
            textFont = LayoutTool.setSpText(32);
        } else {
            textFont = LayoutTool.setSpText(28);
            textColor = '#A7A39E';
        }
        let couponTextStyle = {
            fontSize: textFont,
            color: textColor,
            marginRight: LayoutTool.scaleSize(20),
        };

        let foodTime1 = "";
        let foodTime2 = "";
        let foodTime3 = "";
        let foodTime4 = "";
        let timeArray = [];
        if (this.state.storeData.foodTime1) {
            foodTime1 = this.state.storeData.foodTime1.slice(0, 5) + "-" + this.state.storeData.foodTime1.slice(11, 16);
            timeArray.push(foodTime1);
        }
        if (this.state.storeData.foodTime2) {
            foodTime2 = this.state.storeData.foodTime2.slice(0, 5) + "-" + this.state.storeData.foodTime2.slice(11, 16);
            timeArray.push(foodTime2);
        }
        if (this.state.storeData.foodTime3) {
            foodTime3 = this.state.storeData.foodTime3.slice(0, 5) + "-" + this.state.storeData.foodTime3.slice(11, 16);
            timeArray.push(foodTime3);
        }
        if (this.state.storeData.foodTime4) {
            foodTime4 = this.state.storeData.foodTime4.slice(0, 5) + "-" + this.state.storeData.foodTime4.slice(11, 16);
            timeArray.push(foodTime4);
        }

        let briefMargin = 0;
        if (IOS) {
            briefMargin = LayoutTool.scaleSize(14);
        } else {
            briefMargin = LayoutTool.scaleSize(6);
        }
        let briefStyle = {
            fontSize:LayoutTool.setSpText(24),
            color: '#A7A39E',
            marginTop: briefMargin,
        };

        let topMargin = 0;
        if (IOS) {
            topMargin = LayoutTool.scaleSize(24);
        } else {
            topMargin = LayoutTool.scaleSize(10);
        }
        let priceStyle = {
            fontSize:LayoutTool.setSpText(26),
            color: '#FF9C43',
            marginTop: topMargin,
        };

        return (
            <View style={styles.container}>
                <ScrollView>
                    <View style={styles.topBgViewStyle}>
                        <View style={styles.storeInfoBgView}>
                            <View style={styles.leftStoreInfoViewStyle}>
                                <Text style={{
                                    fontSize: LayoutTool.setSpText(44),
                                    fontWeight: 'bold',
                                    color: "#F2D3AB",
                                    marginTop: LayoutTool.scaleSize(40),
                                    marginLeft: LayoutTool.scaleSize(40),
                                }} numberOfLines={1}>{this.state.storeData.name}</Text>
                                <Text style={{
                                    fontSize: LayoutTool.setSpText(24),
                                    color: "#8B8782",
                                    marginTop: LayoutTool.scaleSize(20),
                                    marginLeft: LayoutTool.scaleSize(40),
                                    width: LayoutTool.scaleSize(570),
                                }} numberOfLines={1}>{distance + " | " + this.state.storeData.adds}</Text>
                            </View>
                            {/*导航*/}
                            <TouchableOpacity activeOpacity={0.7} onPress={()=>this.daoHangClick()}>
                                <View style={styles.rightBtnViewStyle}>
                                    <Image style={{
                                        width: LayoutTool.scaleSize(59),
                                        height: LayoutTool.scaleSize(59),
                                        marginTop: LayoutTool.scaleSize(40),
                                    }} source={require("../../images/TakeMealsImg/icon_commonDaoHang.png")}/>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <Text style={{
                            fontSize: LayoutTool.setSpText(24),
                            color: "#8B8782",
                            marginTop: LayoutTool.scaleSize(10),
                            marginLeft: LayoutTool.scaleSize(40),
                        }} numberOfLines={2}>营业时间：{timeArray.join('/')}</Text>

                        {/*地图*/}
                        <View style={styles.mapBgViewStyle}>
                            <MapView style={styles.MapViewStyle}
                                     coordinate={{
                                         latitude: this.state.storeData.latitude,
                                         longitude: this.state.storeData.longitude,
                                     }}
                                     scrollEnabled={false}
                                     rotateEnabled={false}
                                     showsCompass={false}
                                     zoomLevel={18}
                                     locationEnabled
                                     onLocation={({ nativeEvent }) =>
                                         this.setState({
                                             longitude: nativeEvent.longitude,
                                             latitude: nativeEvent.latitude,
                                         })
                                     }
                            >
                                <MapView.Marker
                                    image='icon_map_tag_sele'
                                    coordinate={{
                                        latitude: this.state.storeData.latitude,
                                        longitude: this.state.storeData.longitude,
                                    }}
                                />
                            </MapView>
                        </View>
                    </View>
                    {/*菜品信息背景View*/}
                    <View style={styles.storeInfoBgViewStyle}>

                        {/*菜品信息*/}
                        <View style={styles.storeInfoViewStyle}>
                            <View style={styles.leftInfoViewStyle}>
                                <Image style={{
                                    width: LayoutTool.scaleSize(200),
                                    height: LayoutTool.scaleSize(140),
                                    borderRadius: LayoutTool.scaleSize(16),
                                    marginLeft: LayoutTool.scaleSize(40),
                                }} source={{uri:this.state.foodData.dishesUrl}}/>

                                <View style={styles.foodNamePriceViewStyle}>
                                    <Text style={briefStyle}>{this.state.foodData.dishName}</Text>
                                    <Text style={{
                                        fontSize:LayoutTool.setSpText(24),
                                        color: '#A7A39E',
                                        marginTop: LayoutTool.scaleSize(14),
                                    }}>{this.state.foodData.dishesRemake}</Text>
                                    <Text style={priceStyle}>{this.state.foodData.appSpecialOffer?"￥" + this.state.foodData.appSpecialOffer:"￥"+this.state.foodData.originalPrice}</Text>
                                </View>
                            </View>
                            {/*数量View*/}
                            <View style={styles.rightInfoNumViewStyle}>
                                <TouchableOpacity activeOpacity={0.7} onPress={()=>this.jianClick()}>
                                    <Image style={{
                                        width: LayoutTool.scaleSize(43),
                                        height: LayoutTool.scaleSize(43),
                                        marginRight: LayoutTool.scaleSize(26),
                                    }} source={require("../../images/HomeImg/icon_jian.png")}/>
                                </TouchableOpacity>
                                <Text style={{
                                    fontSize: LayoutTool.setSpText(32),
                                    color: '#F2D3AB',
                                }}>{this.state.numValue}</Text>
                                <TouchableOpacity activeOpacity={0.7} onPress={()=>this.addClick()}>
                                    <Image style={{
                                        width: LayoutTool.scaleSize(43),
                                        height: LayoutTool.scaleSize(43),
                                        marginLeft: LayoutTool.scaleSize(26),
                                    }} source={require("../../images/HomeImg/icon_add.png")}/>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    {/*实线*/}
                    <View style={{
                        height: LayoutTool.scaleSize(1),
                        backgroundColor: '#39393B',
                        marginLeft: LayoutTool.scaleSize(40),
                        marginRight: LayoutTool.scaleSize(40)}}/>

                    {/*优惠券*/}
                    <TouchableOpacity activeOpacity={1} onPress={()=>this.couponClick()}>
                        <View style={styles.couponViewStyle}>
                            <Text style={{
                                fontSize: LayoutTool.setSpText(32),
                                color:"#F2D3AB",
                                marginLeft: LayoutTool.scaleSize(10),
                            }}>优惠券</Text>
                            <View style={styles.couponPriceViewStyle}>
                                <Text style={couponTextStyle}>{(this.state.useCouponDataList.length > 0)?(this.state.selectCouponData?"-￥"+this.state.selectCouponData.faceValue:"请选择优惠券"):"暂无可用优惠券"}</Text>
                                <Image style={{ width:LayoutTool.scaleSize(13),
                                                height:LayoutTool.scaleSize(21),
                                                marginRight: LayoutTool.scaleSize(30)}}
                                       source={require("../../images/MineImg/icon_right.png")}/>
                            </View>
                        </View>
                    </TouchableOpacity>
                    {/*实线*/}
                    <View style={{
                            height: LayoutTool.scaleSize(1),
                            backgroundColor: '#39393B',
                            marginLeft: LayoutTool.scaleSize(40),
                            marginRight: LayoutTool.scaleSize(40)}}/>
                    {/*合计*/}
                    <View style={styles.totalViewStyle}>
                        <Text style={{
                            fontSize: LayoutTool.setSpText(32),
                            color: '#F2D3AB',
                            marginLeft: LayoutTool.scaleSize(50),
                        }}>合计</Text>
                        <View style={styles.totalPriceStyle}>
                            <Text style={{
                                fontSize: LayoutTool.setSpText(26),
                                color:"#F2D3AB",
                                marginTop: LayoutTool.scaleSize(14),
                            }}>￥</Text>
                            <Text style={{
                                fontSize: LayoutTool.setSpText(40),
                                color:"#F2D3AB",
                                marginLeft: LayoutTool.scaleSize(6),
                            }}>{(foodPriceValue<0?"0.00":foodPriceValue)}</Text>
                        </View>
                    </View>
                    <View style={{height: LayoutTool.scaleSize(90)}}>
                    </View>
                </ScrollView>
                {/*完成点餐*/}
                <View style={bottomBtnStyle}>
                    <TouchableOpacity style={{
                                        width:SCREEN_WIDTH,
                                        height: LayoutTool.scaleSize(90),
                                        justifyContent: 'center',
                                        alignItems: 'center',}}
                                      activeOpacity={0.7}
                                      onPress={()=>this.sureOrderClick()}>
                        <Image style={{
                            width:SCREEN_WIDTH,
                            height: LayoutTool.scaleSize(90),
                        }} source={require("../../images/HomeImg/icon_sureOrderGoPay.png")}/>
                    </TouchableOpacity>
                </View>
                <Loading ref={(view)=>{Loading.loadingDidCreate(view)}}>
                </Loading>
            </View>
        )
    }

    jianClick() {
        if (this.state.numValue == 1) {
            return false;
        }
        let value = this.state.numValue - 1;

        let price = "";
        if (this.state.foodData.appSpecialOffer) {
            price = this.state.foodData.appSpecialOffer;
        } else {
            price = this.state.foodData.originalPrice;
        }
        price = value*price;
        this.setState({
            numValue: value,
            foodPriceValue: price,
        });
        // 查询是否有券可以使用
        this.getUseCouponNetData({"userId":global.userId,"totalPrice":price,"dishId":this.state.foodData.dishId,"storeId":this.state.storeData.id});
    }
    addClick() {
        // if (this.state.numValue == 3) {
        //     ToastView.showShortHudView('每次下单数量不能超过3份');
        //     return false;
        // }
        let value = this.state.numValue + 1;

        let price = "";
        if (this.state.foodData.appSpecialOffer) {
            price = this.state.foodData.appSpecialOffer;
        } else {
            price = this.state.foodData.originalPrice;
        }
        price = value*price;
        this.setState({
            numValue: value,
            foodPriceValue: price,
        });
        // 查询是否有券可以使用
        this.getUseCouponNetData({"userId":global.userId,"totalPrice":price,"dishId":this.state.foodData.dishId,"storeId":this.state.storeData.id});
    }
    daoHangClick() {

        if(IOS) {
            ActionSheetIOS.showActionSheetWithOptions({
                    options: ["百度地图","高德地图","取消"], // 字符串数组
                    cancelButtonIndex: 2, // 第几个元素(索引)是cancelButton
                    title: '请选择地图导航',

                },
                (buttonIndex) => this.actionSheetClick(buttonIndex)
            );
        }else if(ANDROID) {
            Alert.alert(
                '',
                '请选择地图导航',
                [
                    {text: '百度地图', onPress: () => MapUntil.turnMapApp(this.state.storeData.longitude,this.state.storeData.latitude, 'baidu', this.state.storeData.storeAddress)},
                    {text: '高德地图', onPress: () => MapUntil.turnMapApp(this.state.storeData.longitude,this.state.storeData.latitude, 'gaode', this.state.storeData.storeAddress)},
                    {text: '取消', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                ],
                { cancelable: false },
            )
        }
    }
    actionSheetClick(buttonIndex) {
        if (buttonIndex === 0) {
            MapUntil.turnMapApp(this.state.storeData.longitude,this.state.storeData.latitude, 'baidu', this.state.storeData.storeAddress);
        } else if (buttonIndex === 1) {
            MapUntil.turnMapApp(this.state.storeData.longitude,this.state.storeData.latitude, 'gaode', this.state.storeData.storeAddress)
        }
    }


    // 优惠券的选择
    couponClick() {
        if (this.state.useCouponDataList.length > 0) {
            if (isLogin === true) {
                this.props.navigation.navigate('SelectCouponView', {
                    callback: (selectCouponData) => {
                        console.log("是否选择了券返回......->" + selectCouponData);

                        let tempSelectCouponData = "";
                        if (selectCouponData) {
                            tempSelectCouponData = selectCouponData;
                        }

                        this.setState({
                            selectCouponData: tempSelectCouponData,
                        });

                    },"totalPrice":this.state.foodPriceValue,"foodData":this.state.foodData,"storeData":this.state.storeData,"fromType":"sureOrder","selectCouponId":this.state.selectCouponData.id,
                });
            }
        } else {
            ToastView.showShortHudView("暂无可用优惠券");
            return false;
        }
    }

    // 确认点餐
    sureOrderClick() {
        if (this.state.weChatLoginViewShow === false) {
            Loading.dismiss();
            ToastView.showShortHudView("您未安装微信,无法完成支付");
            return false;
        }
        let param={ "dishId":this.state.foodData.dishId,        "storeId":this.state.storeData.id,
                    "num":this.state.numValue,                  "userId": userId,
                    "priceType":this.state.priceType,           "eatEverydayDishesDishesId":this.state.foodData.eatEverydayDishesDishesId,
                    "takeMealType":"1",                         "codeC":cityCode,   // 用户选择的城市Code
                    "longitude":this.state.longitude,           "latitude":this.state.latitude,
                    "addMeasure":"0",                           "mealEatEverydayDishesDishesId":"0",
                    "mealNum": 0,                               "totalPrice":this.state.foodPriceValue,
                    "supplyTime":this.state.foodData.supplyTime,"provideStyle":'2',   // 供餐方式（1堂食，2外带)
                    "appType":"app",
                  };
        Loading.showLoading("正在支付...");
        NetService.POST("heque-eat/eat/save_order", param, data=>{
            if (this.state.selectCouponData) {
                // 获取使用券后实际支付金额
                this.getRealPayPriceNet({"userCardMedalId":this.state.selectCouponData.id, "orderId":data,});
            } else {
                // 非0元无优惠券支付
                this.payPriceNoZeroNet({"id":data, "paymentPrice": this.state.foodPriceValue, "channel":"app"});
            }
        }, response=>{
            Loading.dismiss();
            if (response.code === NetService.Token_Lose) {
                // 返回堆栈中的第一个页面
                this.props.navigation.popToTop();

                global.isLogin = false;
            }
            ToastView.showShortHudView(response.message);
        });
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
                Loading.dismiss();
                //支付成功回调
                if (requestJson.errCode == "0") {
                    this.setState({
                        selectCouponData: "",   // 选中的优惠券数据模型

                        realPayPrice: "",       // 实际支付金额
                    });
                    //回调成功处理
                    ToastView.showShortHudView("支付成功");
                    // 标记下单成功跳转取餐
                    global.orderSuccess = "1";
                    // 返回堆栈中的第一个页面
                    this.props.navigation.popToTop();

                    // 发送支付成功消息通知
                    DeviceEventEmitter.emit('sureOrderPaySuccessNotification', '');
                } else {

                }
            }).catch((err) => {
                Loading.dismiss();
                if (err.code == -2) {
                    ToastView.showShortHudView("您已取消支付");
                }else {
                    ToastView.showShortHudView("支付失败");
                }
                // 标记下单成功跳转取餐
                global.orderSuccess = "1";
                // 返回堆栈中的第一个页面
                this.props.navigation.popToTop();
            })
        }, response=>{
            if (response.code === NetService.Token_Lose) {
                // 返回堆栈中的第一个页面
                this.props.navigation.popToTop();
                // 删除数据
                this.setState({

                    weChatLoginViewShow: true,  // 判断是否有安装微信

                    useCouponDataList: [],  // 可用使用的券数组

                    selectCouponData: "",       // 选中的优惠券
                })
            }
        });
    }
    // 0元支付
    payPriceZeroNet(param){
        NetService.POST("heque-eat/wechat_pay/zero_element_pay", param, data=>{
            Loading.dismiss();
            //回调成功处理
            ToastView.showShortHudView("支付成功");
            // 标记下单成功跳转取餐
            global.orderSuccess = "1";
            // 返回堆栈中的第一个页面
            this.props.navigation.popToTop();

            this.setState({
                selectCouponData: "",   // 选中的优惠券数据模型

                realPayPrice: "",       // 实际支付金额
            });
            // 发送支付成功消息通知
            DeviceEventEmitter.emit('sureOrderPaySuccessNotification', '');

        }, response=>{
            ToastView.showShortHudView(response.message);
            if (response.code === NetService.Token_Lose) {
                // 返回堆栈中的第一个页面
                this.props.navigation.popToTop();
                // 删除数据
                this.setState({

                    weChatLoginViewShow: true,  // 判断是否有安装微信

                    useCouponDataList: [],  // 可用使用的券数组

                    selectCouponData: "",       // 选中的优惠券
                })
            }
        });
    }


    // 获取实际支付金额
    getRealPayPriceNet(param){
        NetService.GET("heque-coupon/discount_coupon/query_real_pay_price", param, data=>{
            if (data.totalPrice <= 0) {
                // 0元支付
                this.payPriceZeroNet({"userCardMedalId":this.state.selectCouponData.id,
                    "id":param.orderId,
                    "paymentPrice": data.totalPrice,    // 支付总金额
                    "channel": 'app',})
            } else {
                // 优惠券非0元支付
                this.payPriceNoZeroNet({"id":param.orderId, "userCardMedalId":this.state.selectCouponData.id, "paymentPrice": data.totalPrice, "channel":"app"});
            }
        }, response=>{
            if (response.code === NetService.Token_Lose) {
                // 删除数据
                this.setState({

                    weChatLoginViewShow: true,  // 判断是否有安装微信

                    useCouponDataList: [],  // 可用使用的券数组

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

    // 头部
    topBgViewStyle: {
        width: SCREEN_WIDTH,
    },
    storeInfoBgView: {
        width: SCREEN_WIDTH,
        flexDirection: 'row',
    },
    leftStoreInfoViewStyle: {
        width: SCREEN_WIDTH-LayoutTool.scaleSize(140),
    },
    storeNameViewStyle: {
        height: LayoutTool.scaleSize(96),
        flexDirection: 'row',
    },

    rightBtnViewStyle: {
        width: LayoutTool.scaleSize(80),
        alignItems: 'center',
    },

    mapBgViewStyle: {
        width: LayoutTool.scaleSize(670),
        height: LayoutTool.scaleSize(420),
        marginLeft: (SCREEN_WIDTH-LayoutTool.scaleSize(670))/2,
        marginTop: LayoutTool.scaleSize(30),
    },
    MapViewStyle: {
        borderRadius: LayoutTool.scaleSize(16),
        width: LayoutTool.scaleSize(670),
        height: LayoutTool.scaleSize(420),
    },

    storeInfoBgViewStyle: {
        width: SCREEN_WIDTH,
        height: LayoutTool.scaleSize(208),
        marginTop: LayoutTool.scaleSize(10),
    },
    storeInfoViewStyle: {
        marginTop: LayoutTool.scaleSize(30),
        width: SCREEN_WIDTH,
        height: LayoutTool.scaleSize(170),
        flexDirection: 'row',
    },
    leftInfoViewStyle: {
        width: SCREEN_WIDTH - LayoutTool.scaleSize(200),
        height: LayoutTool.scaleSize(170),
        flexDirection: 'row',
    },
    foodNamePriceViewStyle: {
        width: SCREEN_WIDTH-LayoutTool.scaleSize(200)-LayoutTool.scaleSize(218),
        // height: LayoutTool.scaleSize(127),
        marginLeft: LayoutTool.scaleSize(20),
    },

    rightInfoNumViewStyle: {
        marginTop: LayoutTool.scaleSize(60),
        marginRight: LayoutTool.scaleSize(40),
        width: LayoutTool.scaleSize(160),
        height: LayoutTool.scaleSize(122),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    totalViewStyle: {
        width: SCREEN_WIDTH,
        height: LayoutTool.scaleSize(100),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:'space-between',
    },
    totalPriceStyle: {
        flexDirection: 'row',
        marginRight: LayoutTool.scaleSize(40),
    },
    // 优惠券
    couponViewStyle:{
        width: SCREEN_WIDTH-LayoutTool.scaleSize(60),
        height: LayoutTool.scaleSize(110),
        marginLeft: LayoutTool.scaleSize(40),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:'space-between',
    },
    couponPriceViewStyle: {
        height: LayoutTool.scaleSize(90),
        flexDirection: 'row',
        alignItems: 'center',
    },

});
