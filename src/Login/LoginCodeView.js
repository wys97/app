
import React from 'react'
import {StyleSheet, View, Text, TouchableOpacity, TextInput, ImageBackground, Image, DeviceEventEmitter} from 'react-native'

const dismissKeyboard = require('dismissKeyboard');

import CountDownTimerUntil from '../../Tools/CountDownTimerUntil'
import NetService from '../../Tools/NetService'
import Loading from '../../Tools/Loading'

import Latyout from "../../Tools/Layout";
import {unitWidth} from "../../Tools/Layout";
import ToastView from "../../Tools/ToastHudView";
import DeviceInfo from "react-native-device-info";
import Storage from 'react-native-storage';
import asyncStorage from '@react-native-community/async-storage';

import DriverTypeView from './DriverTypeSeleView'


const storage = new Storage({
    size: 1000,// 最大容量，默认值1000条数据循环存储
    storageBackend: asyncStorage, // 存储引擎：对于RN使用AsyncStorage，如果不指定则数据只会保存在内存中，重启后即丢失
    defaultExpires: null,// 数据过期时间，默认一整天（1000 * 3600 * 24 毫秒），设为null则永不过期
    enableCache: true,// 读写时在内存中缓存数据。默认启用。
    sync: {} // 如果storage中没有相应数据，或数据已过期,则会调用相应的sync方法，无缝返回最新数据。
});


type Props = {};
export default class LoginCodeView extends React.Component<Props>{
    // 构造
    constructor(props) {
        super(props);
        this._onChangeText = this._onChangeText.bind(this);

        // 初始状态
        this.state = {
            phoneNo: "",

            codeValue: "",

            deviceID: "7B5A2D96-D2B7-446C-9A56-E943C9997CF8",

            codeColor: "#FF9C43",

            opacityValue: 1,

            codeBtnEnable: false,

            timeCount: 60,

            timeTitle: '正在发送验证码',

            weChatData: "",
        };
    }

    // 进入界面默认发送验证码
    componentDidMount() {
        const { params } = this.props.navigation.state;
        this.setState({
            phoneNo: params.phoneNo,
            deviceID: DeviceInfo.getUniqueID(),
            weChatData: params.weChatData,
        });
        console.log('设备唯一标示：' + DeviceInfo.getUniqueID());
        console.log(params.weChatData);
        console.log('设备IP地址：');
        console.log(JSON.stringify(DeviceInfo.getIPAddress()));
        console.log(DeviceInfo.getDeviceName());

        let phoneString = 18145801207; // 该手机号不需发送验证码
        if (params.phoneNo != phoneString) {
            this.codeTimerCountDownUntil({"phoneNo": params.phoneNo, "smsType": '0',});
        }else {
            this.setState({
                timeTitle: '发送验证码',
                codeColor: "#FF9C43",
            });
        }
    }
    // 退出界面时清除定时器
    componentWillUnmount() {
        Loading.dismiss();
        CountDownTimerUntil.stop()
    }

    // 验证码倒计时方法
    codeTimerCountDownUntil(param) {
        Loading.showLoading('正在发送短信...');
        NetService.GET('heque-user/userSms/getUserSmsCode', param, response=>{
            ToastView.showShortHudView("验证码发送成功");
            Loading.dismiss();

            // 倒计时时间
            let countdownDate = new Date(new Date().getTime() + this.state.timeCount * 1000)
            // 点击之后验证码不能发送网络请求
            this.setState({
                codeBtnEnable: false,
                opacityValue: 1,
                codeColor: "#A7A39E",
            });

            CountDownTimerUntil.settimer(countdownDate, (time) => {
                this.setState({
                    timeTitle: time.sec > 0 ? time.sec + 's 后重发验证码' : '重发验证码'
                }, () => {
                    if (this.state.timeTitle == "重发验证码") {
                        this.setState({
                            codeBtnEnable: true,
                            opacityValue: 0.7,
                            codeColor: "#FF9C43",
                        })
                    }
                })
            })
        }, response=>{
            this.setState({
                timeTitle: '发送验证码',
                codeBtnEnable: true,
                opacityValue: 0.7,
                codeColor: "#FF9C43",
            });
            Loading.dismiss();
        }, e=>{
            this.setState({
                timeTitle: '发送验证码',
                codeBtnEnable: true,
                opacityValue: 0.7,
                codeColor: "#FF9C43",
            });
            Loading.dismiss();
        });
    }

