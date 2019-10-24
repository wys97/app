
// 订单投诉提交


import React from 'react'
import {StyleSheet, View, Text, TouchableOpacity, Image, TextInput, FlatList} from 'react-native'

const dismissKeyboard = require('dismissKeyboard');

import {SCREEN_HEIGHT, SCREEN_WIDTH, STATUSBAR_HEIGHT, SOFT_MENU_BAR_HEIGHT} from '../../Tools/Layout';
import {unitWidth} from "../../Tools/Layout";

import ImagePicker from 'react-native-image-picker';
import Loading from "../../Tools/Loading";
import NetService from "../../Tools/NetService";
import ToastView from "../../Tools/ToastHudView";
import LayoutTool from "../../Tools/Layout"

import MyOrderComplaintSubmitSuccessView from "./MyOrderComplaintSubmitSuccessView";
import {Header} from "react-navigation";
import CustomNavHeaderLeftView from "../Common/CustomNavHeaderLeftView"

export default class MyOrderComplaintSubmitView extends React.Component{

    static navigationOptions = ({navigation}) => {
        return {
            title: "订单投诉",
        };
    };

    constructor(props) {
        super(props);
        this._onChangeText = this._onChangeText.bind(this);

        this.state = {
            dataList:[],
            data: "",
            shopDataList:[],
            menDataList:[],
            imgUrl: "",
            contentValue: "",

            photoImg: require("../../images/MineImg/icon_uploadOneImg.png"),
            showView: false,
        }
    }

    componentDidMount(){
        const { params } = this.props.navigation.state;

        let dataTypeList = [];
        for (let i = 0; i < params.dataList.length; i++) {
            let dataModel = params.dataList[i];
            // type 1：订单投诉  2：申请售后
            if (dataModel.type === params.data.type) {
                dataTypeList.push(dataModel);
            }
        }
        this.setState({
            data: params.data,
            dataList: dataTypeList,
        });
    }

