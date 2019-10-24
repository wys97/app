
// 申请售后提交界面

import React from 'react'
import {StyleSheet, View, Text, TouchableOpacity, Image, TextInput, FlatList, ScrollView} from 'react-native'

const dismissKeyboard = require('dismissKeyboard');

import {SCREEN_HEIGHT, SCREEN_WIDTH, STATUSBAR_HEIGHT, SOFT_MENU_BAR_HEIGHT} from '../../Tools/Layout';
import {unitWidth} from "../../Tools/Layout";

import { Header } from 'react-navigation';

import MyOrderApplySuccessView from './MyOrderApplySuccessView'
import Loading from "../../Tools/Loading";
import NetService from "../../Tools/NetService";
import ToastView from "../../Tools/ToastHudView";
import ImagePicker from "react-native-image-picker";
import LayoutTool from "../../Tools/Layout"

import CustomNavHeaderLeftView from "../Common/CustomNavHeaderLeftView"

export default class MyOrderApplyAfterSaleView extends React.Component{

    static navigationOptions = ({navigation}) => {
        return {
            title: "申请售后",
        };
    };

    constructor(props) {
        super(props);
        this._onChangeText = this._onChangeText.bind(this);

        this.state = {
            orderDetailData: "",

            dataList: [],

            imgUrl: "",
            contentValue: "",

            reasonData: "",
            showView: false,
            photoImg: require("../../images/MineImg/icon_uploadOneImg.png"),
        }
    }

    componentDidMount() {

        // 获取订单详情数据
        this.getOrderDetailNet({"id":orderId});

        this.getOrderComplaintListNet({"type":2});
    }

