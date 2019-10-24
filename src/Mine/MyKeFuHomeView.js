// 我的客服
import React from 'react'
import {StyleSheet, View, Text, TouchableOpacity, Image, Linking} from 'react-native'
import {SCREEN_WIDTH, unitWidth} from "../../Tools/Layout";

import NetService from "../../Tools/NetService"
import Loading from '../../Tools/Loading';
import ToastView from "../../Tools/ToastHudView";
import LayoutTool from "../../Tools/Layout"

import MyOrderComplaintListView from "./MyOrderComplaintListView"   // 订单投诉列表
import MyOrderApplyAfterSaleView from "./MyOrderApplyAfterSaleView" // 申请售后信息提交


export default class MyKeFuHomeView extends React.Component {

    static navigationOptions = ({navigation}) => {
        return {
            title: "我的客服",
        };
    };

    constructor(props) {
        super(props);

        this.state = {
            orderId: "",

            phoneData: "",
            data: "",
        }
    }

    componentDidMount() {
        // 设置返回到订单详情的路由
        global.routKey = this.props.navigation.state.key;

        this.setState({
            orderId: orderId,
        });

        // 获取客服电话
        this.getKeFuPhoneNet();

        // 判断是否有申请售后服务
        this.getIsApplyAfterSale({"id": orderId});
    }

    // 获取客服电弧
    getKeFuPhoneNet() {
        NetService.GET("heque-eat/eat/get_store_distance", null, data => {
            this.setState({
                phoneData: data,
            });
        }, response => {

        });
    }

    // 判断是否有申请售后服务
    getIsApplyAfterSale(param) {
        Loading.showLoading("数据加载中...");
        NetService.GET("heque-eat/complaint_details/after_sale_and_complaints", param, data => {
            Loading.dismiss();
            this.setState({
                data: data,
            });
        }, response => {
            Loading.dismiss();
            if (response.code === NetService.Token_Lose) {
                // 返回堆栈中的第一个页面
                this.props.navigation.popToTop();
            }
            ToastView.showShortHudView(response.message);
        });
    }