    render(){

        let count = null;
        if (this.state.dataList.length > 6) {
            count = 6;
        }else  {
            count = this.state.dataList.length;
        }
        let height = count*LayoutTool.scaleSize(102) + LayoutTool.scaleSize(178);
        let reasonListViewStyle = {
            height: height,
            width: SCREEN_WIDTH,
            position: 'absolute',
            bottom: SOFT_MENU_BAR_HEIGHT,//STATUSBAR_HEIGHT+Header.HEIGHT,
            backgroundColor: '#202021',
        };
        let listViewStyle = {
            height: count*LayoutTool.scaleSize(102),
            width: SCREEN_WIDTH,
            backgroundColor: '#2F2F30',
        };

        return (

            <View style={styles.container}>
                <View style={styles.container}>
                    <TouchableOpacity activeOpacity={1} onPress={() =>this.keyboardBtnClick()}>
                        <View style={styles.topRadiusViewStyle}/>
                        <View style={styles.reasonBgViewStyle}>
                            <Text style={{
                                fontSize: LayoutTool.setSpText(30),//15,
                                color: "#F2D3AB",
                                marginLeft: LayoutTool.scaleSize(40),
                            }}>投诉类型</Text>

                            <TouchableOpacity style={{
                                                flexDirection: 'row',
                                alignItems:'center',
                            }} activeOpacity={0.7} onPress={() =>this.reasonBtnClick()}>
                                <Text style={{
                                    fontSize: LayoutTool.setSpText(28),//14,
                                    color: "#F2D3AB",
                                    marginRight: LayoutTool.scaleSize(20),
                                }}>{this.state.data.content}</Text>
                                <Image style={{
                                    width: LayoutTool.scaleSize(15),
                                    height: LayoutTool.scaleSize(24),
                                    marginRight: LayoutTool.scaleSize(30),
                                    marginTop: LayoutTool.scaleSize(3),
                                }} source={require("../../images/MineImg/icon_right2.png")}/>
                            </TouchableOpacity>

                        </View>

                        <View style={styles.inputBgViewStyle}>
                            <View style={styles.inputGrayViewStyle}>
                                <TextInput style={styles.textInputViewStyle} multiline={true}
                                           placeholder = '补充详细信息以便客服更快帮您处理（选填）'
                                           placeholderTextColor = {'#727272'}
                                           // returnKeyType = "done"
                                           underlineColorAndroid = "transparent"
                                           maxLength = {80}
                                           textAlignVertical="top"
                                           onChangeText={this._onChangeText}
                                />
                            </View>
                        </View>

                        <View style={styles.photoBgViewStyle}>
                            <View style={{height:LayoutTool.scaleSize(40)}}/>
                            <Text style={{
                                fontSize: LayoutTool.setSpText(30),//15,
                                color: "#F2D3AB",
                                marginLeft: LayoutTool.scaleSize(40),
                            }}>上传凭证</Text>

                            <TouchableOpacity style={{
                                width: LayoutTool.scaleSize(144),
                                height: LayoutTool.scaleSize(144),
                                marginLeft: LayoutTool.scaleSize(40),
                                marginTop: LayoutTool.scaleSize(26),
                            }} activeOpacity={0.7} onPress={() =>this.photoBtnClick()}>
                                <Image style={{
                                    width: LayoutTool.scaleSize(144),
                                    height: LayoutTool.scaleSize(144),
                                }} source={this.state.photoImg}/>
                            </TouchableOpacity>
                            <View style={{height:LayoutTool.scaleSize(30)}}/>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.submitBgViewStyle}>
                        <TouchableOpacity activeOpacity={0.7} onPress={() =>this.submitBtnClick()}>
                            <View style={styles.submitViewStyle}>
                                <Image style={styles.submitViewStyle} source={require("../../images/MineImg/icon_submmit.png")}/>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/*选择投诉理由View*/}
                    {this.state.showView?<View style={styles.reasonListBgViewStyle}>

                        <View style={reasonListViewStyle}>
                            <View style={{
                                width: SCREEN_WIDTH,
                                height: LayoutTool.scaleSize(76),
                                backgroundColor: '#3C3C3D',
                                justifyContent: 'center',
                            }}>
                                <Text style={{
                                    fontSize: LayoutTool.setSpText(28),//14,
                                    color:'#A7A39E',
                                    marginLeft: LayoutTool.scaleSize(25),
                                }}>投诉类型</Text>
                            </View>

                            <FlatList style={listViewStyle}
                                      data={this.state.dataList}
                                      renderItem={this.renderItem.bind(this)}
                                      keyExtractor={(item, index) => 'key' + index}
                            />

                            <View style={styles.cancelBgViewStyle}>
                                <TouchableOpacity activeOpacity={0.7} onPress={() =>this.cancelBtnClick()}>
                                    <View style={{
                                        backgroundColor: '#2F2F30',
                                        width: SCREEN_WIDTH,
                                        marginTop: LayoutTool.scaleSize(15),
                                        height: LayoutTool.scaleSize(85),
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <Text style={{
                                            fontSize: LayoutTool.setSpText(32),//16,
                                            fontWeight: "bold",
                                            color: "#FF9C43",
                                        }}>取消</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                        </View>

                    </View>:null}

                </View>
                <Loading ref={(view)=>{Loading.loadingDidCreate(view)}}>
                </Loading>
            </View>
        )
    }

    // 设置item
    renderItem({item}) {
        return(
            <TouchableOpacity activeOpacity={1} onPress={() => this.itemBtnClick(item)}>
                <View style={styles.itemViewStyle}>
                    <Text style={{
                        fontSize: LayoutTool.setSpText(30),//15,
                        color: '#F2D3AB',
                        marginLeft: LayoutTool.scaleSize(28),
                    }}>{item.content}</Text>
                    <Image style={{
                        width: LayoutTool.scaleSize(32),
                        height: LayoutTool.scaleSize(32),
                        marginRight: LayoutTool.scaleSize(32),
                    }} source={(item.id == this.state.data.id)?require("../../images/MineImg/icon_reasonImgSele.png"):require("../../images/MineImg/icon_reasonImgNormal.png")}/>
                </View>
            </TouchableOpacity>
        )
    }
    // item点击事件
    itemBtnClick(data) {
        console.log(data);
        this.setState({
            showView: false,
            data: data,
        });
    }

    // 取消选择
    cancelBtnClick() {
        dismissKeyboard();
        this.setState({
            showView: false,
        });
    }

    // 选择理由
    reasonBtnClick() {
        dismissKeyboard();
        this.setState({
            showView: true,
        });
    }

