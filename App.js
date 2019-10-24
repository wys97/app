/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Image} from 'react-native';

import {
    createStackNavigator,
    createBottomTabNavigator,
    createAppContainer,
} from 'react-navigation'

//首页的页面
import Home from './src/Home/Home';
import TakeMeals from './src/TakeMeals/TakeMeals';
import Mine from './src/Mine/Mine';


import NavigationCustomBackMenu from './src/Common/NavigationCustomBackMenu'
import LoginView from './src/Login/Login'                               // 登录手机号界面
import LoginCodeView from './src/Login/LoginCodeView';                  // 登录验证码输入View
import WeChatLoginPhoneView from './src/Login/WeChatLoginBindPhone'     // 微信登录绑定手机号
import DriverTypeView from './src/Login/DriverTypeSeleView'             // 司机类型选择

import MyInfoEditView from  './src/Mine/MyInfoEditView'                 // 用户信息编辑
import MyChangeNameView from './src/Mine/MyChangeNameView'              // 修改昵称
import MyCouponListView from './src/Mine/MyCouponList'                  // 我的优惠券列表
import MyOrderListView from './src/Mine/MyOrderListView'                // 我的订单列表
import MyOrderDetailView from './src/Mine/MyOrderDetailView'            // 我的订单详情
import MyKeFuHomeView from "./src/Mine/MyKeFuHomeView"                  // 我的客服主界面
import MyOrderComplaintListView from "./src/Mine/MyOrderComplaintListView"   // 订单投诉列表
import MyOrderComplaintSubmitView from "./src/Mine/MyOrderComplaintCommintView" // 订单投诉信息提交
import MyOrderComplaintSubmitSuccessView from "./src/Mine/MyOrderComplaintSubmitSuccessView"    // 订单投诉提交成功
import MyOrderApplyAfterSaleView from "./src/Mine/MyOrderApplyAfterSaleView"    // 提交申请售后
import MyOrderApplySuccessView from './src/Mine/MyOrderApplySuccessView'        // 售后提交成功
import MyShareFriendWebView from './src/Mine/MyShareFriendWebView'              // 分享有礼


import PaySuccessView from './src/TakeMeals/PaySuccess'                 // 支付成功
import SelectCouponView from './src/TakeMeals/SelectUseCouponView'      // 选择使用优惠券


import StoreFoodListView from './src/Home/StoreFoodListView'            // 菜品列表
import SureOrderView from './src/Home/SureOrderView'                    // 确认下单
import StoreMapListView from './src/Home/StoreMapListView'              // 取餐点列表
import StoreDetailsInfoView from './src/Home/StoreDetailsInfoView'      // 用餐点信息
import StoreMapInfoDetailView from './src/Home/StoreMapInfoDetailView'  // 地图展示取餐点详情
import CitySelectView from './src/Home/CitySelectView'                  // 城市选择

import LayoutTool from "./Tools/Layout"



const HomeStack = createStackNavigator({
    Home: {
        screen: Home,
    },
    LoginView: {    // 登录界面手机号输入
        screen: LoginView,
    },
    // 验证码View
    LoginCodeView: {    // 登录界面验证码输入
        screen: LoginCodeView,
    },
    // 微信登录手机号绑定View
    WeChatLoginPhoneView: {
        screen: WeChatLoginPhoneView,
    },
    // 司机类型选择
    DriverTypeView: {
        screen: DriverTypeView,
    },
    // 菜品列表
    StoreFoodListView: {
        screen: StoreFoodListView,
    },
    // 确认订单
    SureOrderView: {
        screen: SureOrderView,
    },
    // 取餐点列表
    StoreMapListView: {
        screen: StoreMapListView,
    },
    // 用餐点详情信息
    StoreDetailsInfoView: {
        screen: StoreDetailsInfoView,
    },
    // 用餐点详情地图展示
    StoreMapInfoDetailView: {
        screen: StoreMapInfoDetailView,
    },
    // 城市选择
    CitySelectView: {
        screen: CitySelectView,
    },
    // 邀请好友
    MyShareFriendWebView: {
        screen: MyShareFriendWebView,
    },
    // 选择优惠券
    SelectCouponView: {
        screen: SelectCouponView,
    },

},{
    initialRouteName: "Home",
    defaultNavigationOptions: ({navigation}) =>({//配置全局标题样式
        headerBackTitle: null,
        headerLeft: <NavigationCustomBackMenu nav = {navigation} />,
        headerRight: <View />,
        headerStyle: {
            borderBottomWidth: 0,   // 隐藏导航条底部黑线
            backgroundColor: '#222224',
        },
        headerTintColor: '#F2D3AB',//标题文字颜色
        headerTitleStyle: {
            fontSize: LayoutTool.setSpText(36),//18,
            alignSelf:'center',
            flex:1,
            textAlign: 'center',
        },
    }),

    // 设置二级页面隐藏tabBar
    navigationOptions: ({navigation}) => ({tabBarVisible: navigation.state.index > 0 ? false : true,
    })
});

