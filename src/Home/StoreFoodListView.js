
// 支付红包提示View

import React from 'react'
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    SectionList,
    DeviceEventEmitter,
    TextInput,
    Alert, Linking
} from 'react-native'

import LayoutTool, {IOS, SCREEN_HEIGHT, SCREEN_WIDTH} from '../../Tools/Layout'
import NetService from '../../Tools/NetService'
import ToastView from '../../Tools/ToastHudView'
import Loading from  '../../Tools/Loading'

import MyShareFriendWebView from '../Mine/MyShareFriendWebView'
import LoginView from '../Login/Login'
import StoreMapListView from './StoreMapListView'
import SelectCouponView from "../TakeMeals/SelectUseCouponView"
import SureOrderView from "./SureOrderView"

import * as WeChat from 'react-native-wechat';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

const dismissKeyboard = require('dismissKeyboard');

export default class StoreFoodListView extends React.Component{

    static navigationOptions = ({navigation}) => {
        return {
            title: "点餐",
        };
    };

    constructor(props) {
        super(props);
        this._onChangePriceText = this._onChangePriceText.bind(this);
        this.state = {
            storeData: "",          // 门店数据模型

            foodDataList: [],       // 菜品数组

            defaultFoodData: "",    // 手动输入金额的默认菜品

            priceValue: "",         // 手动输入的金额

            realPayShowPrice: "",   // 显示的实付金额

            selectCouponData: "",   // 选中的优惠券

            useCouponDataList: [],  // 可使用优惠券数组

            btnImg: require("../../images/HomeImg/icon_surePayNormal.png"),

            weChatLoginViewShow: true,  // 判断是否安装微信

            netStatus: "",          // 是否请求了网络
        }
    }

    componentWillUnmount(){

    }
    componentDidMount(){
        const { params } = this.props.navigation.state;
        this.setState({
            storeData: params.storeData,
        });
        console.log(params.storeData);

        this.getFoodInfoNet({"stroeId": params.storeData.id});

        let that = this;
        // 取餐点列表去点餐按钮点击通知
        this.listener =DeviceEventEmitter.addListener('goOrderNotification',function(data){
            that.setState({
                storeData: data,

                selectCouponData: "",   // 选中的优惠券数据模型

                realPayPrice: "",       // 实际支付金额

                priceValue: "",         // 输入的金额
            });
            that.getFoodInfoNet({"stroeId": data.id});
        });
        // 登录成功后通知
        this.listener =DeviceEventEmitter.addListener('loginSuccessNotification',function(param){
            if (that.state.priceValue.length > 0 && that.state.storeData){
                that.getUseCouponNetData({"userId":global.userId,"totalPrice":that.state.priceValue,"dishId":that.state.defaultFoodData.dishId,"storeId":that.state.storeData.id});
            }
        });

        // 微信初始化
        WeChat.registerApp('wx589d650bd9ecd315');
        // 判断是否安装微信
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
    }

    // 获取菜品数据
    getFoodInfoNet(param) {
        NetService.POST("heque-eat/eat/storeEatInfo", param, data=>{
            // feeType 1- 点餐模式   2-自助模式
            // state  true:营业中  false:休息中
            if (this.state.storeData.state === false) {
                this.setState({
                    foodDataList: [],
                    defaultFoodData:"",
                });
            } else {
                if (this.state.storeData.feeType != 2) {
                    this.setState({
                        foodDataList: data,
                        defaultFoodData: "",
                    });
                }else {
                    this.setState({
                        foodDataList:[],
                    });
                    if (data.length > 0) {
                        this.setState({
                            defaultFoodData: data[0],
                        });
                    }
                }
            }
            this.setState({
                netStatus: "netStatus",
            });
        }, fail=>{
            this.setState({
                netStatus: "netStatus",
            });
        },error=>{
            this.setState({
                netStatus: "netStatus",
            });
        });
    }

