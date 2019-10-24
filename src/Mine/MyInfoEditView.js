
import React from 'react'
import {StyleSheet, View, Text, DeviceEventEmitter, TouchableOpacity, Image} from 'react-native'

import {unitWidth} from "../../Tools/Layout";
import {SCREEN_WIDTH, STATUSBAR_HEIGHT} from '../../Tools/Layout';

import NetService from '../../Tools/NetService';

import LayoutTool from "../../Tools/Layout"
import Loading from '../../Tools/Loading';
import ToastView from "../../Tools/ToastHudView";
import ImagePicker from 'react-native-image-picker';

import MyChangeNameView from "./MyChangeNameView"


export default class MyInfoEditView extends React.Component{

    static navigationOptions = {
        title: "编辑个人信息",
    }

    componentDidMount(){
        console.log('...componentDidMount...');
        var that = this;
        this.listener =DeviceEventEmitter.addListener('loginSuccessNotification',function(param){
            console.log('...DeviceEventEmitter...');
            // 已登录状态
            if (isLogin === true) {
                that.getUserInfoNet({'id':userId});
            }
        });

        // 已登录状态
        if (isLogin === true) {
            this.getUserInfoNet({'id':userId});
        }

    }
    // 移除通知事件
    componentWillUnmount(){
        this.listener.remove();
    }

    // 构造
    constructor(props) {
        super(props);
        // 初始状态
        this.state = {
            data: "",
        };
    }

