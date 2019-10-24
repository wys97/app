
// 微信登录绑定手机号

import React from 'react'
import {StyleSheet, View, Text, TouchableOpacity, TextInput, ImageBackground, Image,} from 'react-native'

import LoginCodeView from './LoginCodeView';

import {unitWidth} from "../../Tools/Layout";
import Layout from "../../Tools/Layout";


type Props = {};
export default class WeChatLoginBindPhone extends React.Component<Props>{

    // 构造
    constructor(props) {
        super(props);
        this._onChangeText = this._onChangeText.bind(this);
        // 初始状态
        this.state = {
            phoneValue: "",
            opacityValue: 1,

            weChatData: "",

            backgroundIcon: require('../../images/Login/icon_btnBgImgNormal.png'),
        };
    }

    componentDidMount() {

        const { params } = this.props.navigation.state;
        this.setState({
            weChatData: params.weChatData,
        });
        console.log(params.weChatData)
    }

    render() {
        // 改变按钮的透明度
        let nextBtnColor = "#F2D3AB";
        if (this.state.phoneValue.length == 11) {
            nextBtnColor = "#331E0D";
        } else {
            nextBtnColor = "#F2D3AB";
        }
        let btnTextStyles = {
            color: nextBtnColor,
            fontSize: Layout.setSpText(30),//15,
            fontWeight: 'bold',
        };

        return(
            <View style={styles.container}>
                <View style={styles.container}>

                    <Text style={styles.titleStyle}>请绑定手机号</Text>
                    <Text style={styles.briefStyle}>绑定手机会让您的账户更加安全</Text>
                    <View style={styles.phoneViewStyle}>
                        <TextInput style={styles.phoneTextInputStyle}
                                   maxLength = {11}
                                   placeholder = '请输入您的手机号'
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
                    <TouchableOpacity activeOpacity = {1} onPress={()=>this.nextBtnClick()}>
                        <ImageBackground style={styles.nextViewStyle} source={this.state.backgroundIcon}>
                            <Text style={btnTextStyles}>下一步</Text>
                        </ImageBackground>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // 监听输入框的文字变化
    _onChangeText(inputData) {
        this.setState({
            phoneValue:inputData
        });
        // 设置按钮背景图片
        if (inputData.length === 11) {
            this.setState({
                backgroundIcon: require('../../images/Login/icon_btnBgImgHight.png'),
            })
        }else  {
            this.setState({
                backgroundIcon: require('../../images/Login/icon_btnBgImgNormal.png'),
            })
        }
    }

    // 按钮下一步点击
    nextBtnClick() {
        if (this.state.phoneValue.length === 11) {
            this.props.navigation.push('LoginCodeView', {"phoneNo":this.state.phoneValue, "weChatData":this.state.weChatData});
        }
    }
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#222224',
    },
    titleStyle: {
        fontSize: Layout.setSpText(44),
        marginLeft: Layout.scaleSize(60),
        marginTop: Layout.scaleSize(90),
        color: '#F2D3AB',
        fontWeight: 'bold',
    },
    briefStyle: {
        fontSize: Layout.setSpText(26),//13,
        marginLeft: Layout.scaleSize(60),
        marginTop: Layout.scaleSize(20),
        color: '#8B8782',
    },

    phoneViewStyle: {
        height: Layout.scaleSize(82),
        marginLeft: Layout.scaleSize(60),
        marginRight: Layout.scaleSize(60),
        marginTop: Layout.scaleSize(110),
    },
    phoneTextInputStyle: {
        height: 80*unitWidth,
        color: '#F2D3AB',
        fontSize: Layout.setSpText(32),//16,
    },
    linViewStyle: {
        height: Layout.scaleSize(1),
        backgroundColor: '#39393B',
    },
    btnTextStyles: {
        color: '#fff',
        fontSize: Layout.setSpText(30),//15,
        fontWeight: 'bold',
    },

    nextViewStyle: {
        height: Layout.scaleSize(86),
        width: Layout.scaleSize(650),
        marginTop: Layout.scaleSize(85),
        marginLeft: Layout.scaleSize(50),
        alignItems: 'center',
        justifyContent: 'center',
    },

});
