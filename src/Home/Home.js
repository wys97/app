import React from 'react'
import {
    StyleSheet,
    View,
    Text,
    Modal,
    DeviceEventEmitter,
    SectionList,
    TouchableOpacity,
    Image,
    Linking, Alert, ImageBackground
} from 'react-native'

const dismissKeyboard = require('dismissKeyboard');

import MapView from 'react-native-amap3d'
import SplashScreen from 'react-native-splash-screen'
import * as WeChat from 'react-native-wechat';

import ShowNoPayPointOutView from '../Hud/ShowNoPayPointOutView'    // 去支付弹框提示
import StoreFoodListView from './StoreFoodListView'     // 菜品列表
import CitySelectView from  "./CitySelectView"

import TakeMeals from "../TakeMeals/TakeMeals"          // 取餐
import LoginView from '../Login/Login'                  // 登录
import MyShareFriendWebView from '../Mine/MyShareFriendWebView'   // 分享有礼

import CouponManyTypeShowView from "../Hud/CouponManyTypeShowView"
import CouponSolaDrawShowView from "../Hud/CouponSolaDrawShowView"


import {SCREEN_WIDTH, STATUSBAR_HEIGHT, unitWidth} from '../../Tools/Layout';
import LayoutTool from "../../Tools/Layout"
import NetService from "../../Tools/NetService";

import SwView from 'react-native-swiper';

import Storage from 'react-native-storage';
import asyncStorage from "@react-native-community/async-storage";
import ToastView from "../../Tools/ToastHudView";
import Loading from "../../Tools/Loading";

const storage = new Storage({
    size: 1000,// 最大容量，默认值1000条数据循环存储
    storageBackend: asyncStorage, // 存储引擎：对于RN使用AsyncStorage，如果不指定则数据只会保存在内存中，重启后即丢失
    defaultExpires: null,// 数据过期时间，默认一整天（1000 * 3600 * 24 毫秒），设为null则永不过期
    enableCache: true,// 读写时在内存中缓存数据。默认启用。
    sync: {} // 如果storage中没有相应数据，或数据已过期,则会调用相应的sync方法，无缝返回最新数据。
});


export default class Home extends React.Component {

    static navigationOptions = ({navigation}) => {
        return {
            header: null,  //隐藏顶部导航栏
            title: '首页',
        };
    };

    constructor(props) {
        super(props);
        this.state = {

            noPayShowView: false,       //未支付弹出是否显示

            storeData: "",      // 门店数据模型

            storeDataList: [],      // 门店数组模型

            latelyStoreId: "",  // 最近门店Id

            foodDataList: [],   // 菜品数组

            suppType: "",       // 当前供应时间段 1:午餐 2:晚餐

            showView: false,        // 是否展示领券View
            showMoreView: false,    // 是否展示多种领券View

            showTakeMealPayParam: "",       // 1:未支付  2:已支付未取餐

            refreshing: false,

            priceValue: "",         // 手动输入的金额
            opacityValue: 1,

            useCouponDataList: [],  // 可使用优惠券数组

            weChatLoginViewShow: true,  // 判断是否安装微信

            realPayShowPrice: "",       // 显示的实付金额

            defaultFoodData: "",    // 手动输入的菜品数据模型

            locationFail: 0,        // 0:定位中 1:定位成功(有城市名称和城市编号)  2:定位半失败(没有城市名称或者城市编号) 3:定位失败
        }
    }

    // 修改显示、隐藏选择吃饭方式View
    setShowTypeVisible = (visible) => {
        this.setState({
            showTypeVisible: visible
        });
    };