    render() {
        return (
            <View style={styles.container}>
                <Image style={styles.topHalfImgStyle} source={require("../../images/MineImg/icon_kefuTopHalfImg.png")}/>
                <View style={styles.keFuBgViewStyle}>
                    <View style={styles.keFuTopBriefBgViewStyle}>
                        <Image style={{
                            width: LayoutTool.scaleSize(98),
                            height: LayoutTool.scaleSize(98),
                        }} source={require("../../images/MineImg/icon_keFuMen.png")}>
                        </Image>
                        <View style={{marginLeft: LayoutTool.scaleSize(24)}}>
                            <Text style={{
                                fontSize: LayoutTool.setSpText(32),//16,
                                color: "#F2D3AB",
                                marginTop: LayoutTool.scaleSize(14),
                            }}>您好，请自助选择服务</Text>
                            <Text style={{
                                fontSize: LayoutTool.setSpText(24),//12,
                                color: "#8B8782",
                                marginTop: LayoutTool.scaleSize(12),
                            }}>若自助不能满足您的需求，请电话客服</Text>
                        </View>
                    </View>
                    <View style={{
                        height: LayoutTool.scaleSize(1),
                        backgroundColor: "#39393B",
                        marginLeft: LayoutTool.scaleSize(15),
                        marginRight: LayoutTool.scaleSize(15),
                        marginTop: LayoutTool.scaleSize(38),
                    }}/>

                    <Text style={{
                        color: "#F2D3AB",
                        fontWeight: "bold",
                        fontSize: LayoutTool.setSpText(30),
                        marginLeft: LayoutTool.scaleSize(35),
                        marginTop: LayoutTool.scaleSize(30),
                    }}>自助客服</Text>


                    <View style={styles.btnTypeBgViewStyle}>
                        {(this.state.data.yesNoRefund == 1) ?
                            <TouchableOpacity activeOpacity={0.7} onPress={() => this.applyBtnClick()}>
                                <View style={styles.applyBgViewStyle}>
                                    <Image style={{
                                        width: LayoutTool.scaleSize(80),
                                        height: LayoutTool.scaleSize(78),
                                    }} source={require("../../images/MineImg/icon_applyServe.png")}>
                                    </Image>
                                    <Text style={{
                                        fontSize: LayoutTool.setSpText(28),//14,
                                        color: "#8B8782",
                                        marginTop: LayoutTool.scaleSize(10),
                                    }}>申请售后</Text>
                                </View>
                            </TouchableOpacity> : null}

                        <TouchableOpacity style={styles.orderComplainStyle} activeOpacity={0.7}
                                          onPress={() => {
                                              this.props.navigation.push("MyOrderComplaintListView");
                                          }}>
                            <Image style={{
                                width: LayoutTool.scaleSize(80),
                                height: LayoutTool.scaleSize(78),
                            }} source={require("../../images/MineImg/icon_orderFail.png")}>
                            </Image>
                            <Text style={{
                                fontSize: LayoutTool.setSpText(28),//14,
                                color: "#8B8782",
                                marginTop: LayoutTool.scaleSize(10),
                            }}>订单投诉</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{width: SCREEN_WIDTH, height: LayoutTool.scaleSize(60)}}/>
                </View>



                <View style={styles.phoneBgViewStyle}>
                    <TouchableOpacity activeOpacity={0.7} onPress={() => this.phoneBtnClick()}>
                        <View style={styles.phoneViewStyle}>
                            <Image style={{
                                    width: LayoutTool.scaleSize(660),
                                    height: LayoutTool.scaleSize(84),
                            }} source={require("../../images/MineImg/icon_phoneColor.png")}/>
                        </View>
                    </TouchableOpacity>
                    <Text style={{
                        fontSize:LayoutTool.setSpText(24),
                        color:"#8B8782",
                        marginTop: LayoutTool.scaleSize(16),
                    }}>客服工作时间：周一到周日9:00-18:00</Text>
                </View>
                <Loading ref={(view) => {
                    Loading.loadingDidCreate(view)
                }}>
                </Loading>
            </View>
        )
    }

    // 申请售后
    applyBtnClick() {
        this.props.navigation.push("MyOrderApplyAfterSaleView");
    }

    // 订单投诉
    orderApplyClick() {
        alert('...订单投诉...');
        this.props.navigation.push("MyOrderComplaintListView");
    }

    // 客服电话拨打
    phoneBtnClick() {
        let phone = "tel:" + this.state.phoneData.customerServicePhone;
        Linking.canOpenURL(phone).then(supported => {
            if (!supported) {
                console.log('Can\'t handle url: ' + phone);
            } else {
                return Linking.openURL(phone);
            }
        }).catch(err => console.error('An error occurred', err));
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222224',
    },
    topHalfImgStyle: {
        marginLeft: LayoutTool.scaleSize(40),
        marginTop: LayoutTool.scaleSize(40),
        width: LayoutTool.scaleSize(670),
        height: LayoutTool.scaleSize(37)
    },
    keFuBgViewStyle: {
        backgroundColor: "#2F2F30",
        width: LayoutTool.scaleSize(670),
        marginLeft: LayoutTool.scaleSize(40),
        borderBottomLeftRadius: LayoutTool.scaleSize(16),
        borderBottomRightRadius: LayoutTool.scaleSize(16),
    },

    keFuTopBriefBgViewStyle: {
        marginLeft: LayoutTool.scaleSize(40),
        marginRight: LayoutTool.scaleSize(40),
        flexDirection: 'row',
    },

    btnTypeBgViewStyle: {
        marginTop: LayoutTool.scaleSize(36),
        flexDirection: 'row',
    },

    applyBgViewStyle: {
        width: 190 * unitWidth,
        height: 120 * unitWidth,
        alignItems: 'center',
    },
    orderComplainStyle: {

        width: 190 * unitWidth,
        height: 120 * unitWidth,
        alignItems: 'center',
        marginLeft: 20 * unitWidth,
    },

    phoneBgViewStyle: {
        width: SCREEN_WIDTH,
        height: LayoutTool.scaleSize(218),
        position: "absolute",
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
    },
    phoneViewStyle: {
        width: LayoutTool.scaleSize(660),
        height: LayoutTool.scaleSize(86),
        justifyContent: "center",
        alignItems: 'center',
        borderRadius: LayoutTool.scaleSize(43),
        backgroundColor: "#fff",
        borderColor: "#b4e8e8",
        borderWidth: 1,
        flexDirection: 'row',
    },

});
