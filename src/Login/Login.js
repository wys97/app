
import React from 'react'
import {StyleSheet, View, Text, TouchableOpacity, DeviceEventEmitter, TextInput, ImageBackground, Image} from 'react-native'

const dismissKeyboard = require('dismissKeyboard');

import {unitWidth, SCREEN_WIDTH} from "../../Tools/Layout";
import Layout from '../../Tools/Layout';

import LoginCodeView from './LoginCodeView';
import WeChatLoginPhoneView from './WeChatLoginBindPhone'

import DeviceInfo from "react-native-device-info";

import * as WeChat from 'react-native-wechat';
import NetService from "../../Tools/NetService";
import ToastView from "../../Tools/ToastHudView";
import Storage from "react-native-storage";
import asyncStorage from "@react-native-community/async-storage";
import Loading from "../../Tools/Loading";
import CountDownTimerUntil from "../../Tools/CountDownTimerUntil";


const storage = new Storage({
    size: 1000,// 最大容量，默认值1000条数据循环存储
    storageBackend: asyncStorage, // 存储引擎：对于RN使用AsyncStorage，如果不指定则数据只会保存在内存中，重启后即丢失
    defaultExpires: null,// 数据过期时间，默认一整天（1000 * 3600 * 24 毫秒），设为null则永不过期
    enableCache: true,// 读写时在内存中缓存数据。默认启用。
    sync: {} // 如果storage中没有相应数据，或数据已过期,则会调用相应的sync方法，无缝返回最新数据。
});

type Props = {};
export default class Login extends React.Component<Props>{

    static navigationOptions = {
        title: "登录",
    };

    // 构造
    constructor(props) {
        super(props);
        this._onChangeText = this._onChangeText.bind(this);
        this._onChangeCodeText = this._onChangeCodeText.bind(this);
        // 初始状态
        this.state = {
            phoneValue: "",         // 手机号码
            codeValue: "",          // 验证码
            opacityValue: 1,

            weChatLoginViewShow: true,

            loginImg: require('../../images/Login/icon_loginBtnNormal.png'),

            codeBtnEnable: true,

            timeCount: 60,

            timeTitle: '发送验证码',
        };
    }

    componentDidMount (){

        const { params } = this.props.navigation.state;
        if (params) {
            // type=1 从菜品列表进入记录菜品列表路由
            global.loginRoutKey = this.props.navigation.state.key;
        }else {
            global.loginRoutKey = null;
        }
        console.log("global.loginRoutKey------>" + global.loginRoutKey);

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
    }
    // 退出界面时清除定时器
    componentWillUnmount() {
        Loading.dismiss();
        CountDownTimerUntil.stop()
    }