    componentDidMount() {
        SplashScreen.hide();

        // 初始化默认的地理信息
        global.cityCode = "440300";             // 城市编码
        global.city = "深圳市";                  // 城市名称
        global.lon = "114.060718";              // 经度
        global.lat = "22.541730";               // 纬度

        global.phoneNo = "";

        // 用于声明全局变量
        storage.load({
            key: 'userInfo',
        }).then(ret => {
            global.userId = ret.userId;
            global.phoneNo = ret.phoneNo;
            global.token = ret.token;

            global.isLogin = true;

        }).catch(err => {
            global.phoneNo = "";
            global.isLogin = false;

            console.warn(err.message);
            console.log('...error...')
        });

        WeChat.registerApp('wx589d650bd9ecd315');

        WeChat.isWXAppInstalled()
            .then((isInstalled) => {
                if (isInstalled) {
                    this.setState({
                        weChatLoginViewShow: true,
                    })
                } else { // 没有安装微信
                    this.setState({
                        weChatLoginViewShow: false,
                    })
                }
            });

        let that = this;
        // 去支付按钮点击
        this.listener = DeviceEventEmitter.addListener('goPayNotification', function (type) {
            that.setState({
                noPayShowView: false,
            });
            that.props.navigation.navigate('TakeMeals');
        });

        // 登录成功后通知
        this.listener = DeviceEventEmitter.addListener('loginSuccessNotification', function (param) {
            that.getCouponDrawData();
            if (that.state.priceValue.length > 0 && that.state.storeData) {
                that.getUseCouponNetData({
                    "userId": global.userId,
                    "totalPrice": that.state.priceValue,
                    "dishId": that.state.defaultFoodData.dishId,
                    "storeId": that.state.storeData.id
                });
            }
        });
        // 注册成功后通知
        this.listener = DeviceEventEmitter.addListener('registerSuccessNotification', function (param) {
            that.getCouponDrawData();
        });
        // 领券通知
        this.listener = DeviceEventEmitter.addListener('drawCouponNotification', function (type) {
            that.setState({
                showView: false,
                showMoreView: false,
            });
            if (that.state.priceValue.length > 0 && that.state.storeData) {
                that.getUseCouponNetData({
                    "userId": global.userId,
                    "totalPrice": that.state.priceValue,
                    "dishId": that.state.defaultFoodData.dishId,
                    "storeId": that.state.storeData.id
                });
            }
        });

        // 接受选择城市的通知
        this.listener = DeviceEventEmitter.addListener('citySelectNotification', function (data) {

            global.cityCode = data.codeC;
            global.city = data.name;

            // 获取取餐点列表
            that.getStoreInfoNet({"cityCode": data.codeC, "longitude": lon, "latitude": lat});
        });

        // 取餐点列表去点餐按钮点击
        this.listener = DeviceEventEmitter.addListener('goOrderHomeNotification', function (cityName, cityCode) {

            global.cityCode = cityCode;
            global.city = cityName;

            // 获取取餐点列表
            that.getStoreInfoNet({"cityCode": cityCode, "longitude": lon, "latitude": lat});
        });

        // 回到此界面就会调用此方法
        this.props.navigation.addListener(
            'willFocus',
            payload => {
                if (global.orderSuccess == 1) {
                    this.props.navigation.navigate('TakeMeals');
                    global.orderSuccess = "0";
                }
            }
        );

        // 获取门店信息
        this.getStoreInfoNet({"cityCode": global.cityCode, "longitude": global.lon, "latitude": global.lat});
    }

    // 移除通知事件
    componentWillUnmount() {
        this.listener.remove();
    }

    // 获取地理信息
    getLocationInfoNet(param) {
        console.log("逆地理编码：" + param.longitude + "......" + param.latitude);
        console.log("global.locationCityName..." + global.locationCityName);
        if (param.longitude && !global.locationCityName) {
            NetService.GET("heque-eat/eat/get_city_code_and_city", param, data => {
                // locationFail 0:定位失败 1:定位成功(有城市名称和城市编号)  2:定位半失败(没有城市名称或者城市编号)
                if (data.city && data.cityCode) {
                    // 定位成功后获取门店信息
                    this.getStoreInfoNet({
                        "cityCode": cityCode,
                        "longitude": param.longitude,
                        "latitude": param.latitude
                    });

                    global.cityCode = data.cityCode;
                    global.city = data.city;
                    global.locationCityName = data.city;    // 定位城市
                    global.lon = param.longitude;
                    global.lat = param.latitude;
                    this.setState({
                        locationFail: 1,
                    });
                } else {
                    this.setState({
                        locationFail: 2,
                    });
                }
            }, fail => {
                this.setState({
                    locationFail: 3,
                });
            }, error => {
                this.setState({
                    locationFail: 3,
                });
            });
        }
    }

    // 获取门店信息
    getStoreInfoNet(param) {
        let storeArray = [];
        let stateTrueArray = [];
        let stateFalseArray = [];
        NetService.POST("heque-eat/eat/storeList", param, data => {
            // 按照距离升序排序
            data.sort(function (a, b) {
                return (a.number - b.number)
            });
            this.setState({
                refreshing: false,
            });
            if (data.length == 0) {
                this.setState({
                    storeDataList: [],
                    storeData: "",
                });
            } else {
                // state  false:非营业  true:营业中
                for (let i = 0; i < data.length; i++) {
                    let tempData = data[i];
                    // 营业中
                    if (tempData.state == true) {
                        stateTrueArray.push(tempData);
                    } else { // 非营业中
                        stateFalseArray.push(tempData);
                    }
                }
                storeArray = stateTrueArray.concat(stateFalseArray);

                let storeData = {};
                if (storeArray.length > 0) {
                    storeData = storeArray[0];
                }
                this.setState({
                    storeDataList: storeArray,
                    storeData: storeData,
                });
            }
            if (isLogin) {
                this.getCouponDrawData();
            }

        }, fail => {
            this.setState({
                refreshing: false,
            });
        }, error => {
            this.setState({
                refreshing: false,
            });
        });
    }