// 取餐模块
const TakeMealsStack = createStackNavigator({
    TakeMeals: {
        screen: TakeMeals,
    },
    LoginView: {    // 登录界面手机号输入
        screen: LoginView,
    },
    // 验证码View
    LoginCodeView: {    // 登录界面验证码输入
        screen: LoginCodeView,
    },
    // 微信登录手机号绑定View
    WeChatLoginPhoneView: {
        screen: WeChatLoginPhoneView,
    },
    // 司机类型选择
    DriverTypeView: {
        screen: DriverTypeView,
    },

    //我的订单
    MyOrderListView: {
        screen: MyOrderListView,
    },
    // 订单详情
    MyOrderDetailView: {
        screen: MyOrderDetailView,
    },
    // 我的客服
    MyKeFuHomeView:{
        screen: MyKeFuHomeView,
    },
    // 订单投诉列表
    MyOrderComplaintListView: {
        screen: MyOrderComplaintListView,
    },
    // 订单投诉提交
    MyOrderComplaintSubmitView: {
        screen: MyOrderComplaintSubmitView,
    },
    MyOrderComplaintSubmitSuccessView: {
        screen: MyOrderComplaintSubmitSuccessView,
    },
    MyOrderApplyAfterSaleView: {
        screen: MyOrderApplyAfterSaleView,
    },
    MyOrderApplySuccessView: {
        screen: MyOrderApplySuccessView,
    },

    SelectCouponView: {
        screen: SelectCouponView,
    },
    PaySuccessView: {
        screen: PaySuccessView,
    },


},{
    initialRouteName: "TakeMeals",
    defaultNavigationOptions: ({navigation}) => ({//配置全局标题样式
        headerBackTitle: null,
        headerLeft: <NavigationCustomBackMenu nav = {navigation} />,
        headerRight: <View />,
        headerStyle: {
            borderBottomWidth: 0,   // 隐藏导航条底部黑线
            backgroundColor: '#222224',
        },
        headerTintColor: '#F2D3AB',//标题文字颜色
        headerTitleStyle: {
            fontSize: LayoutTool.setSpText(36),
            alignSelf:'center',
            flex:1,
            textAlign: 'center',
        },
    }),

    // 设置二级页面隐藏tabBar
    navigationOptions: ({navigation}) => ({
        tabBarVisible: navigation.state.index > 0 ? false : true,
    })
});

