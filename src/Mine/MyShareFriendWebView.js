
// 邀请好友


import React from 'react'
import {StyleSheet, View, WebView, Linking, TouchableOpacity, Image, Clipboard} from 'react-native'

import {SCREEN_WIDTH, STATUSBAR_HEIGHT, unitWidth} from "../../Tools/Layout";

import * as WeChat from 'react-native-wechat';
import ToastView from "../../Tools/ToastHudView";
import NetService from "../../Tools/NetService";
import Loading from "../../Tools/Loading";


export default class MyShareFriendWebView extends React.Component{

    static navigationOptions = ({navigation}) => {
        return {
            title: "邀请有礼",

            header:null,  //隐藏顶部导航栏
        }
    };

    constructor(props) {
        super(props);
        this.state = {

            data: "",

            isWeChat: true,
        }
    }

    componentDidMount (){
        WeChat.registerApp('wx589d650bd9ecd315');
        WeChat.isWXAppInstalled()
            .then( ( isInstalled ) => {
                if ( isInstalled ) {
                    this.setState({
                        isWeChat: true,
                    })
                } else { // 没有安装微信
                    this.setState({
                        isWeChat: false,
                    })
                }
            } );

        let param = {"inviteUserId":userId}
        Loading.showLoading("加载中...");
        NetService.GET('heque-user/invite/invite_friend_url', param, data=>{
            Loading.dismiss();
            console.log("gldata:"+JSON.stringify(data))
            this.setState({
                data:data,
            });
        }, response=>{
            Loading.dismiss();
            if (response.code === NetService.Token_Lose) {
                // 返回堆栈中的第一个页面
                this.props.navigation.popToTop();
            }
            ToastView.showShortHudView(response.message);
        });
    }

    render(){
        console.log("打开链接："+this.state.data.inviteFriendObtainUrl+"?userId=" + global.userId + "&deviceTag=RN")
        return (
            <View style={styles.container}>
                {/* this.state.data.inviteFriendObtainUrl */}
                <WebView style={styles.container}
                         source={{uri:this.state.data.inviteFriendObtainUrl+"?userId=" + global.userId + "&deviceTag=RN"}}
                         onMessage={(event) => this.shareWeChatClick()}
                >
                </WebView>

                <View style={{
                    left:0,
                    width: 100*unitWidth,
                    height: 44,
                    top: 40*unitWidth + STATUSBAR_HEIGHT,
                    justifyContent: 'center',
                    position: 'absolute',

                }}>
                    <TouchableOpacity activeOpacity={1} onPress={()=>this.backHandClick()}>
                        <View style={{
                            width: 100*unitWidth,
                            height: 44,

                        }}>
                            <Image style={{
                                width: 17*unitWidth,
                                height: 30*unitWidth,
                                marginLeft: 40*unitWidth,
                            }} source={require("../../images/Nav/icon_navBack.png")}/>
                        </View>
                    </TouchableOpacity>
                </View>

                <Loading ref={(view)=>{Loading.loadingDidCreate(view)}}>
                </Loading>
            </View>
        )
    }

    shareWeChatClick() {
        console.log(".....邀请好友分享到微信.....");
        Clipboard.setString(this.state.data.inviteFriendCopywriting);
        if (this.state.isWeChat === true) {
            let weChat = "weixin://";
            Linking.canOpenURL(weChat).then(supported => {
                if (!supported) {
                    console.log('Can\'t handle url: ' + weChat);
                } else {
                    return Linking.openURL(weChat);
                }
            }).catch(err => console.error('An error occurred', err));
        } else {
            ToastView.showShortHudView("您的设备未安装微信App");
        }
    }

    backHandClick(){
        this.props.navigation.pop()
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
});