    // 获取是否有券可以领取
    getCouponDrawData() {
        let param = {"userId": userId};
        NetService.GET('heque-coupon/discount_coupon/get_not_read', param, data => {
            data.sort(function (a, b) {
                return (a.receiveType - b.receiveType)
            });
            // receiveType 1注册成功 2邀请好友成功 3下单
            let orderArray = [];
            let shareArray = [];
            let registerArray = [];
            if (data.length > 1) {
                for (let i = 0; i < data.length; i++) {
                    let tempData = data[i];
                    if (tempData.receiveType == 2) {
                        shareArray.push(tempData);
                    } else if (tempData.receiveType == 3) {
                        orderArray.push(tempData);
                    } else if (tempData.receiveType == 1) {
                        registerArray.push(tempData);
                    }
                }
                // 有多种类型的券
                if ((shareArray.length > 0 && orderArray.length > 0) || (shareArray.length > 0 && registerArray.length > 0) || orderArray.length > 0 && orderArray.length > 0) {
                    this.setState({
                        showView: false,
                        showMoreView: true,
                    });
                } else { // 单种类型的券
                    this.setState({
                        showView: true,
                        showMoreView: false,
                    });
                }
            } else {
                if (data.length === 1) {
                    this.setState({
                        showView: true,
                        showMoreView: false,
                    });
                } else {
                    this.setState({
                        showView: false,
                        showMoreView: false,
                    });
                }
            }

        });
    }


    render() {

        let headViewStyle = {
            width: SCREEN_WIDTH,
            backgroundColor: '#222224',
        };
        let SectionViewStyle = {
            backgroundColor: '#222224',
        };
        return (
            <View style={styles.container}>
                <MapView
                    locationEnabled
                    onLocation={({nativeEvent}) =>
                        this.getLocationInfoNet({
                            "location": (`${nativeEvent.longitude}, ${nativeEvent.latitude}`),
                            "key": "5457cfaeb1002f001b9d7ba6e916fd62",
                            "longitude": nativeEvent.longitude,
                            "latitude": nativeEvent.latitude
                        })}
                />

                {/*顶部城市显示View*/}
                <View style={styles.statusViewStyle}/>
                <View style={styles.navStyle}>
                    <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center',}} activeOpacity={1}
                                      onPress={() => this.cityNameBtnClick()}>
                        {/* locationFail 0:定位中 1:定位成功(有城市名称和城市编号)  2:定位半失败(没有城市名称或者城市编号) 3:定位失败 */}
                        <Text
                            style={styles.cityNameStyle}>{(this.state.locationFail === 1) ? global.city : ((this.state.locationFail === 2) ? global.city : ((this.state.locationFail === 3) ? "定位失败" : global.city))}</Text>
                        <Image style={styles.cityNameImg} source={require("../../images/MineImg/icon_right.png")}/>
                    </TouchableOpacity>
                </View>


                <SectionList
                    style={SectionViewStyle}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={() =>
                        <View style={headViewStyle}>
                            <View style={styles.bannerBgViewStyle}>
                                <SwView horizontal={false} autoplay={false} showsPagination={false}
                                        loop={false} removeClippedSubviews={false}>

                                    <TouchableOpacity activeOpacity={1} onPress={() => this.shareBtnClick()}>
                                        <Image source={require('../../images/HomeImg/icon_bannerFriend.png')}
                                               style={styles.bannerImgStyle}/>
                                    </TouchableOpacity>

                                </SwView>
                            </View>

                            {(this.state.storeDataList.length === 0) ? null :
                                <Text style={styles.nearStoreTextStyle}>附近商家</Text>}

                            {(this.state.storeDataList.length === 0) ? null :
                                <View style={{height: LayoutTool.scaleSize(20),}}/>}

                            {/*门店列表数组为空显示*/}
                            {(this.state.storeDataList.length === 0) ? <Image
                                style={{
                                    marginLeft: LayoutTool.scaleSize(39),
                                    width: LayoutTool.scaleSize(672),
                                    height: LayoutTool.scaleSize(628),
                                }}
                                source={require("../../images/HomeImg/icon_closeCityImg.png")}/> : null}
                        </View>
                    }
                    renderItem={({item, index, section}) =>
                        this._renderItem(item, index, section)
                    }
                    tintColor={"#fff"}
                    onRefresh={this._onRefresh.bind(this)} // 下拉刷新操作
                    refreshing={this.state.refreshing} //等待加载出现加载的符号是否显示

                    sections={[
                        {title: "Title1", data: this.state.storeDataList}
                    ]}

                    keyExtractor={(item, index) => item + index}
                />


                <Modal animationType={'none'}
                       transparent={true}
                       visible={this.state.noPayShowView}>
                    <ShowNoPayPointOutView info={this.state.showTakeMealPayParam}>

                    </ShowNoPayPointOutView>
                </Modal>

                <Modal animationType={'none'}
                       transparent={true}
                       visible={this.state.showView}>
                    <CouponSolaDrawShowView>

                    </CouponSolaDrawShowView>
                </Modal>

                <Modal animationType={'none'}
                       transparent={true}
                       visible={this.state.showMoreView}>
                    <CouponManyTypeShowView>

                    </CouponManyTypeShowView>
                </Modal>
                <Loading ref={(view) => {
                    Loading.loadingDidCreate(view)
                }}>
                </Loading>
            </View>
        )
    }

