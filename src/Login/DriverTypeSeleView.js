
// 司机类型选择View

import React from 'react'
import {StyleSheet, View, Text, TouchableOpacity, ImageBackground, DeviceEventEmitter, Image} from 'react-native'


import Layout from '../../Tools/Layout';

import NetService from '../../Tools/NetService'
import Loading from '../../Tools/Loading'

import ToastView from "../../Tools/ToastHudView";
import Storage from 'react-native-storage';
import asyncStorage from "@react-native-community/async-storage";
const storage = new Storage({
    size: 1000,// 最大容量，默认值1000条数据循环存储
    storageBackend: asyncStorage, // 存储引擎：对于RN使用AsyncStorage，如果不指定则数据只会保存在内存中，重启后即丢失
    defaultExpires: null,// 数据过期时间，默认一整天（1000 * 3600 * 24 毫秒），设为null则永不过期
    enableCache: true,// 读写时在内存中缓存数据。默认启用。
    sync: {} // 如果storage中没有相应数据，或数据已过期,则会调用相应的sync方法，无缝返回最新数据。
});

type Props = {};
export default class DriverTypeView extends React.Component<Props>{
    // 构造
    constructor(props) {
        super(props);
        // 初始状态
        this.state = {
            type: "",

            backgroundImgA: require('../../images/Login/A_driverType_default.png'),
            backgroundImgB: require('../../images/Login/B_driverType_default.png'),
            backgroundImgC: require('../../images/Login/C_driverType_default.png'),

            btnStatusImg: require('../../images/Login/icon_btnComplentSelect.png'),
        };
    }
    static navigationOptions = {
        title: "选择司机类型",
        headerLeft: null,
        gesturesEnabled: false,
    };

    render() {

        return(
            <View style={styles.container}>
                <View style={styles.container}>
                    <Text style={styles.titleStyle}>请选择司机类型</Text>
                    <TouchableOpacity activeOpacity = {1} onPress={()=>this.typeAClick()}>
                        <ImageBackground style={styles.backgroundImgAStyle} source={this.state.backgroundImgA}/>
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity = {1} onPress={()=>this.typeBClick()}>
                        <ImageBackground style={styles.backgroundImgBStyle} source={this.state.backgroundImgB}/>
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity = {1} onPress={()=>this.typeCClick()}>
                        <ImageBackground style={styles.backgroundImgCStyle} source={this.state.backgroundImgC}/>
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity = {1} onPress={()=>this.nextClick()}>
                        <Image style={styles.btnStatusStyle} source={this.state.btnStatusImg}/>
                    </TouchableOpacity>

                </View>
            </View>
        );
    }

    typeAClick() {
        this.setState({
            type: 1,
            backgroundImgA: require('../../images/Login/A_driverType_sele.png'),
            backgroundImgB: require('../../images/Login/B_driverType_un.png'),
            backgroundImgC: require('../../images/Login/C_driverType_un.png'),
            btnStatusImg: require('../../images/Login/icon_btnNext.png'),
        })
    }
    typeBClick() {
        this.setState({
            type: 2,
            backgroundImgA: require('../../images/Login/A_driverType_un.png'),
            backgroundImgB: require('../../images/Login/B_driverType_sele.png'),
            backgroundImgC: require('../../images/Login/C_driverType_un.png'),
            btnStatusImg: require('../../images/Login/icon_btnNext.png'),
        })

    }
    typeCClick() {
        this.setState({
            type: 3,
            backgroundImgA: require('../../images/Login/A_driverType_un.png'),
            backgroundImgB: require('../../images/Login/B_driverType_un.png'),
            backgroundImgC: require('../../images/Login/C_driverType_sele.png'),
            btnStatusImg: require('../../images/Login/icon_btnNext.png'),
        })
    }

    // 下一步
    nextClick() {
        // businessType：用户业务类型（出租车司机1、网约车司机2、普通司机3）
        let that = this;
        storage.load({
            key: 'userInfo',
        }).then(ret => {
            console.log(ret);

            // 获取userId进行网络请求
            let param = {'businessType':this.state.type, 'id':global.userId};
            Loading.showLoading('正在提交...');
            NetService.POST('heque-user/user/addBusinessType', param, data=>{
                Loading.dismiss();
                DeviceEventEmitter.emit('registerSuccessNotification', '1');

                // 返回堆栈中的第一个页面
                if (global.loginRoutKey) {
                    this.props.navigation.goBack(global.loginRoutKey);
                } else {
                    // 返回堆栈中的第一个页面
                    that.props.navigation.popToTop();
                }
                ToastView.showShortHudView("提交成功");
            }, data=>{
                Loading.dismiss();
                ToastView.showShortHudView(data.message);
            });

        }).catch(err => {
            console.warn(err.message);
        });
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222224',
        alignItems: 'center',
    },

    titleStyle: {
        fontSize: Layout.setSpText(44),//22,
        marginTop: Layout.scaleSize(90),
        color: '#F2D3AB',
        fontWeight: 'bold',
    },

    backgroundImgAStyle: {
        marginTop: Layout.scaleSize(80),
        height: Layout.scaleSize(150),
        width: Layout.scaleSize(510),
    },
    backgroundImgBStyle: {
        marginTop: Layout.scaleSize(50),
        height: Layout.scaleSize(150),
        width: Layout.scaleSize(510),
    },
    backgroundImgCStyle: {
        marginTop: Layout.scaleSize(50),
        height: Layout.scaleSize(150),
        width: Layout.scaleSize(510),
    },

    btnStatusStyle: {
        marginTop: Layout.scaleSize(190),
        width: Layout.scaleSize(650),
        height: Layout.scaleSize(86),
    },
});