    // 上传图片
    photoBtnClick() {
        dismissKeyboard();

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
                dismissKeyboard();
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
            this.setState({
                photoImg: {uri:data.fullPath},
                imgUrl: data.fullPath,
            });
            ToastView.showShortHudView("图片上传成功");
        }, response=>{
            console.log(response);
            Loading.dismiss();
            ToastView.showShortHudView(response.message);
        })
    }

    // 文本输入框
    _onChangeText(inputData) {
        this.setState({
            contentValue:inputData.replace(/\s*/g,""),
        });
    }

    // 提交投诉信息
    submitBtnClick() {

        if (this.isEmojiCharacter(this.state.contentValue) === true) {
            ToastView.showShortHudView("请勿输入表情等特殊字符");
            return false;
        }

        let param = {"fileInfoUrl":this.state.imgUrl,
                     "id":orderId,   // 订单id
                     "operObject":this.state.data.type,
                     "operType":this.state.data.id,
                     "remark":this.state.contentValue};
        Loading.showLoading("正在提交...");
        NetService.POST("heque-eat/complaint_details/add_complaint_info", param, data=>{
            Loading.dismiss();
            this.props.navigation.push('MyOrderComplaintSubmitSuccessView', {"data":data, "key":this.props.navigation.state.key});
        }, response=>{
            Loading.dismiss();
            ToastView.showShortHudView(response.message);
            if (response.code === NetService.Token_Lose) {
                // 返回堆栈中的第一个页面
                this.props.navigation.popToTop();
            }
        });
    }

    keyboardBtnClick() {
        dismissKeyboard();
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
        backgroundColor: '#222224',
    },

    topRadiusViewStyle: {
        backgroundColor:"#2F2F30",
        height: LayoutTool.scaleSize(16),
        borderTopLeftRadius: LayoutTool.scaleSize(16),
        borderTopRightRadius: LayoutTool.scaleSize(16),
        marginLeft: LayoutTool.scaleSize(40),
        marginRight: LayoutTool.scaleSize(40),
        marginTop: LayoutTool.scaleSize(40),
    },

    reasonBgViewStyle: {
        backgroundColor:"#2F2F30",
        marginLeft: LayoutTool.scaleSize(40),
        marginRight: LayoutTool.scaleSize(40),
        height: LayoutTool.scaleSize(85),
        flexDirection: 'row',
        justifyContent: "space-between",
        alignItems: "center",
    },

    reasonViewStyle: {
        height: 72*unitWidth,
        marginLeft: 10*unitWidth,
        marginRight: 1,
        marginTop: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },

    inputBgViewStyle: {
        // height: 320*unitWidth,
        marginLeft: LayoutTool.scaleSize(40),
        marginRight: LayoutTool.scaleSize(40),
        backgroundColor: "#2F2F30",
    },
    inputGrayViewStyle: {
        height: LayoutTool.scaleSize(256),
        marginLeft: LayoutTool.scaleSize(40),
        marginRight: LayoutTool.scaleSize(40),
        backgroundColor: "#2A2A2B",
    },
    textInputViewStyle: {
        height: LayoutTool.scaleSize(240),
        marginTop: LayoutTool.scaleSize(10),
        marginLeft: LayoutTool.scaleSize(16),
        marginRight: LayoutTool.scaleSize(16),
        color: '#F2D3AB',
        fontSize: LayoutTool.setSpText(28),//14,
        paddingVertical: 0,
    },

    photoBgViewStyle: {
        backgroundColor: "#2F2F30",
        // height: 250*unitWidth,
        marginLeft: LayoutTool.scaleSize(40),
        marginRight: LayoutTool.scaleSize(40),
        borderBottomLeftRadius: LayoutTool.scaleSize(16),
        borderBottomRightRadius: LayoutTool.scaleSize(16),
    },

    submitBgViewStyle: {
        width: SCREEN_WIDTH,
        height: LayoutTool.scaleSize(178),
        position: "absolute",
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
    },
    submitViewStyle: {
        width: LayoutTool.scaleSize(660),
        height: LayoutTool.scaleSize(84),
        alignItems: "center",
        justifyContent: "center",
    },


    reasonListBgViewStyle: {
        height: SCREEN_HEIGHT-Header.HEIGHT,
        width: SCREEN_WIDTH,
        backgroundColor: 'rgba(0,0,0,0.5)',
        position: 'absolute',
    },
    itemViewStyle: {
        height: LayoutTool.scaleSize(102),
        width: SCREEN_WIDTH,
        flexDirection: 'row',
        justifyContent:'space-between',
        alignItems: 'center',
    },

    cancelBgViewStyle: {
        backgroundColor: "#202021",
        width: SCREEN_WIDTH,
        height: LayoutTool.scaleSize(100),
    },
});