    _renderItem(data, index, section) {
        let storeName = "";
        if (data.name.length > 10) {
            storeName = data.name.substring(0, 10) + "...";
        } else {
            storeName = data.name;
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

        let distance = "";
        let until = "";
        if (data.number > 1000) {
            if (data.number > 10000) {
                distance = "999+";
            } else {
                distance = data.number / 1000;
                distance = distance.toFixed(2);
            }
            until = "km";
        } else {
            distance = data.number;
            until = "m"
        }
        return (
            <TouchableOpacity activeOpacity={1} onPress={() => this.onPressTapItemClick(data, index)}>
                <View style={styles.itemStyle}>

                    {/*state  true:营业中  false:休息中*/}
                    {data.state ? (data.storeUrl ? <Image source={{uri: data.storeUrl}} style={styles.storeImgStyle}/> :
                        <Image source={require("../../images/HomeImg/icon_foodReplaceImg.png")}
                               style={styles.storeImgStyle}/>)
                        : <ImageBackground style={styles.storeImgStyle}
                                           source={require("../../images/HomeImg/icon_foodReplaceImg.png")}>

                            {data.state ? null : <ImageBackground style={styles.restImgStyle}
                                                                  source={require("../../images/HomeImg/icon_homeHalfImg.png")}>
                                <Text style={styles.restTextStyle}>休息中</Text>
                            </ImageBackground>
                            }
                        </ImageBackground>}

                    <View style={styles.storeInfoBgViewStyle}>
                        <Text style={styles.storeNameStyle}
                              numberOfLines={1}>{storeName}</Text>
                        <Text style={styles.addsStyle}
                              numberOfLines={2}>{data.adds}</Text>
                        <Text style={styles.timeStyle}
                              numberOfLines={3}>营业时间：{timeArray.join('/')}</Text>
                    </View>

                    <View style={styles.distanceViewStyle}>
                        <Text style={styles.distanceTextStyle}>{distance}</Text>
                        <Text style={styles.unitTextStyle}>{until}</Text>
                    </View>
                </View>
                <View style={styles.lineStyle}/>
            </TouchableOpacity>
        )
    }

    // 头部城市选择
    cityNameBtnClick() {
        this.props.navigation.push('CitySelectView', {"pushTag": 1});
    }

    // 分享有礼
    shareBtnClick() {
        if (global.isLogin) {
            this.props.navigation.push('MyShareFriendWebView');
        } else {
            this.props.navigation.push('LoginView');
        }
    }

    // 进入菜品列表
    onPressTapItemClick(data, index) {
        if (global.isLogin) {
            this.getTakeMealsOrderInfo(data);
        } else {
            this.props.navigation.push('StoreFoodListView', {"storeData": data});
        }

    }

    getTakeMealsOrderInfo(storeData) {
        let param = {"userId": userId};
        NetService.GET("heque-eat/eat/no_meal_order_info", param, data => {
            let payArray = [];
            let takeMealsArray = [];
            // 有未支付订单
            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    let tempData = data[i];
                    // 未支付订单
                    if (tempData.state == 1 || tempData.state == 2) {
                        payArray.push(tempData);
                    } else { // 已支付未取餐订单
                        takeMealsArray.push(tempData);
                    }
                }
                // showTakeMealPayParam 1:未支付  2:已支付未取餐
                if (payArray.length > 0) {
                    this.setState({
                        noPayShowView: true,
                        showTakeMealPayParam: "1",
                    });
                    return false;
                }
                if (takeMealsArray.length >= 4) {
                    this.setState({
                        noPayShowView: true,
                        showTakeMealPayParam: "2",
                    });
                    return false;
                }
                this.props.navigation.push('StoreFoodListView', {"storeData": storeData});
            } else {
                this.props.navigation.push('StoreFoodListView', {"storeData": storeData});
            }
        });
    }

    //下拉刷新,更改状态，重新获取数据
    _onRefresh() {
        this.setState({
            refreshing: true,
        }, () => {
            // 获取门店信息
            this.getStoreInfoNet({"cityCode": global.cityCode, "longitude": global.lon, "latitude": global.lat});
        });
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222224',
    },

    // 设置顶部View
    statusViewStyle: {
        backgroundColor: '#222224',
        width: SCREEN_WIDTH,
        height: STATUSBAR_HEIGHT,
    },
    navStyle: {
        backgroundColor: '#222224',
        width: SCREEN_WIDTH,
        height: LayoutTool.scaleSize(110),
        flexDirection: 'row',
        alignItems: 'center',
    },
    cityNameStyle: {
        fontWeight: "bold",
        fontSize: LayoutTool.setSpText(44),
        marginLeft: LayoutTool.scaleSize(40),
        color: "#F2D3AB",
    },
    cityNameImg: {
        width: LayoutTool.scaleSize(15),
        height: LayoutTool.scaleSize(24),
        marginLeft: LayoutTool.scaleSize(25),
    },

    // 轮播图View
    bannerBgViewStyle: {
        backgroundColor: '#222224',
        width: SCREEN_WIDTH,
        height: LayoutTool.scaleSize(324),
    },
    bannerImgStyle: {
        backgroundColor: '#222224',
        height: LayoutTool.scaleSize(324),
        width: SCREEN_WIDTH,
    },
    nearStoreTextStyle: {
        fontWeight: "bold",
        fontSize: LayoutTool.setSpText(32),
        marginLeft: LayoutTool.scaleSize(40),
        color: "#F2D3AB",
    },

    itemStyle: {
        width: SCREEN_WIDTH,
        flexDirection: 'row',
    },
    storeImgStyle: {
        width: LayoutTool.scaleSize(170),
        height: LayoutTool.scaleSize(158),
        marginLeft: LayoutTool.scaleSize(38),
        marginTop: LayoutTool.scaleSize(30),
        borderRadius: LayoutTool.scaleSize(16),
    },
    storeInfoBgViewStyle: {
        // width: SCREEN_WIDTH - LayoutTool.scaleSize(350),
        flex:1
    },
    storeNameStyle: {
        fontWeight: "bold",
        fontSize: LayoutTool.setSpText(36),
        marginLeft: LayoutTool.scaleSize(20),
        color: "#F2D3AB",
        marginTop: LayoutTool.scaleSize(34),
    },
    addsStyle: {
        fontSize: LayoutTool.setSpText(22),
        marginLeft: LayoutTool.scaleSize(20),
        marginRight: LayoutTool.scaleSize(4),
        color: "#8B8782",
        marginTop: LayoutTool.scaleSize(20),
    },
    timeStyle: {
        fontSize: LayoutTool.setSpText(22),
        marginLeft: LayoutTool.scaleSize(20),
        marginRight: LayoutTool.scaleSize(2),
        color: "#8B8782",
        marginTop: LayoutTool.scaleSize(10),
    },
    distanceViewStyle: {
        marginTop: LayoutTool.scaleSize(30),
        marginRight: LayoutTool.scaleSize(30),
        height: LayoutTool.scaleSize(158),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:'flex-end',

    },
    distanceTextStyle: {
        fontSize: LayoutTool.setSpText(28),
        color: "#FF9C43",
        fontWeight: 'bold',
    },
    unitTextStyle: {
        fontSize: LayoutTool.setSpText(22),
        color: "#8B8782",
        fontWeight: 'bold',
        marginLeft: LayoutTool.scaleSize(2),
    },

    lineStyle: {
        marginLeft: LayoutTool.scaleSize(230),
        marginRight: LayoutTool.scaleSize(40),
        height: LayoutTool.scaleSize(1),
        backgroundColor: "#303030",
        marginTop: LayoutTool.scaleSize(34),
    },

    restImgStyle: {
        bottom: 0,
        width: LayoutTool.scaleSize(170),
        height: LayoutTool.scaleSize(45),
        position: "absolute",
        alignItems: 'center',
        justifyContent: 'center',
    },
    restTextStyle: {
        fontWeight: "bold",
        fontSize: LayoutTool.setSpText(24),
        color: "#F2D3AB",
    }

});