    getOrderDetailNet(param) {
        Loading.showLoading("数据加载中...");
        NetService.GET('heque-eat/eat/user_order_details_info', param, data=>{
            Loading.dismiss();
            this.setState({
                orderDetailData:data,
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

    // 获取投诉列表数据
    getOrderComplaintListNet(param){
        Loading.showLoading("数据加载中...");
        NetService.GET("heque-eat/complaint_details/complaint_or_refund_options", param, data=>{
            Loading.dismiss();
            this.setState({
                dataList: data,
            });
        }, response=>{
            Loading.dismiss();
            ToastView.showShortHudView(response.message);
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
            bottom: SOFT_MENU_BAR_HEIGHT,//STATUSBAR_HEIGHT + Header.HEIGHT,
            backgroundColor: '#202021',
        };
        let listViewStyle = {
            height: count*LayoutTool.scaleSize(102),
            width: SCREEN_WIDTH,
            backgroundColor: '#2F2F30',
        };
        return (
            <View style={styles.container}>
                <TouchableOpacity activeOpacity={1} onPress={() =>this.keyboardBtnClick()}>
                    <ScrollView>
                        <View style={styles.topTitleViewStyle}>
                            <Image style={{
                                width: LayoutTool.scaleSize(32),
                                height: LayoutTool.scaleSize(32),
                                marginLeft: LayoutTool.scaleSize(38),
                            }} source={require("../../images/MineImg/icon_reasonImgSele.png")}/>
                            <Text style={{
                                fontSize: LayoutTool.setSpText(30),//15,
                                color: "#F2D3AB",
                                marginLeft: LayoutTool.scaleSize(20),
                            }}>全部商品</Text>
                        </View>

                        <View style={styles.foodRadiusViewStyle}>
                            {this.state.orderDetailData?this.setUpFoodView(this.state.orderDetailData.list):null}
                        </View>


                        <View style={styles.refundReasonBgViewStyle}>
                            <View style={styles.showReasonTitleBgViewStyle}>
                                <Text style={{
                                    fontSize: LayoutTool.setSpText(30),//15,
                                    color: "#F2D3AB",
                                    marginLeft: LayoutTool.scaleSize(46),
                                }}>退款原因</Text>

                                <TouchableOpacity activeOpacity={0.7} onPress={() =>this.reasonBtnClick()}>
                                    <View style={styles.reasonViewStyle}>
                                        <Text style={{
                                            fontSize: LayoutTool.setSpText(28),//14,
                                            color: "#F2D3AB",
                                            marginRight: LayoutTool.scaleSize(20),
                                            lineHeight:LayoutTool.scaleSize(32),
                                            height:LayoutTool.scaleSize(32),
                                        }}>{this.state.reasonData?this.state.reasonData.content:"请选择"}</Text>

                                        <Image style={{
                                            width: LayoutTool.scaleSize(15),
                                            height: LayoutTool.scaleSize(24),
                                            marginRight: LayoutTool.scaleSize(40),
                                            marginTop: LayoutTool.scaleSize(3),
                                        }} source={require("../../images/MineImg/icon_right2.png")}/>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputBgViewStyle}>
                            <View style={styles.inputGrayViewStyle}>
                                <TextInput style={styles.textInputViewStyle} multiline={true}
                                           placeholder = '补充详细信息以便客服更快帮您处理（选填）'
                                           placeholderTextColor = {'#727272'}
                                           returnKeyType = "done"
                                           underlineColorAndroid = "transparent"
                                           maxLength = {80}
                                           // multiline = "true"
                                           textAlignVertical="top"
                                           onChangeText={this._onChangeText}
                                />
                            </View>
                        </View>

                        <View style={styles.photoBgViewStyle}>
                            <Text style={{
                                fontSize: LayoutTool.setSpText(30),//15,
                                color: "#F2D3AB",
                                marginLeft: LayoutTool.scaleSize(40),
                            }}>上传凭证</Text>

                            <TouchableOpacity activeOpacity={0.7} onPress={() =>this.photoBtnClick()}>
                                <Image style={{
                                    width: LayoutTool.scaleSize(144),
                                    height: LayoutTool.scaleSize(144),
                                    marginLeft: LayoutTool.scaleSize(34),
                                    marginTop: LayoutTool.scaleSize(28),
                                }} source={this.state.photoImg}/>
                            </TouchableOpacity>

                        </View>
                    </ScrollView>
                </TouchableOpacity>

                <View style={styles.bottomBgViewStyle}>
                    <View style={styles.bottomLeftViewStyle}>
                        <View style={{
                                height: LayoutTool.scaleSize(90),
                                width: LayoutTool.scaleSize(212),
                                flexDirection: 'row',
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                        }}>
                            <Text style={{
                                fontSize: LayoutTool.setSpText(26),//13,
                                color: '#F2D3AB',
                                marginTop: LayoutTool.scaleSize(10),
                                marginRight: LayoutTool.scaleSize(6),
                            }}>￥</Text>
                            <Text style={{
                                fontSize: LayoutTool.setSpText(50),//25,
                                color: '#F2D3AB',
                                marginRight: LayoutTool.scaleSize(20),
                            }}>{this.state.orderDetailData.paymentPrice}</Text>

                        </View>

                        <View style={{
                            height: LayoutTool.scaleSize(90),
                        }}>
                            <Text style={{
                                fontSize: LayoutTool.setSpText(24),//12,
                                color: '#F2D3AB',
                                marginTop: LayoutTool.scaleSize(22),
                            }}>已包含快送费</Text>
                            <Text style={{
                                fontSize: LayoutTool.setSpText(20),//10,
                                color: '#A7A39E',
                                marginTop: LayoutTool.scaleSize(6),
                            }}>退款将按原路返回</Text>
                        </View>
                    </View>

                    <TouchableOpacity activeOpacity={0.7} onPress={() =>this.submitClick()}>
                        <View style={styles.bottomRightViewStyle}>
                            <Text style={{
                                    fontSize: LayoutTool.setSpText(32),//16,
                                    color: "#2D2D34",
                                    fontWeight: "bold",
                            }}>提交</Text>
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
                            }}>为了便于客服处理，请填写真实原因</Text>
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

                <Loading ref={(view)=>{Loading.loadingDidCreate(view)}}>
                </Loading>
            </View>
        )
    }

    // 穿件中间菜品、商品View
    setUpFoodView(listData) {
        let itemArr = [];
        for (let i = 0; i < listData.length; i++) {
            let data = listData[i];
            itemArr.push(
                <View key={i} style={styles.shopBgViewStyle}>
                    <Text style={{fontSize:LayoutTool.setSpText(30),//15,
                        color:"#F2D3AB",
                        marginLeft: LayoutTool.scaleSize(45),
                        width: LayoutTool.scaleSize(300),
                    }} numberOfLines={1}>{data.dishesName}</Text>

                    <Text style={{fontSize:LayoutTool.setSpText(30),//15,
                        color:"#F2D3AB",
                    }}>{"x " + data.number}</Text>

                    <Text style={{
                        fontSize:LayoutTool.setSpText(30),//15,
                        color:"#F2D3AB",
                        marginRight: LayoutTool.scaleSize(40),
                    }}>{"￥" + data.paymentPrice}</Text>
                </View>
            );
        }
        return itemArr;
    }

    // 选择理由
    reasonBtnClick() {
        dismissKeyboard();
        this.setState({
            showView: true,
        });
    }
    // 文本输入框
    _onChangeText(inputData) {
        this.setState({
            contentValue:inputData.replace(/\s*/g,""),
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
                    }} source={(item.id == this.state.reasonData.id)?require("../../images/MineImg/icon_reasonImgSele.png"):require("../../images/MineImg/icon_reasonImgNormal.png")}/>
                </View>
            </TouchableOpacity>
        )
    }
    // item点击事件
    itemBtnClick(data) {
        this.setState({
            showView: false,
            reasonData: data,
        });
    }
    // 取消选择
    cancelBtnClick() {
        this.setState({
            showView: false,
        });
    }

    submitClick() {
        dismissKeyboard();
        if (!this.state.reasonData) {
            ToastView.showShortHudView("请选择退款原因");
            return false;
        }
        if (this.isEmojiCharacter(this.state.contentValue) === true) {
            ToastView.showShortHudView("请勿输入表情等特殊字符");
            return false;
        }

        Loading.showLoading("正在提交...");
        let param = {"id":orderId,
                    "complaintsTypeId":this.state.reasonData.id,
                    "remark":this.state.contentValue,
                    "fileInfoUrl":this.state.imgUrl};
        NetService.POST('heque-eat/wechat_pay/wechat_pay_refund', param, data=>{
            Loading.dismiss();
            this.props.navigation.push('MyOrderApplySuccessView');
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

    topTitleViewStyle: {
        backgroundColor: "#2F2F30",
        marginTop: LayoutTool.scaleSize(30),
        marginLeft:LayoutTool.scaleSize(40),
        marginRight: LayoutTool.scaleSize(40),
        height: LayoutTool.scaleSize(120),
        borderRadius: LayoutTool.scaleSize(16),
        flexDirection: 'row',
        alignItems: 'center',
    },
    foodRadiusViewStyle: {
        backgroundColor: "#2F2F30",
        marginTop: LayoutTool.scaleSize(20),
        marginLeft:LayoutTool.scaleSize(40),
        marginRight: LayoutTool.scaleSize(40),
        borderRadius: LayoutTool.scaleSize(16),
    },

    // 菜品View
    shopBgViewStyle: {
        height: LayoutTool.scaleSize(90),
        flexDirection: 'row',
        justifyContent:'space-between',
        alignItems:"center",
    },

    refundReasonBgViewStyle: {
        backgroundColor: "#2F2F30",
        marginTop: LayoutTool.scaleSize(20),
        marginLeft:LayoutTool.scaleSize(40),
        marginRight: LayoutTool.scaleSize(40),
        borderRadius: LayoutTool.scaleSize(16),
    },

    showReasonTitleBgViewStyle: {
        backgroundColor:"#2F2F30",
        height: LayoutTool.scaleSize(65),
        marginTop: LayoutTool.scaleSize(28),
        flexDirection: 'row',
        justifyContent: "space-between",
        alignItems:"center",
    },
    reasonViewStyle: {
        backgroundColor:"#2F2F30",
        height: LayoutTool.scaleSize(65),
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems:"center",
    },

    inputBgViewStyle: {
        height: LayoutTool.scaleSize(320),
        marginRight: LayoutTool.scaleSize(40),
        marginLeft: LayoutTool.scaleSize(40),
        backgroundColor: "#2F2F30",
    },
    inputGrayViewStyle: {
        height: LayoutTool.scaleSize(256),
        marginRight: LayoutTool.scaleSize(40),
        marginLeft: LayoutTool.scaleSize(40),
        marginTop: LayoutTool.scaleSize(30),
        backgroundColor: "#2A2A2B",
    },
    textInputViewStyle: {
        height: LayoutTool.scaleSize(240),
        marginTop: LayoutTool.scaleSize(20),
        marginLeft: LayoutTool.scaleSize(16),
        marginRight: LayoutTool.scaleSize(16),
        color: '#F2D3AB',
        fontSize: LayoutTool.setSpText(28),//14,
        paddingVertical: 0,
    },

    photoBgViewStyle: {
        backgroundColor: "#2F2F30",
        height: LayoutTool.scaleSize(250),
        marginLeft: LayoutTool.scaleSize(40),
        marginRight: LayoutTool.scaleSize(40),
        borderBottomLeftRadius: 10*unitWidth,
        borderBottomRightRadius: 10*unitWidth,
    },

    reasonListBgViewStyle: {
        height: SCREEN_HEIGHT-Header.HEIGHT,
        width: SCREEN_WIDTH,
        backgroundColor: 'rgba(0,0,0,0.5)',
        position: 'absolute',
    },
    itemViewStyle: {
        height: 102*unitWidth,
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

    // 底部View
    bottomBgViewStyle: {
        height: LayoutTool.scaleSize(90),
        width: SCREEN_WIDTH,
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
    },
    bottomLeftViewStyle: {
        height: LayoutTool.scaleSize(90),
        width: LayoutTool.scaleSize(414),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#464646',
    },
    bottomRightViewStyle: {
        height: LayoutTool.scaleSize(90),
        width: SCREEN_WIDTH-LayoutTool.scaleSize(414),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FEC575',
    }

});