    render() {
        // 动态修改字体的颜色
        let codeTextColor = this.state.codeBtnEnable?"#FF9C43":"#8B8782";
        let codeTextStyle = {
            fontSize: Latyout.setSpText(24),
            marginLeft: 60*unitWidth,
            marginTop: 42*unitWidth,
            color:codeTextColor
        };

        const { params } = this.props.navigation.state;

        return(
            <View style={styles.container}>

                <View style={styles.container}>
                    <Loading ref={(view)=>{Loading.loadingDidCreate(view)}}>
                    </Loading>

                    <Text style={styles.titleStyle}>请输入验证码</Text>
                    <Text style={styles.phoneNoBriefStyle}>验证码已发送至 +86 {params.phoneNo}</Text>

                    <View style={styles.codeBgView}>
                        <TextInput style={styles.codeTextInputStyle}
                                   maxLength = {6}
                                   placeholder = '请输入验证码'
                                   placeholderTextColor = {'#8B8782'}
                                   selectionColor={'#FF9C43'}
                                   keyboardType = {'number-pad'} // numeric:数字键盘带点
                                   clearButtonMode = {'unless-editing'}
                                   returnKeyType = "done"
                                   underlineColorAndroid = "transparent"
                                   onChangeText={this._onChangeText}
                        />
                        <View style={styles.linViewStyle}/>
                    </View>

                    <TouchableOpacity activeOpacity = {this.state.opacityValue} onPress={()=>this.codeBtnClick()}>
                        <Text style={codeTextStyle}>{this.state.timeTitle}</Text>
                    </TouchableOpacity>

                </View>

            </View>
        );
    }

    // 发送验证码
    codeBtnClick() {
        if (this.state.codeBtnEnable == false) {
            return;
        } else  {
            let phoneString = 18145801207; // 该手机号不需发送验证码
            if (this.state.phoneNo != phoneString) {
                this.codeTimerCountDownUntil({"phoneNo": this.state.phoneNo, "smsType": '0',});
            }else {
                this.setState({
                    timeTitle: '发送验证码',
                    codeColor: "#FF9C43",
                });
            }
        }
    }

    // 监听输入框的文字变化
    _onChangeText(inputData) {
        this.setState({
            codeValue:inputData
        });
        if (inputData.length == 6) {
            // 退出键盘
            dismissKeyboard();
            // 验证码输入6位后自动登录
            /*  userType: 1 真实用户，2 游客 3，测试用户
                phoneNo: 手机号
                visitor: 设备ID
                loginType: 1 正常登录，2 微信授权登录(手机号不能为空)
              */
            if (this.state.weChatData) {
                console.log("使用微信登录");
                this.LoginNet({"phoneNo": this.state.phoneNo,
                                        "userType":'1',
                                        "visitor":this.state.deviceID,
                                        "smsCode":inputData,
                                        "loginType":2,
                                        "weChatOpenId":this.state.weChatData.openid,
                                        "weChatName":this.state.weChatData.nickname,
                                        "weChatHpUrl":this.state.weChatData.headimgurl,
                                        "userEquipment":DeviceInfo.getDeviceName(),
                                        "loginClient":"2",
                                        "loginArea": "深圳市南山区"
                                        });
            } else {
                console.log("使用手机号登录");
                this.LoginNet({"phoneNo": this.state.phoneNo,
                                        "userType":'1',
                                        "visitor":this.state.deviceID,
                                        "smsCode":inputData,
                                        "loginType":1,
                                        "userEquipment":DeviceInfo.getDeviceName(),
                                        "loginClient":"2",
                                        "loginArea": "深圳市南山区"
                                        });
            }
        }
    }

    // 登录网络请求
    LoginNet(param){
        let that = this;
        Loading.showLoading('正在登录...');
        NetService.POST('heque-user/user/login', param, response=>{
            Loading.dismiss();

            global.userId = response.iid;
            global.phoneNo = response.phoneNo;
            global.token = response.token;
            global.isLogin = true;

            storage.save({
                key: 'userInfo',
                data: {
                    'phoneNo': response.phoneNo,
                    'userId': response.iid,
                    'token': response.token,
                },
            });

            if (response.loginCount == 1) {
                that.props.navigation.push('DriverTypeView');
            } else {
                ToastView.showShortHudView("登录成功");
                // 发送登录成功事件
                DeviceEventEmitter.emit('loginSuccessNotification', '1');

                if (global.loginRoutKey) {
                    this.props.navigation.goBack(global.loginRoutKey);
                } else {
                    // 返回堆栈中的第一个页面
                    that.props.navigation.popToTop();
                }
            }
        },response=>{
            global.isLogin = false;
            Loading.dismiss();
            ToastView.showShortHudView(response.message);
        });
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222224',
    },
    titleStyle: {
        fontSize: Latyout.setSpText(44),
        marginLeft: 60*unitWidth,
        marginTop: 40*unitWidth,
        color: '#F2D3AB',
        fontWeight: 'bold',
    },
    phoneNoBriefStyle: {
        fontSize: Latyout.setSpText(24),
        marginLeft: 60*unitWidth,
        marginTop: 16*unitWidth,
        color: '#8B8782',
    },

    codeBgView: {
        height: 82*unitWidth,
        marginLeft: 60*unitWidth,
        marginRight: 60*unitWidth,
        marginTop: 110*unitWidth,
    },
    codeTextInputStyle: {
        height: 80*unitWidth,
        color: '#F2D3AB',
        fontSize: Latyout.setSpText(32),
    },
    linViewStyle: {
        height: 2*unitWidth,
        backgroundColor: '#222224',
    },
});