    render() {

        return(
            <View style={styles.container}>
                <View style={styles.container}>

                    <Text style={styles.titleStyle}>欢迎来到禾师傅</Text>
                    <Text style={styles.loginBriefStyle}>绑定手机会让您的账户更加安全</Text>

                    <View style={styles.phoneViewStyle}>
                        <TextInput style={styles.phoneTextInputStyle}
                                   maxLength = {11}
                                   placeholder = '请输入手机号'
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

                    <View style={styles.loginCodeBgViewStyle}>
                        <View style={styles.loginCodeViewStyle}>
                            <TextInput style={styles.codeInputStyle}
                                       maxLength = {6}
                                       placeholder = '请输入验证码'
                                       placeholderTextColor = {'#8B8782'}
                                       selectionColor={'#FF9C43'}
                                       keyboardType = {'number-pad'} // numeric:数字键盘带点
                                       clearButtonMode = {'unless-editing'}
                                       returnKeyType = "done"
                                       underlineColorAndroid = "transparent"
                                       onChangeText={this._onChangeCodeText}
                            />
                            <View style={styles.codeLineViewStyle}/>
                            <TouchableOpacity activeOpacity = {1} onPress={()=>this.getCodeBtnClick()} >
                                <View style={[styles.codeBtnStyle,(!this.state.codeBtnEnable)&&styles.codeBtnStyleDisable]}>
                                    <Text style={styles.codeTextStyle}>{this.state.timeTitle}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.linViewStyle}/>
                    </View>


                    <TouchableOpacity activeOpacity = {1} onPress={()=>this.nextBtnClick()}>
                        <Image style={styles.loginBtnStyle} source={this.state.loginImg}/>
                    </TouchableOpacity>

                    {/*检测是否安装微信 是否显示微信登录*/}
                    {this.state.weChatLoginViewShow ? <View style={styles.weChatLoginViewStyle}>
                        <View style={styles.otherLoginTitleViewStyle}>
                            <Text style={{color: '#727272', fontSize: Layout.setSpText(24)}}>其他登录方式</Text>
                        </View>
                        <TouchableOpacity activeOpacity = {0.7} onPress={()=>this.weChatLoginClick()}>
                            <View style={styles.logoBgViewStyle}>
                                <Image style={{height: 98*unitWidth, width: 98*unitWidth}} source={require('../../images/Login/icon_wechatLogin.png')}/>
                                <Text style={{color: '#F2D3AB', fontSize: Layout.setSpText(24), marginTop: 18*unitWidth}}>微信登录</Text>
                            </View>
                        </TouchableOpacity>
                    </View>:null}

                </View>

                <Loading ref={(view)=>{Loading.loadingDidCreate(view)}}>
                </Loading>
            </View>
        );
    }

    // 监听输入框的文字变化
    _onChangeText(inputData) {
        this.setState({
            phoneValue:inputData
        });
        // 设置按钮背景图片
        if (inputData.length === 11 && this.state.codeValue.length === 6) {
            this.setState({
                loginImg: require('../../images/Login/icon_loginBtnHight.png'),
            });
        }else  {
            this.setState({
                loginImg: require('../../images/Login/icon_loginBtnNormal.png'),
            })
        }
    }
    // 验证码
    _onChangeCodeText(codeValue){
        console.log(codeValue);
        this.setState({
            codeValue: codeValue
        });
        if (codeValue.length === 6 && this.state.phoneValue.length === 11) {
            this.setState({
                loginImg: require('../../images/Login/icon_loginBtnHight.png'),
            });
        }else  {
            this.setState({
                loginImg: require('../../images/Login/icon_loginBtnNormal.png'),
            })
        }
    }
    // 发送验证码按钮点击
    getCodeBtnClick() {

        if (!this.state.codeBtnEnable) {
            return;
        }

        console.log('发送验证码');
        if (this.state.phoneValue.length != 11) {
            ToastView.showShortHudView("请输入11位手机号");
            return;
        }
        let phoneString = 18145801207; // 该手机号不需发送验证码
        if (this.state.phoneValue != phoneString) {
            this.setState({
                codeBtnEnable: false,
            });
            this.codeTimerCountDownUntil({"phoneNo": this.state.phoneValue, "smsType": '0',});
        }else {
            this.setState({
                timeTitle: '发送验证码',
                codeColor: "#FF9C43",
            });
        }
    }
    // 验证码倒计时方法
    codeTimerCountDownUntil(param) {
        Loading.showLoading('正在发送短信...');
        NetService.GET('heque-user/userSms/getUserSmsCode', param, response=>{
            ToastView.showShortHudView("验证码发送成功");
            Loading.dismiss();

            // 倒计时时间
            let countdownDate = new Date(new Date().getTime() + this.state.timeCount * 1000);
            // 点击之后验证码不能发送网络请求
            this.setState({
                codeBtnEnable: false,
                opacityValue: 1,
                codeColor: "#A7A39E",
            });
            CountDownTimerUntil.settimer(countdownDate, (time) => {
                this.setState({
                    timeTitle: time.sec > 0 ?'重发验证码('+ time.sec + ')' : '重发验证码',
                    codeColor: "#A7A39E",
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

    // 按钮下一步点击
    nextBtnClick() {
        if (this.state.phoneValue.length === 11 && this.state.codeValue.length ===6) {
            dismissKeyboard();
            this.LoginNet({"phoneNo": this.state.phoneValue,
                "userType":'1',
                "visitor":this.state.deviceID,
                "smsCode":this.state.codeValue,
                "loginType":1,
                "userEquipment":DeviceInfo.getDeviceName(),
                "loginClient":"2",
                "loginArea": "深圳市南山区"
            });
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


    // 微信登录按钮
    weChatLoginClick() {
        if (this.state.weChatLoginViewShow) {
            let state =  DeviceInfo.getUniqueID();
            //发送授权请求
            WeChat.sendAuthRequest("snsapi_userinfo", state)
                .then(responseCode => {

                    console.log(responseCode);
                    console.log('-----微信登录Code-----');
                    console.log(responseCode.code);

                    if (responseCode.errCode === 0) {
                        //返回code码，通过code获取access_token

                        let WeChatAppSecret = 'aa1e68b061c32403d852d726467aed02';
                        let appId = "wx589d650bd9ecd315";

                        this.getWeChatAccessToken(appId, WeChatAppSecret, responseCode.code);


                    }else if (responseCode.errCode === -4) {
                        ToastView.showShortHudView('已拒绝授权登录');
                    }else if (responseCode.errCode === 1) {
                        ToastView.showShortHudView('已取消微信登录');
                    }
                })
                .catch(err => {
                    ToastView.showShortHudView('微信登录授权错误');
                })
        }
    }
    // 通过code获取微信的access_token
    getWeChatAccessToken(appId, secret, code) {
        let AccessTokenUrl = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid='+appId+'&secret='+secret+'&code='+ code +'&grant_type=authorization_code';
        fetch(AccessTokenUrl,{
            method:'GET',
            timeout: 2000,
            headers:{
                'Content-Type':'application/json; charset=utf-8',
            },
        })
            .then((response)=>response.json())
            .then((responseData)=>{
                console.log("通过code获取微信的access_token");
                console.log(responseData);

                this.getWeChatLoginUserInfo(responseData);
            })
            .catch((error)=>{
                if(error){
                    console.log('error=',error);
                }
            })
    }
    // 获取微信登录用户信息
    getWeChatLoginUserInfo(responseData){
        let getUserInfoUrl = 'https://api.weixin.qq.com/sns/userinfo?access_token='+responseData.access_token+'&openid='+responseData.openid;
        console.log('getUserInfoUrl=',getUserInfoUrl);
        fetch(getUserInfoUrl,{
            method:'GET',
            timeout: 2000,
            headers:{
                'Content-Type':'application/json; charset=utf-8',
            },
        }).then((response)=>response.json()).then((responseData)=>{

                // 检测用户的微信账号是否绑定过手机号
                this.checkWeChatUserInfoIsPhoneNet(responseData);

            }).catch((error)=>{
                if(error){
                    console.log('error=',error);
                }
            })
    }
    // 检测用户的微信账号是否绑定过手机号
    checkWeChatUserInfoIsPhoneNet(responseData) {
        console.log("openid------>" + responseData.openid);
        let param = {'weChatOpenId':responseData.openid};
        NetService.POST('heque-user/user/checkTheUserWeChatStatus', param, data=>{
            // 用户是否绑定微信号，true表示已绑定，false表示没绑定
            if (data.weChatStatus === true) {
                global.userId = data.iid;
                global.phoneNo = data.phoneNo;
                global.token = data.token;
                global.isLogin = true;

                storage.save({
                    key: 'userInfo',
                    data: {
                        'phoneNo': data.phoneNo,
                        'userId': data.iid,
                        'token': data.token,
                    },
                });

                if (data.loginCount === 1) {
                    this.props.navigation.push('DriverTypeView');
                } else {
                    ToastView.showShortHudView("登录成功");
                    // 发送登录成功事件
                    DeviceEventEmitter.emit('loginSuccessNotification', '1');
                    if (global.loginRoutKey) {
                        this.props.navigation.goBack(global.loginRoutKey);
                    } else {
                        // 返回堆栈中的第一个页面
                        this.props.navigation.popToTop();
                    }
                }
            }else {
                // 前往绑定手机号
                this.props.navigation.push('WeChatLoginPhoneView', {"weChatData": responseData});
            }
        }, response=>{

            ToastView.showShortHudView(response.message);
        })
    }


    // 关闭登录界面发送通知
    closeLoginViewClick() {
        //添加DeviceEventEmitter
        DeviceEventEmitter.emit('closeLoginView', '1');
    }
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222224',
        // alignItems: 'center',
        // justifyContent: 'center',
    },
    titleStyle: {
        fontSize: Layout.setSpText(46),
        marginLeft: Layout.scaleSize(60),
        marginTop: Layout.scaleSize(90),
        color: '#F2D3AB',
        fontWeight: 'bold',
    },
    loginBriefStyle: {
        fontSize: Layout.setSpText(26),
        marginLeft: Layout.scaleSize(60),
        marginTop: Layout.scaleSize(20),
        color: '#8B8782',
    },

    phoneViewStyle: {
        backgroundColor: '#222224',
        height: Layout.scaleSize(82),
        marginLeft: Layout.scaleSize(60),
        marginRight: Layout.scaleSize(60),
        marginTop: Layout.scaleSize(110),
    },
    phoneTextInputStyle: {
        height: 80*unitWidth,
        color: '#F2D3AB',
        fontSize: Layout.setSpText(32),
    },
    linViewStyle: {
        height: Layout.scaleSize(1),
        backgroundColor: '#39393B',
    },

    loginCodeBgViewStyle: {
        backgroundColor: '#222224',
        height: Layout.scaleSize(82),
        marginLeft: Layout.scaleSize(60),
        marginRight: Layout.scaleSize(60),
        marginTop: Layout.scaleSize(44),
    },
    loginCodeViewStyle: {
        height: Layout.scaleSize(82),
        flexDirection: 'row',
        alignItems: 'center',
    },
    codeInputStyle: {
        width: Layout.scaleSize(340),
        height: Layout.scaleSize(80),
        color: '#F2D3AB',
        fontSize: Layout.setSpText(32),
    },
    codeBtnStyle: {
        marginLeft: Layout.scaleSize(40),
        height: Layout.scaleSize(80),
        fontSize: Layout.setSpText(32),
        alignItems: 'center',
        justifyContent: 'center',
    },
    codeBtnStyleDisable:{
        opacity:0.5
    },
    codeTextStyle: {
        color: '#FF9C43',
        fontSize: Layout.setSpText(28),
    },
    codeLineViewStyle: {
        width: Layout.scaleSize(1),
        height: Layout.scaleSize(30),
        backgroundColor: '#545457',
    },

    loginBtnStyle: {
        marginTop: Layout.scaleSize(90),
        marginLeft: Layout.scaleSize(50),
        width: Layout.scaleSize(650),
        height: Layout.scaleSize(86),
    },

    weChatLoginViewStyle: {
        bottom: 60*unitWidth,
        width: SCREEN_WIDTH,
        height: 210*unitWidth,
        position:"absolute",
        alignItems: 'center',
        left: 0,
    },
    otherLoginTitleViewStyle: {
        flexDirection: 'row',
        justifyContent:'center',
        height: 30*unitWidth,
        width: SCREEN_WIDTH,
    },

    logoBgViewStyle: {
        alignItems: 'center',
        height: 144*unitWidth,
        width: 120*unitWidth,
        marginTop: 40*unitWidth
    },
});