    render(){
        return (
            <View style={styles.container}>
                <TouchableOpacity activeOpacity = {0.7} onPress={()=>this.headIconClick()}>
                    <View style={styles.headIconViewStyle}>
                        <Text style={styles.headIconTitleStyle}>头像</Text>
                        <View style={styles.iconBgViewStyle}>
                            <Image style={styles.iconStyle} source={this.state.data ? {uri:this.state.data.portraitFid}:require('../../images/MineImg/icon_headIcon.png')}/>
                            <Image style={styles.rightImgStyle} source={require('../../images/MineImg/icon_right.png')}/>
                        </View>
                    </View>
                </TouchableOpacity>

                <View style={styles.lineViewStyle}>
                </View>

                <TouchableOpacity activeOpacity = {0.7} onPress={()=>this.nameClick()}>
                    <View style={styles.nickNameViewStyle}>
                        <Text style={styles.headIconTitleStyle}>昵称</Text>
                        <View style={styles.nameViewStyle}>
                            <Text style={styles.nameStyle}>{this.state.data.petName}</Text>
                            <Image style={styles.rightImgStyle} source={require('../../images/MineImg/icon_right.png')}/>
                        </View>
                    </View>
                </TouchableOpacity>

                <View style={styles.lineViewStyle}>
                </View>

                <View style={styles.nickNameViewStyle}>
                    <Text style={styles.headIconTitleStyle}>已绑定手机号码</Text>
                    <View style={styles.nameViewStyle}>
                        <Text style={styles.nameStyle}>{phoneNo.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</Text>
                    </View>
                </View>

                <View style={styles.lineViewStyle}>
                </View>

                <Loading ref={(view)=>{Loading.loadingDidCreate(view)}}>
                </Loading>
            </View>
        )
    }

    // 上传图片
    headIconClick() {

        const options = {
            title: '选择图片',
            cancelButtonTitle: '取消',
            takePhotoButtonTitle: '相机',
            chooseFromLibraryButtonTitle: '相册',
            cameraType: 'back',
            mediaType: 'photo',
            videoQuality: 'high',
            durationLimit: 10,
            maxWidth: 300,
            maxHeight: 300,
            quality: 0.8,
            angle: 0,
            allowsEditing: false,
            noData: false,
            storageOptions: {
                skipBackup: true
            }
        };
        ImagePicker.showImagePicker(options, (response) => {
            console.log('Response = ', response);

            if (response.didCancel) {
                console.log('User cancelled photo picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else {
                let imageArray = [response.uri];

                this.UploadFileImageNet({'file':response.data}, imageArray)
            }
        });
    }
    // 上传文件
    UploadFileImageNet(param, images){
        Loading.showLoading("正在上传图片...");
        NetService.uploadFile('heque-user/fileInfo/fileUpload', images, param, data=>{
            Loading.dismiss();
            // 更新头像
            this.updateHeadPictureNet({'userId':userId, 'portraitFid':data.fullPath});

        }, response=>{
            console.log(response);
            Loading.dismiss();
            ToastView.showShortHudView(response.message);
        })
    }
    // 修改头像网络
    updateHeadPictureNet(param) {
        NetService.GET('heque-user/user/update_petname_or_portraitfid', param, data=>{
            Loading.dismiss();
            ToastView.showShortHudView("头像修改成功");
            // 发送登录成功事件
            DeviceEventEmitter.emit('loginSuccessNotification', '1');
            // 更新UI数据
            this.getUserInfoNet({'id':userId});
        }, response=>{
            Loading.dismiss();
            if (response.code === NetService.Token_Lose) {
                // 返回堆栈中的第一个页面
                this.props.navigation.popToTop();
            }
        })
    }


    // 修改昵称
    nameClick() {
        if (this.state.data) {
            this.props.navigation.push('MyChangeNameView', {petName:this.state.data.petName});
        }
    }

    // 获取用户信息数据
    getUserInfoNet(param) {
        console.log('getUserInfoNet');
        Loading.showLoading();
        NetService.POST('heque-user/user/getUserPortraitAndPetName', param, data=>{
            Loading.dismiss();
            this.setState({
                data: data,
            })
        }, response=>{
            Loading.dismiss();
        });
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222224',
    },

    lineViewStyle: {
        height: LayoutTool.scaleSize(1),
        backgroundColor: '#39393B',
        marginLeft: LayoutTool.scaleSize(36),
        marginRight: LayoutTool.scaleSize(36),
    },

    headIconViewStyle: {
        height: LayoutTool.scaleSize(147),
        width: SCREEN_WIDTH,
        alignItems: 'center',
        // 设置主轴方向  row:水平  column:竖直
        flexDirection: 'row',
        // 设置主轴对齐方式
        justifyContent:'space-between',
    },
    headIconTitleStyle: {
        fontSize: LayoutTool.setSpText(30),//15,
        color: '#F2D3AB',
        marginLeft: 58*unitWidth,
    },

    iconBgViewStyle: {
        height: LayoutTool.scaleSize(147),
        width: LayoutTool.scaleSize(350),
        alignItems: 'center',
        // 设置主轴方向  row:水平  column:竖直
        flexDirection: 'row',
        justifyContent:'flex-end',
    },
    iconStyle: {
        width: LayoutTool.scaleSize(100),
        height: LayoutTool.scaleSize(100),
        marginRight: LayoutTool.scaleSize(48),
        borderRadius: LayoutTool.scaleSize(48),
    },
    rightImgStyle: {
        width: LayoutTool.scaleSize(15),
        height: LayoutTool.scaleSize(24),
        marginRight: LayoutTool.scaleSize(48),
    },

    nickNameViewStyle: {
        height: LayoutTool.scaleSize(120),
        width: SCREEN_WIDTH,
        alignItems: 'center',
        // 设置主轴方向  row:水平  column:竖直
        flexDirection: 'row',
        // 设置主轴对齐方式
        justifyContent:'space-between',
    },
    nameViewStyle: {
        height: LayoutTool.scaleSize(120),
        width: LayoutTool.scaleSize(350),
        alignItems: 'center',
        // 设置主轴方向  row:水平  column:竖直
        flexDirection: 'row',
        justifyContent:'flex-end',
    },
    nameStyle: {
        fontSize: LayoutTool.setSpText(32),//16,
        color: '#8B8782',
        marginRight: LayoutTool.scaleSize(48),
    },
});