    render(){

        let distance = "";
        let until = "";
        if (this.state.storeData.number > 1000) {
            distance = this.state.storeData.number / 1000;
            distance = distance.toFixed(2);
            until = "km";
        } else {
            distance = this.state.storeData.number;
            until = "m";
        }

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

        // 优惠券金额显示样式
        let textColor = "";
        let textFont = "";
        if (this.state.selectCouponData) {
            textColor = '#FF9C43';
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

        return (
            <View style={styles.container}>

                <KeyboardAwareScrollView
                    ref='scroll'
                    onKeyboardWillShow={(frames: Object) => {
                        console.log('键盘弹出时，键盘高度改变时：', frames)
                    }}>

                    <View style={styles.topBgViewStyle}>
                        <View style={styles.storeInfoViewStyle}>
                            <TouchableOpacity style={styles.storeNameBgViewStyle} activeOpacity={1} onPress={()=>this.storeNameItemClick()}>
                                <Text style={styles.storeNameTextStyle} numberOfLines={1}>{this.state.storeData.name}</Text>
                                <Image style={styles.storeNameRightStyle} source={require("../../images/MineImg/icon_right.png")}/>
                            </TouchableOpacity>

                            <View style={styles.distanceAddsViewStyle}>
                                <Text numberOfLines={1} style={styles.addsNormalTextStyle}>距您 </Text>
                                <Text numberOfLines={1} style={styles.addsHighTextStyle}>{distance}</Text>
                                <Text numberOfLines={1} style={styles.addsTextStyle}>{until} | {this.state.storeData.adds}</Text>
                            </View>

                            <Text numberOfLines={2} style={styles.timeTextStyle}>营业时间：{timeArray.join('/')}</Text>

                        </View>

                        <TouchableOpacity activeOpacity={1} onPress={()=>this.phoneItemClick()}>
                            <Image style={styles.phoneImgStyle} source={require("../../images/HomeImg/icon_callPhone.png")}/>
                        </TouchableOpacity>
                    </View>

                    {!this.state.defaultFoodData?null:<View style={styles.inputBannerViewStyle}>
                        <TouchableOpacity activeOpacity={1} onPress={()=>this.shareBtnClick()}>
                            <Image source={require('../../images/HomeImg/icon_inputBanner.png')}
                                   style={styles.inputBannerViewStyle}/>
                        </TouchableOpacity>
                    </View>}
                    {!this.state.defaultFoodData?null:<Text style={styles.titleTextStyle}>买单</Text>}
                    {!this.state.defaultFoodData?null:<View>
                        {/*<View style={styles.handInputTopViewStyle}/>*/}
                        <Image style={styles.handInputTopViewStyle} source={require("../../images/HomeImg/icon_dianCanTopHalfImg.png")}/>
                        <View style={styles.inputHandBgViewStyle}>
                            <Text style={styles.inputTitleStyle}>请输入金额</Text>
                            <View style={styles.inputBgViewStyle}>
                                <Text style={styles.RMBStyle}>￥</Text>
                                <TextInput style={styles.inputStyle}
                                           maxLength = {7}
                                           placeholder = '请输入支付金额'
                                           placeholderTextColor = {'#8B8782'}
                                           selectionColor={'#FF9C43'}
                                           keyboardType = {'numeric'} // numeric:数字键盘带点
                                           returnKeyType = "done"
                                           underlineColorAndroid = "transparent"
                                           onChangeText={this._onChangePriceText}
                                           value = {this.state.priceValue}
                                />
                            </View>
                            <View style={styles.inputLineStyle}/>

                            {/*优惠券界面*/}
                            {(this.state.priceValue.length>0&&global.isLogin)?
                                <TouchableOpacity activeOpacity={1} onPress={()=>this.couponSelectClick()}>
                                    <View style={styles.couponViewStyle}>
                                        <Text style={styles.orderMoneyStyle}>优惠券</Text>
                                        <View style={styles.couponRightViewStyle}>
                                            <Text style={couponTextStyle}>{(this.state.useCouponDataList.length > 0)?(this.state.selectCouponData?"-￥"+this.state.selectCouponData.faceValue:"请选择优惠券"):"暂无可用优惠券"}</Text>
                                            <Image style={styles.rightImgStyle} source={require("../../images/MineImg/icon_right.png")}/>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                :null}

                            {(this.state.priceValue.length>0&&global.isLogin)?<View style={styles.couponLineStyle}/>:null}
                            {/*实付价格*/}
                            {(this.state.priceValue.length>0&&global.isLogin)?<View style={styles.totalPriceViewStyle}>
                                <Text style={{fontSize:LayoutTool.setSpText(32), color:"#F2D3AB", fontWeight:'bold'}}>实付：</Text>
                                <Text style={{fontSize:LayoutTool.setSpText(36), color:"#F2D3AB", fontWeight:'bold', marginRight: LayoutTool.scaleSize(20)}}>￥{(this.state.realPayShowPrice>0)?this.state.realPayShowPrice:0}</Text>
                            </View>:null}

                            <TouchableOpacity activeOpacity={1} onPress={()=>this.surePayBtnClick()}>
                                <Image style={styles.surePayStyle} source={this.state.btnImg}/>
                            </TouchableOpacity>
                        </View>
                    </View>}

                    {this.state.defaultFoodData?null:
                        <SectionList
                            style={styles.SectionViewStyle}
                            showsVerticalScrollIndicator={false}
                            ListHeaderComponent={() =>
                                <View style={{backgroundColor: '#222224',}}>
                                    <View style={styles.bannerImgStyle}>
                                        <TouchableOpacity activeOpacity={1} onPress={()=>this.shareBtnClick()}>
                                            <Image source={require('../../images/HomeImg/icon_bannerFriend.png')}
                                                   style={styles.bannerImgStyle}/>
                                        </TouchableOpacity>
                                    </View>
                                    {/* state  true:营业中  false:休息中*/}
                                    {/* feeType 1- 点餐模式   2-自助模式*/}
                                    {(this.state.storeData.state == false || (this.state.foodDataList.length === 0&&this.state.storeData.feeType ==1))?null:<Text style={styles.titleTextStyle}>{this.state.defaultFoodData?"买单":"点餐"}</Text>}

                                    {(this.state.storeData.state == false || (this.state.foodDataList.length === 0&&this.state.storeData.feeType ==1))?null:<View style={{height:LayoutTool.scaleSize(20),}}/>}

                                    {/*/!*门店列表数组为空显示*!/*/}
                                    {(this.state.storeData.state==false && this.state.netStatus)?
                                        <TouchableOpacity activeOpacity={1} onPress={()=>this.storeNameItemClick()}>
                                            <Image
                                                style={{
                                                    marginLeft:(SCREEN_WIDTH - LayoutTool.scaleSize(672))/2,
                                                    width: LayoutTool.scaleSize(672),
                                                    height: LayoutTool.scaleSize(628),
                                                    marginTop: LayoutTool.scaleSize(-80),
                                                }}
                                                source={require("../../images/HomeImg/icon_restStateImg.png")}
                                            />
                                        </TouchableOpacity> :
                                        ((this.state.foodDataList.length === 0&&!this.state.defaultFoodData && this.state.netStatus)?
                                            <TouchableOpacity activeOpacity={1} onPress={()=>this.storeNameItemClick()}>
                                                <Image
                                                    style={{
                                                        marginTop: LayoutTool.scaleSize(-80),
                                                        marginLeft: (SCREEN_WIDTH - LayoutTool.scaleSize(672))/2,
                                                        width: LayoutTool.scaleSize(672),
                                                        height: LayoutTool.scaleSize(628),
                                                    }}
                                                    source={require("../../images/HomeImg/icon_readyStateImg.png")}
                                                />
                                            </TouchableOpacity> :null)}
                                </View>
                            }
                            renderItem={({item, index, section}) =>
                                this._renderItem(item, index, section)
                            }

                            sections={[
                                { title: "Title1", data:this.state.foodDataList}
                            ]}

                            keyExtractor={(item, index) => item + index}
                        />}

                </KeyboardAwareScrollView>

                <Loading ref={(view)=>{Loading.loadingDidCreate(view)}}>
                </Loading>
            </View>
        )
    }
    // 创建item
    _renderItem(data, index, section) {

        let topMargin = 0;
        if (IOS) {
            topMargin = LayoutTool.scaleSize(10);
        }
        let foodBriefStyle = {
                fontSize: LayoutTool.setSpText(24),
                marginLeft: LayoutTool.scaleSize(20),
                marginRight: LayoutTool.scaleSize(4),
                color: "#8B8782",
                marginTop: topMargin,
            };

        return(
            <TouchableOpacity style={{backgroundColor: '#222224'}} activeOpacity={1} onPress={()=>this.foodItemClick(data, index)}>

                <View style={styles.itemBgViewStyle}>
                    <Image style={styles.foodImgStyle} source={{uri:data.dishesUrl}}/>

                    <View style={styles.foodViewStyle}>
                        <Text numberOfLines={1} style={styles.foodNameStyle}>{data.dishName}</Text>
                        <Text numberOfLines={2} style={foodBriefStyle}>{data.dishesRemake}</Text>

                        <View style={styles.priceViewStyle}>
                            <Text style={{
                                        color:"#FF9C43",
                                        fontSize: LayoutTool.setSpText(26),
                                        marginLeft: LayoutTool.scaleSize(20),
                                        marginTop: LayoutTool.scaleSize(13),
                                    }}>￥</Text>
                            <Text style={{
                                        fontWeight: 'bold',
                                        color:"#FF9C43",
                                        fontSize: LayoutTool.setSpText(40),
                            }}>{data.appSpecialOffer?data.appSpecialOffer:data.originalPrice}</Text>

                            {data.appSpecialOffer?<Text style={{
                                                            textDecorationLine:'line-through',
                                                            color:"#8B8782",
                                                            fontSize: LayoutTool.setSpText(24),
                                                            marginTop: LayoutTool.scaleSize(12),
                                                            marginLeft: LayoutTool.scaleSize(20)
                                                        }}
                                                    >￥{data.originalPrice}</Text>:null}

                        </View>

                    </View>

                    <Image style={styles.buyImgStyle} source={require("../../images/HomeImg/icon_buy.png")}/>

                </View>
                <View style={styles.lineStyle}/>

            </TouchableOpacity>
        )
    }
    // 门店按钮点击
    storeNameItemClick() {
        this.props.navigation.push('StoreMapListView');
    }

    // 分享有礼
    shareBtnClick() {
        if (global.isLogin) {
            this.props.navigation.push('MyShareFriendWebView');
        } else {
            this.props.navigation.push('LoginView');
        }
    }
    // 拨打电话
    phoneItemClick () {
        let brief = "确定拨打电话：" + this.state.storeData.storePhoneNumber + " 吗？";
        Alert.alert('提示', brief,
            [
                {text: '取消'},
                {
                    text: '确认',
                    onPress: () => {
                        let phone = "tel:" + this.state.storeData.storePhoneNumber;
                        console.log("phone...." + phone);
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

    foodItemClick(data, index) {
        if (global.isLogin) {
            this.props.navigation.push('SureOrderView', {"storeData":this.state.storeData, "foodData":data});
        } else {
            // 设置路由
            this.props.navigation.push('LoginView', {"type": 1});
        }
    }

    // 监听输入框的文字变化
    _onChangePriceText(inputData) {
        // 限定小数后面只能输入2位数字
        let newText = (inputData != '' && inputData.substr(0,1) == '.') ? '' : inputData;
        newText = newText.replace(/^0+[0-9]+/g, "0"); //不能以0开头输入
        newText = newText.replace(/[^\d.]/g,""); //清除"数字"和"."以外的字符
        newText = newText.replace(/\.{2,}/g,"."); //只保留第一个, 清除多余的
        newText  = newText.replace(".","$#$").replace(/\./g,"").replace("$#$",".");
        newText = newText.replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3'); //只能输入两个小数

        if (parseInt(newText*100) > 100000) {
            return;
        } else {
            this.setState({
                priceValue: newText,
            });
        }
        if (newText.length > 0) {
            this.setState({
                btnImg: require("../../images/HomeImg/icon_surePayHigh.png"),
            });
        } else {
            this.setState({
                btnImg: require("../../images/HomeImg/icon_surePayNormal.png"),
            });
        }
        // 登录状态且输入完成后请求
        if (newText.length > 0 && this.state.storeData){
            this.getUseCouponNetData({"userId":global.userId,"totalPrice":newText,"dishId":this.state.defaultFoodData.dishId,"storeId":this.state.storeData.id});
        }
    }

    // 查询是否有券可以使用
    getUseCouponNetData(param) {
        if (global.isLogin === true) {
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
                });

                // 实际支付金额
                let foodPriceValue = "";
                if (this.state.priceValue) {
                    foodPriceValue = this.state.priceValue;
                    if (this.state.selectCouponData){
                        foodPriceValue = foodPriceValue*100 - this.state.selectCouponData.faceValue*100;
                        foodPriceValue = foodPriceValue/100;
                        foodPriceValue = foodPriceValue.toFixed(2);
                    }
                    this.setState({
                        realPayShowPrice: foodPriceValue,
                    })
                }
            }, response=>{
            });
        }
    }

    // 选择优惠券
    couponSelectClick() {
        if (this.state.useCouponDataList.length > 0) {
            if (isLogin === true) {
                this.props.navigation.navigate('SelectCouponView', {
                    callback: (selectCouponData) => {
                        console.log("是否选择了券返回......->");
                        console.log(selectCouponData);

                        // 实际支付金额
                        let foodPriceValue = 0;
                        if (this.state.priceValue) {
                            foodPriceValue = this.state.priceValue;
                            if (selectCouponData){
                                foodPriceValue = foodPriceValue*100 - selectCouponData.faceValue*100;
                                foodPriceValue = foodPriceValue/100;
                                foodPriceValue = foodPriceValue.toFixed(2);
                            }
                        }

                        let tempSelectCouponData = "";
                        if (selectCouponData) {
                            tempSelectCouponData = selectCouponData;
                        }
                        this.setState({
                            realPayShowPrice: foodPriceValue,
                            selectCouponData: tempSelectCouponData,
                        })
                    },"totalPrice":this.state.priceValue,"foodData":this.state.defaultFoodData,"storeData":this.state.storeData,"fromType":"sureOrder", "selectCouponId":this.state.selectCouponData.id,
                });
            }
        } else {
            ToastView.showShortHudView("暂无可用优惠券");
            return false;
        }
    }

    // 确认支付按钮点击
    surePayBtnClick() {
        console.log("确认支付");
        dismissKeyboard();
        if (this.state.priceValue.length == 0) {
            return;
        }
        if (this.isMoney(this.state.priceValue) === false) {
            ToastView.showShortHudView("请输入正确的金额");
            return;
        }
        if (parseInt((this.state.priceValue*100)) === 0) {
            ToastView.showShortHudView("请输入正确的金额");
            return;
        }
        if (global.isLogin === false) {
            // 未登录
            this.props.navigation.push('LoginView', {"type": 1});
        }else {
            if (this.state.weChatLoginViewShow === false) {
                Loading.dismiss();
                ToastView.showShortHudView("您未安装微信,无法完成支付");
                return false;
            }
            let param = {"appType":"app",           "codeC":cityCode,
                "latitude":global.lat,              "longitude":global.lon,
                "storeId":this.state.storeData.id,  "totalPrice":this.state.priceValue,
                "userId":userId,                    "dishId":this.state.defaultFoodData.dishId};
            Loading.showLoading("正在支付...");
            NetService.POST('heque-eat/order_info/input_amount_order_info', param, data=> {
                if (this.state.selectCouponData) {
                    // 获取使用券后实际支付金额
                    this.getRealPayPriceNet({"userCardMedalId":this.state.selectCouponData.id, "orderId":data.orderId,});
                } else {
                    // 非0元无优惠券支付
                    this.payPriceNoZeroNet({"id":data.orderId, "paymentPrice": this.state.realPayShowPrice, "channel":"app"});
                }
            }, fail=>{
                Loading.dismiss();
            },err=>{
                Loading.dismiss();
            });
        }
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
            Loading.dismiss();
        },err=>{
            Loading.dismiss();
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

                        priceValue: "",
                    });
                    //回调成功处理
                    ToastView.showShortHudView("支付成功");

                    global.orderSuccess = "1";
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
                this.setState({
                    selectCouponData: "",   // 选中的优惠券数据模型

                    realPayPrice: "",       // 实际支付金额

                    priceValue: "",
                });
                global.orderSuccess = "1";
                this.props.navigation.popToTop();
            })
        }, response=>{
            if (response.code === NetService.Token_Lose) {
                // 删除数据
                this.setState({

                    weChatLoginViewShow: true,  // 判断是否有安装微信

                    useCouponDataList: [],  // 可用使用的券数组

                    selectCouponData: "",       // 选中的优惠券
                })
            }
            Loading.dismiss();
        }, err=>{
            Loading.dismiss();
        });
    }
    // 0元支付
    payPriceZeroNet(param){
        NetService.POST("heque-eat/wechat_pay/zero_element_pay", param, data=>{
            Loading.dismiss();
            //回调成功处理
            ToastView.showShortHudView("支付成功");

            global.orderSuccess = "1";
            this.props.navigation.popToTop();

            this.setState({
                selectCouponData: "",   // 选中的优惠券数据模型

                realPayPrice: "",       // 实际支付金额

                priceValue: "",
            });
            // 发送支付成功消息通知
            DeviceEventEmitter.emit('sureOrderPaySuccessNotification', '');

        }, response=>{
            ToastView.showShortHudView(response.message);
            if (response.code === NetService.Token_Lose) {
                // 删除数据
                this.setState({

                    weChatLoginViewShow: true,  // 判断是否有安装微信

                    useCouponDataList: [],  // 可用使用的券数组

                    selectCouponData: "",       // 选中的优惠券
                })
            }
            Loading.dismiss();
        }, err=>{
            Loading.dismiss();
        });
    }

    // 金额正则表达式
    isMoney(s) {
        //金额 只允许正数
        let exp = /^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/;
        //金额 允许正（+）负数
        // let exp = /(^([+-]?)[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^([+-]?)(0){1}$)|(^([+-]?)[0-9]\.[0-9]([0-9])?$)/; 

        //金额 允许正负数
        // let exp = /(^([-]?)[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^([-]?)(0){1}$)|(^([-]?)[0-9]\.[0-9]([0-9])?$)/;
        if(exp.test(s)) {
            console.log("正确金额");
            return true;
        } else {
            console.log('错误金额数字');
            return false;
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222224',
    },

    topBgViewStyle: {
        width:SCREEN_WIDTH,
        flexDirection: 'row',

        backgroundColor: '#222224',
    },
    storeInfoViewStyle: {
        width: SCREEN_WIDTH-LayoutTool.scaleSize(100),
    },
    storeNameBgViewStyle: {
        width:SCREEN_WIDTH - LayoutTool.scaleSize(180),
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: LayoutTool.scaleSize(46),
        marginLeft: LayoutTool.scaleSize(40),
    },
    storeNameTextStyle: {
        fontWeight: "bold",
        fontSize: LayoutTool.setSpText(44),
        color: "#F2D3AB",
    },
    storeNameRightStyle: {
        width: LayoutTool.scaleSize(15),
        height: LayoutTool.scaleSize(24),
        marginLeft: LayoutTool.scaleSize(20),
    },

    distanceAddsViewStyle: {
        marginLeft: LayoutTool.scaleSize(40),
        marginTop: LayoutTool.scaleSize(20),
        flexDirection: 'row',
        marginRight: LayoutTool.scaleSize(10),
    },
    addsNormalTextStyle: {
        fontSize: LayoutTool.setSpText(24),
        color: "#8B8782",
    },
    addsHighTextStyle: {
        fontSize: LayoutTool.setSpText(24),
        color: "#F2D3AB",
    },
    addsTextStyle: {
        fontSize: LayoutTool.setSpText(24),
        color: "#8B8782",
        marginRight: LayoutTool.scaleSize(110),
    },
    timeTextStyle: {
        fontSize: LayoutTool.setSpText(24),
        color: "#8B8782",
        marginLeft: LayoutTool.scaleSize(40),
        marginTop: LayoutTool.scaleSize(10),
    },
    phoneImgStyle: {
        width: LayoutTool.scaleSize(59),
        height: LayoutTool.scaleSize(59),
        marginLeft: LayoutTool.scaleSize(2),
        marginTop: LayoutTool.scaleSize(66),
    },

    SectionViewStyle: {
        width: SCREEN_WIDTH,
    },
    bannerImgStyle: {
        backgroundColor: '#222224',
        height: LayoutTool.scaleSize(324),
        width:SCREEN_WIDTH,
    },
    inputBannerViewStyle: {
        backgroundColor: '#222224',
        height: LayoutTool.scaleSize(234),
        width:SCREEN_WIDTH,
    },
    titleTextStyle: {
        fontSize: LayoutTool.setSpText(36),
        color: "#F2D3AB",
        fontWeight: 'bold',
        marginLeft: LayoutTool.scaleSize(40),
        marginTop: LayoutTool.scaleSize(-20),
    },

    itemBgViewStyle: {
        width:SCREEN_WIDTH,
        flexDirection: 'row',
        backgroundColor: '#222224',
    },
    foodImgStyle: {
        marginLeft: LayoutTool.scaleSize(40),
        marginTop: LayoutTool.scaleSize(30),
        width: LayoutTool.scaleSize(226),
        height: LayoutTool.scaleSize(158),
        borderRadius: LayoutTool.scaleSize(16),
    },
    foodViewStyle:{
        backgroundColor: '#222224',
        width: SCREEN_WIDTH-LayoutTool.scaleSize(266)-LayoutTool.scaleSize(160),
    },
    priceViewStyle: {
        flexDirection: 'row',
        position:"absolute",
        top: LayoutTool.scaleSize(146),
        backgroundColor: '#222224',
    },
    foodNameStyle: {
        fontWeight: "bold",
        fontSize: LayoutTool.setSpText(36),
        marginLeft: LayoutTool.scaleSize(20),
        color: "#F2D3AB",
        marginTop: LayoutTool.scaleSize(30),
    },


    buyImgStyle: {
        marginLeft: LayoutTool.scaleSize(4),
        marginTop: LayoutTool.scaleSize(120),
        width: LayoutTool.scaleSize(120),
        height: LayoutTool.scaleSize(59),
    },
    lineStyle:{
        marginLeft: LayoutTool.scaleSize(289),
        marginRight: LayoutTool.scaleSize(40),
        height: LayoutTool.scaleSize(1),
        backgroundColor: "#303030",
        marginTop: LayoutTool.scaleSize(34),
    },

    inputHandBgViewStyle: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT - LayoutTool.scaleSize(500),
        backgroundColor: "#2F2F30",
    },

    handInputTopViewStyle: {
        backgroundColor: "#222224",
        width: SCREEN_WIDTH,
        height: LayoutTool.scaleSize(95),
    },
    inputTitleStyle: {
        fontSize: LayoutTool.setSpText(30),
        marginLeft: LayoutTool.scaleSize(42),
        color: "#A7A39E",
        marginTop: LayoutTool.scaleSize(-1),
    },

    inputBgViewStyle: {
        backgroundColor: "#2F2F30",
        flexDirection: 'row',
        justifyContent: "space-between",
    },
    RMBStyle: {
        fontSize: LayoutTool.setSpText(60),
        marginLeft: LayoutTool.scaleSize(42),
        color: "#F2D3AB",
        marginTop: LayoutTool.scaleSize(60),
    },
    inputStyle: {
        color: '#F2D3AB',
        fontSize: LayoutTool.scaleSize(40),
        marginRight: LayoutTool.scaleSize(66),
        textAlign: 'right',
        marginTop: LayoutTool.scaleSize(60),
    },

    inputLineStyle: {
        height:LayoutTool.scaleSize(1),
        marginLeft: LayoutTool.scaleSize(49),
        marginRight: LayoutTool.scaleSize(48),
        marginTop:LayoutTool.scaleSize(20),
        backgroundColor: "#414142",
    },

    orderMoneyStyle: {
        fontSize: LayoutTool.setSpText(32),
        color: '#F2D3AB',
        marginLeft: LayoutTool.scaleSize(44),
    },
    couponViewStyle: {
        width: SCREEN_WIDTH - LayoutTool.scaleSize(50),
        height: LayoutTool.scaleSize(110),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    couponRightViewStyle: {
        height: LayoutTool.scaleSize(110),
        flexDirection: 'row',
        alignItems: 'center',
    },
    couponLineStyle: {
        height:LayoutTool.scaleSize(1),
        marginLeft: LayoutTool.scaleSize(49),
        marginRight: LayoutTool.scaleSize(48),
        backgroundColor: "#414142",
    },
    totalPriceViewStyle: {
        width: SCREEN_WIDTH - LayoutTool.scaleSize(50),
        height: LayoutTool.scaleSize(110),
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    rightImgStyle: {
        width: LayoutTool.scaleSize(15),
        height: LayoutTool.scaleSize(24),
    },

    surePayStyle: {
        width: LayoutTool.scaleSize(653),
        height: LayoutTool.scaleSize(84),
        marginTop: LayoutTool.scaleSize(50),
        marginLeft: LayoutTool.scaleSize(48),
    },
});