// 我的模块
const MineStack = createStackNavigator({
    Mine: {
        screen: Mine,
    },
    LoginView: {    // 登录界面手机号输入
        screen: LoginView,
    },
    // 验证码View
    LoginCodeView: {    // 登录界面验证码输入
        screen: LoginCodeView,
    },
    // 微信登录手机号绑定View
    WeChatLoginPhoneView: {
        screen: WeChatLoginPhoneView,
    },
    // 司机类型选择
    DriverTypeView: {
        screen: DriverTypeView,
    },

    // 个人信息编辑
    MyInfoEditView: {
        screen: MyInfoEditView,
    },
    // 修改昵称
    MyChangeNameView: {
        screen: MyChangeNameView,
    },
    // 我的优惠券列表
    MyCouponListView: {
        screen: MyCouponListView,
    },
    //我的订单
    MyOrderListView: {
        screen: MyOrderListView,
    },
    // 订单详情
    MyOrderDetailView: {
        screen: MyOrderDetailView,
    },
    // 我的客服
    MyKeFuHomeView: {
        screen: MyKeFuHomeView,
    },
    // 订单投诉列表
    MyOrderComplaintListView: {
        screen: MyOrderComplaintListView,
    },
    // 订单投诉提交
    MyOrderComplaintSubmitView: {
        screen: MyOrderComplaintSubmitView,
    },
    MyOrderComplaintSubmitSuccessView: {
        screen: MyOrderComplaintSubmitSuccessView,
    },
    MyOrderApplyAfterSaleView: {
        screen: MyOrderApplyAfterSaleView,
    },
    MyOrderApplySuccessView: {
        screen: MyOrderApplySuccessView,
    },
    // 分享有礼WebView
    MyShareFriendWebView: {
        screen: MyShareFriendWebView,
    },


},{
    initialRouteName: "Mine",
    defaultNavigationOptions: ({navigation}) => ({//配置全局标题样式
        headerBackTitle: null,
        headerLeft: <NavigationCustomBackMenu nav = {navigation} />,
        headerRight: <View />,
        headerStyle: {
            borderBottomWidth: 0,   // 隐藏导航条底部黑线

            backgroundColor: '#222224',//标题背景颜色
        },

        headerTintColor: '#F2D3AB',//标题文字颜色
        headerTitleStyle: {
            // fontWeight: 'bold',
            alignSelf:'center',
            flex:1,
            textAlign: 'center',
            fontSize: LayoutTool.setSpText(36),//18,
        },
    }),

    // 设置二级页面隐藏tabBar
    navigationOptions: ({navigation}) => ({
        tabBarVisible: navigation.state.index > 0 ? false : true
    })
});


export default createAppContainer(createBottomTabNavigator(
    {
        HomeStack: {
            screen: HomeStack,
            navigationOptions:()=>sTabBarOptions('首页', require("./images/tabBar/nav1.png"), require("./images/tabBar/icon_tabBarHomeSelect.png"))

        },
        TakeMealsStack: {
            screen: TakeMealsStack,
            navigationOptions:()=>sTabBarOptions('点餐', require("./images/tabBar/nav2.png"), require("./images/tabBar/icon_tabBarTakeMealsSelect.png"))

        },
        MineStack: {
            screen: MineStack,
            navigationOptions:()=>sTabBarOptions('我的', require("./images/tabBar/nav3.png"), require("./images/tabBar/icon_tabBarMineSelect.png"))
        },
    },
    {
        defaultNavigationOptions: ({ navigation }) => ({
            tabBarOptions: {
                activeTintColor: '#D6BC98',
                inactiveTintColor: '#D6BC98',
                indicatorStyle: { height: 0 },
                labelStyle: {
                    fontSize: LayoutTool.setSpText(20),
                },
                style: {
                    backgroundColor:'#2F2F30',
                },
                activeBackgroundColor: '#222224',
                inactiveBackgroundColor: '#2F2F30',
            },
        }),
    },

    console.disableYellowBox = true  // 禁止Warnings的显示
));

const sTabBarOptions = (tabBarItemTitle, tabBarItemDef, tabBarItemSel) =>{
    const tabBarLabel = tabBarItemTitle;
    const tabBarIcon = ({ focused, horizontal, tintColor })=> {
        return !focused ? <Image style = {{width: LayoutTool.scaleSize(64),height: LayoutTool.scaleSize(64)}} source={tabBarItemDef}/>
                        : <Image style = {{width: LayoutTool.scaleSize(64),height: LayoutTool.scaleSize(64)}} source={tabBarItemSel}/>
    };

    return {tabBarLabel, tabBarIcon};
};



