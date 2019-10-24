
import React from 'react'
import {StyleSheet, View, Text, DeviceEventEmitter, TouchableOpacity, Image, TextInput, TouchableWithoutFeedback} from 'react-native'

import {unitWidth} from "../../Tools/Layout";
import {SCREEN_WIDTH, STATUSBAR_HEIGHT} from '../../Tools/Layout';

const dismissKeyboard = require('dismissKeyboard');

import NetService from '../../Tools/NetService';

import Loading from '../../Tools/Loading';
import ToastView from "../../Tools/ToastHudView";
import LayoutTool from "../../Tools/Layout"

export default class MyChangeNameView extends React.Component{

    static navigationOptions = ({navigation,screenProps}) =>{
        return({
            title: "修改昵称",
            header: null,
        })
    };

    // 构造
    constructor(props) {
        super(props);
        this._onChangeText = this._onChangeText.bind(this);
        // 初始状态
        this.state = {
            nameValue: "",

            rightImg: require('../../images/MineImg/icon_complentNormal.png'),
        };
    }

    componentDidMount() {
        const { params } = this.props.navigation.state;
        this.setState({
            nameValue: params.petName,
        })
        if (params.petName.length > 0) {
            this.setState({
                rightImg: require('../../images/MineImg/icon_complentHight.png'),
            })
        } else {
            this.setState({
                rightImg: require('../../images/MineImg/icon_complentNormal.png'),
            })
        }
    }

    render(){
        return (
            <TouchableWithoutFeedback style={styles.touchable} onPress={() => dismissKeyboard()}>
                <View style={styles.container}>

                    <View style={styles.navBgViewStyle}>
                        <TouchableOpacity activeOpacity={0.7} onPress={()=>this.backBtnClick()}>
                            <View style={styles.leftViewStyle}>
                                <Image style={styles.image} source={require('../../images/Nav/icon_navBack.png')}/>
                            </View>
                        </TouchableOpacity>

                        <Text style={styles.navTitleStyle}>修改昵称</Text>

                        <TouchableOpacity activeOpacity={1} onPress={()=>this.nameChangeClick()}>
                            <View style={styles.leftViewStyle}>
                                <Image style={styles.rightImgStyle} source={this.state.rightImg}/>
                            </View>
                        </TouchableOpacity>

                    </View>

                    <TextInput style={styles.TextInputStyle}
                               placeholder = '请输入昵称'
                               placeholderTextColor = {'#727272'}
                               selectionColor={'#FF9C43'}
                               clearButtonMode = {'unless-editing'}
                               returnKeyType = "done"
                               underlineColorAndroid = "transparent"
                               onChangeText={this._onChangeText}>{this.state.nameValue}</TextInput>

                    <View style={styles.lineViewStyle}/>
                    <Loading ref={(view)=>{Loading.loadingDidCreate(view)}}>
                    </Loading>
                </View>
            </TouchableWithoutFeedback>
        )
    }

    // 监听输入框的文字变化
    _onChangeText(inputData) {
        this.setState({
            nameValue:inputData.replace(/\s*/g,""),
        });
        // 设置按钮背景图片
        if (inputData.replace(/\s*/g,"").length > 0) {
            this.setState({
                rightImg: require('../../images/MineImg/icon_complentHight.png'),
            })
        }else  {
            this.setState({
                rightImg: require('../../images/MineImg/icon_complentNormal.png'),
            })
        }
    }

    backBtnClick() {
        this.props.navigation.goBack();
        dismissKeyboard();
    }

    // 修改昵称
    nameChangeClick() {
        if (this.isEmojiCharacter(this.state.nameValue) === true) {
            ToastView.showShortHudView("请勿输入表情等特殊字符");
            return false;
        }
        if (this.state.nameValue.length > 8) {
            ToastView.showShortHudView("昵称不能超过8个字");
            return false;
        }
        if (this.state.nameValue.replace(/%/g,"").length > 0) {
            dismissKeyboard();
            console.log("修改昵称..." + this.state.nameValue);
            let param = {'userId':userId, 'petName': this.state.nameValue.replace(/%/g,"")};
            Loading.showLoading('正在提交...');
            NetService.GET('heque-user/user/update_petname_or_portraitfid', param, data=>{
                Loading.dismiss();
                ToastView.showShortHudView("昵称修改成功");
                // 发送登录成功事件
                DeviceEventEmitter.emit('loginSuccessNotification', '1');
                this.props.navigation.goBack();
            }, response=>{
                Loading.dismiss();
                if (response.code === NetService.Token_Lose) {
                    // 返回堆栈中的第一个页面
                    this.props.navigation.popToTop();
                }
            })
        }else {
            ToastView.showShortHudView("请输入有效的昵称");
        }
    }
    isEmojiCharacter(substring) {
        for ( var i = 0; i < substring.length; i++) {
            var hs = substring.charCodeAt(i);
            if (0xd800 <= hs && hs <= 0xdbff) {
                if (substring.length > 1) {
                    var ls = substring.charCodeAt(i + 1);
                    var uc = ((hs - 0xd800) * 0x400) + (ls - 0xdc00) + 0x10000;
                    if (0x1d000 <= uc && uc <= 0x1f77f) {
                        return true;
                    }
                }
            } else if (substring.length > 1) {
                var ls = substring.charCodeAt(i + 1);
                if (ls == 0x20e3) {
                    return true;
                }
            } else {
                if (0x2100 <= hs && hs <= 0x27ff) {
                    return true;
                } else if (0x2B05 <= hs && hs <= 0x2b07) {
                    return true;
                } else if (0x2934 <= hs && hs <= 0x2935) {
                    return true;
                } else if (0x3297 <= hs && hs <= 0x3299) {
                    return true;
                } else if (hs == 0xa9 || hs == 0xae || hs == 0x303d || hs == 0x3030
                    || hs == 0x2b55 || hs == 0x2b1c || hs == 0x2b1b
                    || hs == 0x2b50) {
                    return true;
                }
            }
        }
    }
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#2F2F30',
    },

    navBgViewStyle: {
        height: 44 + STATUSBAR_HEIGHT,
        width: SCREEN_WIDTH,
        alignItems: 'center',
        // 设置主轴方向  row:水平  column:竖直
        flexDirection: 'row',
        // 设置主轴对齐方式
        justifyContent:'space-between',
    },
    leftViewStyle: {
        width: 80,
        height: 44,
        marginTop: STATUSBAR_HEIGHT,
    },
    image: {
        marginTop: 15,
        marginLeft: 18,
        width: 9,
        height: 17,
    },
    navTitleStyle: {
        color: '#F2D3AB',
        fontSize: 18,
        marginTop: 10 + STATUSBAR_HEIGHT,
    },
    rightImgStyle: {
        width: 43,
        height: 23,
        marginTop: 16,
        marginLeft: 24,
    },

    TextInputStyle:{
        height: 126*unitWidth,
        marginRight: 54*unitWidth,
        marginLeft: 54*unitWidth,
        fontSize: LayoutTool.setSpText(32),
        color: '#F2D3AB',
    },

    lineViewStyle: {
        height: LayoutTool.scaleSize(1),
        backgroundColor: '#39393B',
        marginLeft: LayoutTool.scaleSize(36),
        marginRight: LayoutTool.scaleSize(36),
    },
});
