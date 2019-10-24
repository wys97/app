
// 我的订单详情

import React from 'react'
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
    DeviceEventEmitter,
    Modal, Linking, Platform
} from 'react-native'

import {SCREEN_WIDTH, STATUSBAR_HEIGHT,unitWidth} from '../../Tools/Layout';
import LayoutTool from "../../Tools/Layout"
import NetService from "../../Tools/NetService"
import Loading from '../../Tools/Loading';
import ToastView from "../../Tools/ToastHudView";

import MyKeFuHomeView from "./MyKeFuHomeView"
import MapUntil from "../../Tools/MapUntil";
import CancelRefundApplyAlertView from '../Hud/CancelRefundApplyAlertView'

const Rad = ((d)=>{
    return d * Math.PI / 180.0;//经纬度转换成三角函数中度分表形式。
});

export default class MyOrderDetailView extends React.Component{

    static navigationOptions = ({navigation}) => {
        return {
            title: "订单详情",
            // headerStyle:{
            //     backgroundColor:"#31B1B0",
            // },
            // headerTintColor: "#fff",
            //
            // headerLeft: <CustomNavHeaderLeftView nav = {navigation} />,

            headerRight: (
                <TouchableOpacity activeOpacity={0.7} onPress={() =>{navigation.push("MyKeFuHomeView", {"orderId":orderId})}}>

                    <View style={{width:100, height:44, justifyContent: "center"}}>
                        <Image style={{marginLeft:100-18-20, width:LayoutTool.scaleSize(38), height:LayoutTool.scaleSize(39)}}
                               source={require("../../images/MineImg/icon_kefu.png")}
                               />
                    </View>
                </TouchableOpacity>
            ),
        }
    };

    constructor(props) {
        super(props);

        this.state = {
            orderId:"",

            dataModel: "",

            showCancelRefundApplyAlertView: false,
        }
    }

    componentDidMount() {
        const { params } = this.props.navigation.state;

        this.setState({
            orderId: params.orderId,
        });

        let that = this;
        // 退款提交事件通知
        this.listener =DeviceEventEmitter.addListener('refundMoneyNotification',function(type){
            // 获取订单详情数据
            that.getOrderDetailNet({"id":params.orderId})
        });
        // 取消撤销退款
        this.listener =DeviceEventEmitter.addListener('cancelRevokeRefundApplyNotification',function(param){
            that.setState({
                showCancelRefundApplyAlertView: false,
            });
        });
        // 确认撤销退款
        this.listener =DeviceEventEmitter.addListener('sureRevokeRefundApplyNotification',function(param){
            that.setState({
                showCancelRefundApplyAlertView: false,
            });
            let dictParam = {"id": that.state.orderId};
            NetService.GET('heque-eat/wechat_pay/wechat_pay_revoke_refund', dictParam, data=>{
                Loading.dismiss();
                ToastView.showShortHudView("撤销退款申请提交成功");
                // 获取新的订单详情数据
                that.getOrderDetaiAgainlNet({"id":that.state.orderId});
            }, response=>{
                Loading.dismiss();
                if (response.code === NetService.Token_Lose) {
                    // 返回堆栈中的第一个页面
                    that.props.navigation.popToTop();
                }
                ToastView.showShortHudView(response.message);
            });
        });

        // 获取订单详情数据
        this.getOrderDetailNet({"id":params.orderId})
    }
    // 移除通知事件
    componentWillUnmount(){
        this.listener.remove();
    }

    getOrderDetailNet(param) {
        Loading.showLoading("数据加载中...");
        NetService.GET('heque-eat/eat/user_order_details_info', param, data=>{
            Loading.dismiss();
            this.setState({
                dataModel:data,
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
        return (
            <View style={styles.container}>
                {this.setUpView(this.state.dataModel)}

                <Modal animationType={'none'}
                       transparent={true}
                       visible={this.state.showCancelRefundApplyAlertView}>
                    <CancelRefundApplyAlertView>
                    </CancelRefundApplyAlertView>
                </Modal>

                <Loading ref={(view)=>{Loading.loadingDidCreate(view)}}>
                </Loading>
            </View>
        )
    }
    setUpView(data){
        // state 状态1未完成 2失败 3已完成 4已取消 5 退款中(用户发起退款) 6退款失败(微信返回失败) 7退款成功(微信返回成功) 8.拒绝退款
        // istakemeal 是否完成取餐 0 -没有完成取餐 1-完成取餐
        let foodTime1 = "";
        let foodTime2 = "";
        let foodTime3 = "";
        let foodTime4 = "";
        let timeArray = [];
        if (data.foodTime1) {
            foodTime1 = data.foodTime1.slice(0, 5) + "-" + data.foodTime1.slice(11, 16);
            timeArray.push(foodTime1);
        }
        if (data.foodTime2) {
            foodTime2 = data.foodTime2.slice(0, 5) + "-" + data.foodTime2.slice(11, 16);
            timeArray.push(foodTime2);
        }
        if (data.foodTime3) {
            foodTime3 = data.foodTime3.slice(0, 5) + "-" + data.foodTime3.slice(11, 16);
            timeArray.push(foodTime3);
        }
        if (data.foodTime4) {
            foodTime4 = data.foodTime4.slice(0, 5) + "-" + data.foodTime4.slice(11, 16);
            timeArray.push(foodTime4);
        }
        let radLat1 = Rad(lat);
        let radLat2 = Rad(data.latitude);
        let a = radLat1 - radLat2;
        let b = Rad(lon) - Rad(data.longitude);
        let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
        s = s * 6378.137;
        console.log("s......" + s);
        // EARTH_RADIUS;
        s = (Math.round(s * 10000) / 10000).toFixed(2);
        if (s >= 1) {
            s = s + 'km';
        } else {
            s = (Math.round(s * 1000)).toFixed(2) + 'm';
        }

        if (data.istakemeal === 0 && data.state === 3) { // 已支付未取餐
            return(
                <ScrollView style={styles.container}>
                    {/*<View style={styles.topColorBgViewStyle}>*/}
                        {/**/}
                    {/*</View>*/}
                    <View style={styles.takeMealsNumBgViewStyle}>
                        <Text style={styles.takeMealsNumTitleStyle}>取餐码</Text>
                        <Text style={styles.takeMealsNumTextStyle}>{data.takeMealCode}</Text>
                    </View>

                    <Image style={styles.orderDetailGapStyle} source={require("../../images/MineImg/icon_orderDetailGap.png")}/>

                    <View style={styles.storeInfoBgViewStyle}>

                        <View style={styles.storeNamePhoneMapStyle}>
                            <Text style={styles.storeNameTextStyle} numberOfLines={1}>{data.storeName}</Text>

                            <View style={styles.storeNamePhoneMapStyle}>
                                <TouchableOpacity activeOpacity={0.7} onPress={() =>this.mapBtnClick()}>
                                    <View style={styles.daoHangViewStyle}>
                                        <Image style={styles.daoHangImgStyle} source={require("../../images/MineImg/icon_daoHang.png")}/>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity activeOpacity={0.7} onPress={() =>this.phoneViewClick()}>
                                    <View style={styles.daoHangViewStyle}>
                                        <Image style={styles.daoHangImgStyle} source={require("../../images/TakeMealsImg/icon_commonPhone.png")}/>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Text style={styles.storeAddressTextStyle} numberOfLines={1}>{"距您 " + s + " | " + data.storeAddress}</Text>

                        <Text style={styles.storeTimeStyle}>供餐时间 {timeArray.join('/')}</Text>

                        <View style={{height: LayoutTool.scaleSize(30)}}/>

                    </View>
                    {this.setUpCommonView(data)}
                </ScrollView>
            )
        } else if(data.state === 5) { // 退款中

            return (
                <ScrollView style={styles.container}>

                    <View style={styles.refundBgViewStyle}>
                        <Text style={{
                            fontWeight: 'bold',
                            marginTop: LayoutTool.scaleSize(46),
                            fontSize: LayoutTool.setSpText(38),
                            color: '#F2D3AB',
                        }}>退款处理中</Text>

                        <Image style={{
                            width: LayoutTool.scaleSize(627),
                            height: LayoutTool.scaleSize(54),
                            marginTop: LayoutTool.scaleSize(30),
                        }} source={require("../../images/MineImg/icon_refundState.png")}/>

                        <TouchableOpacity activeOpacity={0.7} onPress={() =>this.cancelRefundBtnClick()}>
                            <Image style={{
                                    width: LayoutTool.scaleSize(230),
                                    height: LayoutTool.scaleSize(58),
                                    marginTop: LayoutTool.scaleSize(40),
                            }} source={require("../../images/MineImg/icon_refunApplyBtnImg.png")}/>
                        </TouchableOpacity>

                    </View>

                    <Image style={styles.orderDetailGapStyle} source={require("../../images/MineImg/icon_orderDetailGap.png")}/>

                    <View style={styles.storeInfoRefundBgViewStyle}>

                        <View style={styles.storeNamePhoneMapStyle}>
                            <Text style={styles.storeNameTextStyle} numberOfLines={1}>{data.storeName}</Text>

                            <View style={styles.storeNamePhoneMapStyle}>
                                <TouchableOpacity activeOpacity={0.7} onPress={() =>this.mapBtnClick()}>
                                    <View style={styles.daoHangViewStyle}>
                                        <Image style={styles.daoHangImgStyle} source={require("../../images/MineImg/icon_daoHang.png")}/>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity activeOpacity={0.7} onPress={() =>this.phoneViewClick()}>
                                    <View style={styles.daoHangViewStyle}>
                                        <Image style={styles.daoHangImgStyle} source={require("../../images/TakeMealsImg/icon_commonPhone.png")}/>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Text style={styles.storeTimeStyle}>供餐时间 {timeArray.join('/')}</Text>

                        <Text style={styles.storeAddressTextStyle} numberOfLines={1}>{"距您 " + s + "      " + data.storeAddress}</Text>
                        <View style={{height: LayoutTool.scaleSize(30)}}/>

                    </View>

                    {this.setUpCommonView(data)}
                </ScrollView>
            )
        } else { // 已取餐
            return(
                <ScrollView style={styles.container}>
                    <View style={styles.otherStateBgViewStyle}>
                        <Text style={{
                            fontWeight: 'bold',
                            marginTop: LayoutTool.scaleSize(46),
                            fontSize: LayoutTool.setSpText(50),
                            color: '#F2D3AB',
                        }}>{(data.state === 4|| data.state===2)?"已取消":(data.state === 3&&data.istakemeal === 1)?"已取餐":(data.state === 7)?"退款成功":(data.state === 6 || data.state === 8 || data.state === 9)?"退款申请失败":(data.state === 1)?"待支付":""}</Text>
                        <Text style={{
                            marginTop: 16*unitWidth,
                            fontSize: LayoutTool.setSpText(26),
                            color: '#8B8782',
                        }}>{(data.state === 4|| data.state===2)?"订单已取消":(data.state === 3&&data.istakemeal === 1)?"取餐码："+data.takeMealCode:"感谢使用禾师傅"}</Text>
                    </View>
                    <Image style={styles.orderDetailGapStyle} source={require("../../images/MineImg/icon_orderDetailGap.png")}/>
                    <View style={styles.storeInfoOtherBgViewStyle}>

                        <View style={styles.storeNamePhoneMapStyle}>
                            <Text style={styles.storeNameTextStyle} numberOfLines={1}>{data.storeName}</Text>

                            <View style={styles.storeNamePhoneMapStyle}>
                                <TouchableOpacity activeOpacity={0.7} onPress={() =>this.mapBtnClick()}>
                                    <View style={styles.daoHangViewStyle}>
                                        <Image style={styles.daoHangImgStyle} source={require("../../images/MineImg/icon_daoHang.png")}/>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity activeOpacity={0.7} onPress={() =>this.phoneViewClick()}>
                                    <View style={styles.daoHangViewStyle}>
                                        <Image style={styles.daoHangImgStyle} source={require("../../images/TakeMealsImg/icon_commonPhone.png")}/>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Text style={styles.storeTimeStyle}>供餐时间 {timeArray.join('/')}</Text>

                        <Text style={styles.storeAddressTextStyle} numberOfLines={1}>{"距您 " + s + "     " + data.storeAddress}</Text>
                        <View style={{height: LayoutTool.scaleSize(30)}}/>

                    </View>
                    {this.setUpCommonView(data)}
                </ScrollView>
            )
        }

    }
    setUpCommonView(data){
        return(
            <View>

                <Image style={styles.orderDetailGapStyle} source={require("../../images/MineImg/icon_orderDetailGap.png")}/>

                {data?this.setUpFoodView(data.list):null}

                <View style={styles.couponBgViewStyle}>
                    <View style={styles.orderDeatilLineStyle}/>
                    <View style={styles.couponInfoViewStyle}>
                        <Text style={{fontSize:LayoutTool.setSpText(30),
                            color:"#F2D3AB",
                            marginLeft: 32*unitWidth,
                        }}>优惠券</Text>

                        <Text style={{fontSize:LayoutTool.setSpText(30),
                            color:"#F2D3AB",
                            marginRight: 32*unitWidth,
                        }}>{data.discountPrice?"- ￥" + data.discountPrice:"- ￥0"}</Text>
                    </View>
                    <View style={styles.orderDeatilLineStyle}/>
                </View>

                <View style={styles.totalPriceViewStyle}>
                    <Text style={{fontSize:LayoutTool.setSpText(30),
                        color:"#F2D3AB",
                        marginLeft: 32*unitWidth,
                        fontWeight: "bold",
                    }}>合计</Text>

                    <Text style={{fontSize:LayoutTool.setSpText(32),
                        color:"#FF9C43",
                        marginRight: 32*unitWidth,
                        fontWeight: "bold",
                    }}>{data.paymentPrice?"￥" + data.paymentPrice:"￥0.00"}</Text>
                </View>

                <Image style={styles.orderDetailGapStyle} source={require("../../images/MineImg/icon_orderDetailGap.png")}/>

                <View style={styles.orderInfoViewStyle}>
                    <Text style={{
                        fontSize:LayoutTool.setSpText(24),
                        color:"#A7A39E",
                        marginLeft: 32*unitWidth,
                        marginRight: 32*unitWidth,
                        marginTop: 36*unitWidth,
                    }}>{data.createTime?"下单时间：" + this.timestampToTime(data.createTime) : "下单时间："}
                    </Text>
                    <Text style={{
                        fontSize:LayoutTool.setSpText(24),
                        color:"#A7A39E",
                        marginLeft: 32*unitWidth,
                        marginRight: 32*unitWidth,
                        marginTop: 12*unitWidth,
                    }}>{data.orderNo?"订单编号：" + data.orderNo:""}
                    </Text>
                    <Text style={{
                        fontSize:LayoutTool.setSpText(24),
                        color:"#A7A39E",
                        marginLeft: 32*unitWidth,
                        marginRight: 32*unitWidth,
                        marginTop: 12*unitWidth,
                    }}>{(data.channelType == 1)?"下单方式：app":"下单方式：公众号"}</Text>
                </View>
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
                    <Text style={{fontSize:LayoutTool.setSpText(30),
                            color:"#F2D3AB",
                            marginLeft: 32*unitWidth,
                            width: 300*unitWidth,
                    }}>{data.dishesName}</Text>

                    <Text style={{fontSize:LayoutTool.setSpText(30),
                            color:"#F2D3AB",
                    }}>{"x " + data.number}</Text>

                    <Text style={{
                            fontSize:LayoutTool.setSpText(30),
                            color:"#F2D3AB",
                            marginRight: 33*unitWidth,
                    }}>{"￥" + data.paymentPrice}</Text>
                </View>
            );
        }
        return itemArr;
    }


    // 导航前往按钮点击
    mapBtnClick() {
        Alert.alert(
            '请选择地图导航',
            '',
            [
                {text: '百度地图', onPress: () => MapUntil.turnMapApp(this.state.dataModel.longitude, this.state.dataModel.latitude, 'baidu', this.state.dataModel.storeAddress)},
                {text: '高德地图', onPress: () => MapUntil.turnMapApp(this.state.dataModel.longitude, this.state.dataModel.latitude, 'gaode', this.state.dataModel.storeAddress)},
                {text: '取消', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
            ],
            { cancelable: false },
        )
    }

    cancelRefundBtnClick() {
        this.setState({
            showCancelRefundApplyAlertView: true,
        });
    }
    getOrderDetaiAgainlNet(param) {
        NetService.GET('heque-eat/eat/user_order_details_info', param, data=>{
            this.setState({
                dataModel:data,
            });

        }, response=>{
            if (response.code === NetService.Token_Lose) {
                // 返回堆栈中的第一个页面
                this.props.navigation.popToTop();
            }
            ToastView.showShortHudView(response.message);
        });
    }

    // 时间戳转时间
    timestampToTime(timeString) {
        var time = timeString.replace(/-/g,'/');
        var timestamp = new Date(time).getTime();

        var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000

        var months= (date.getMonth()+1)>9?(date.getMonth()+1) :"0"+(date.getMonth()+1);
        var days= date.getDate()>9?date.getDate() :"0"+date.getDate();
        let hours = date.getHours()>9?date.getHours():"0"+date.getHours();
        var minutes= date.getMinutes()>9?date.getMinutes() :"0"+date.getMinutes();

        var date = (date.getFullYear()) + "." +
            (months) + "." +
            (days) + " " + (hours) + ":" + (minutes);
        return date;
    }

    // 拨打电话
    phoneViewClick() {
        if (this.state.dataModel.storePhoneNumber) {
            let brief = "确定拨打电话：" + this.state.dataModel.storePhoneNumber + " 吗？";
            Alert.alert('提示', brief,
                [
                    {text: '取消'},
                    {
                        text: '确认',
                        onPress: () => {
                            let phone = "tel:" + this.state.dataModel.storePhoneNumber;
                            Linking.canOpenURL(phone).then(supported => {
                                if (!supported) {
                                    console.log('Can\'t handle url: ' + phone);
                                } else {
                                    return Linking.openURL(phone);
                                }
                            }).catch(err => console.error('An error occurred', err));
                        }
                    }
                ],
                {cancelable: false}
            );
        }else {
            ToastView.showShortHudView('该门店暂时没有联系电话');
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#212122',
    },

    topColorBgViewStyle: {
        backgroundColor:"#212122",
        width: SCREEN_WIDTH,
        height: 72*unitWidth,
        marginTop: LayoutTool.scaleSize(40),
    },
    // 取餐码View
    takeMealsNumBgViewStyle: {
        backgroundColor:"#2F2F30",
        height: 240*unitWidth,
        borderTopLeftRadius: LayoutTool.scaleSize(10),
        borderTopRightRadius: LayoutTool.scaleSize(10),
        marginLeft: LayoutTool.scaleSize(40),
        marginRight: LayoutTool.scaleSize(40),
        marginTop: LayoutTool.scaleSize(40),
        alignItems: 'center',
    },
    takeMealsNumTitleStyle:{
        color: "#A7A39E",
        marginTop: 48*unitWidth,
        fontSize: LayoutTool.setSpText(28),
    },
    takeMealsNumTextStyle:{
        color: "#F2D3AB",
        marginTop: 24*unitWidth,
        fontSize: LayoutTool.setSpText(100),
        fontWeight: "bold",
    },

    // 退款中View
    refundBgViewStyle: {
        backgroundColor:"#2F2F30",
        height: 310*unitWidth,
        borderTopLeftRadius: LayoutTool.scaleSize(10),
        borderTopRightRadius: LayoutTool.scaleSize(10),
        marginLeft: LayoutTool.scaleSize(40),
        marginRight: LayoutTool.scaleSize(40),
        marginTop: LayoutTool.scaleSize(40),
        alignItems: 'center',
    },

    // 其他的状态显示
    otherStateBgViewStyle: {
        backgroundColor:"#2F2F30",
        height: 166*unitWidth,
        borderTopLeftRadius: LayoutTool.scaleSize(10),
        borderTopRightRadius: LayoutTool.scaleSize(10),
        marginLeft: LayoutTool.scaleSize(40),
        marginRight: LayoutTool.scaleSize(40),
        marginTop: LayoutTool.scaleSize(40),
        alignItems: 'center',
    },


    // 门店信息背景View
    storeInfoBgViewStyle: {
        backgroundColor:"#2F2F30",
        // height: LayoutTool.scaleSize(214),//152*unitWidth,
        // marginTop: 184*unitWidth,
        marginLeft: LayoutTool.scaleSize(40),
        marginRight: LayoutTool.scaleSize(40),
        // flexDirection: 'row',
    },
    storeNamePhoneMapStyle: {
        flexDirection: 'row',
        height: LayoutTool.scaleSize(70),
        justifyContent: 'space-between',
        marginTop: LayoutTool.scaleSize(20),
        alignItems: 'center',
    },

    // 门店信息背景View
    storeInfoOtherBgViewStyle: {
        backgroundColor:"#2F2F30",
        // height: 152*unitWidth,
        // marginTop: 108*unitWidth,
        marginLeft: LayoutTool.scaleSize(40),
        marginRight: LayoutTool.scaleSize(40),
        // flexDirection: 'row',
    },
    // 门店信息背景View
    storeInfoRefundBgViewStyle: {
        backgroundColor:"#2F2F30",
        // height: 152*unitWidth,
        marginLeft: LayoutTool.scaleSize(40),
        marginRight: LayoutTool.scaleSize(40),
        // flexDirection: 'row',
    },

    // 门店名称
    storeNameTextStyle: {
        color:"#F2D3AB",
        fontSize: LayoutTool.setSpText(30),
        marginLeft: 32*unitWidth,
        marginRight: 2*unitWidth,
    },
    // 门店地址
    storeAddressTextStyle: {
        color:"#A7A39E",
        fontSize: LayoutTool.setSpText(24),//12,
        marginTop: 16*unitWidth,
        marginLeft: 32*unitWidth,
        marginRight: 2*unitWidth,
    },

    // 地图导航View
    daoHangViewStyle: {
        width: 50*unitWidth,
        height: 70*unitWidth,
        marginRight: LayoutTool.scaleSize(30),
        right: 0,
        alignItems: "center",
    },
    daoHangImgStyle: {
        width: 50*unitWidth,
        height: 50*unitWidth,
    },
    daoHangTextStyle: {
        marginTop: 10*unitWidth,
        color:"#101111",
        fontSize: LayoutTool.setSpText(24),//12,
    },

    topRadiusViewStyle: {
        backgroundColor:"#2F2F30",
        height: 20*unitWidth,
        borderTopLeftRadius: 10*unitWidth,
        borderTopRightRadius: 10*unitWidth,
        marginTop: 15*unitWidth,
        marginLeft: 15*unitWidth,
        marginRight: 15*unitWidth,
    },
    // 菜品View
    shopBgViewStyle: {
        backgroundColor:"#2F2F30",
        height: 100*unitWidth,
        marginLeft: LayoutTool.scaleSize(40),
        marginRight: LayoutTool.scaleSize(40),
        flexDirection: 'row',
        justifyContent:'space-between',
        alignItems:"center",
    },

    couponBgViewStyle: {
        backgroundColor:"#2F2F30",
        height: 90*unitWidth,
        marginLeft: LayoutTool.scaleSize(40),
        marginRight: LayoutTool.scaleSize(40),
    },
    xuLineStyle: {
        width: SCREEN_WIDTH - 60*unitWidth - 30*unitWidth,
        marginLeft: 30*unitWidth,
        marginRight: 30*unitWidth,
        height: 2*unitWidth,
    },
    couponInfoViewStyle: {
        height: 86*unitWidth,
        flexDirection: 'row',
        justifyContent:'space-between',
        alignItems:"center",
    },

    // 合计View
    totalPriceViewStyle: {
        backgroundColor:"#2F2F30",
        height: 100*unitWidth,
        marginLeft: LayoutTool.scaleSize(40),
        marginRight: LayoutTool.scaleSize(40),
        flexDirection: 'row',
        justifyContent:'space-between',
        alignItems:"center",
    },

    // 订单信息View
    orderInfoViewStyle: {
        backgroundColor:"#2F2F30",
        height: 184*unitWidth,
        marginLeft: LayoutTool.scaleSize(40),
        marginRight: LayoutTool.scaleSize(40),
        borderBottomLeftRadius: 10*unitWidth,
        borderBottomRightRadius: 10*unitWidth,
    },

    storeTimeStyle: {
        fontSize: LayoutTool.setSpText(24),
        color: '#A7A39E',
        marginLeft: LayoutTool.scaleSize(30),
        marginRight: LayoutTool.scaleSize(10),
        marginTop: LayoutTool.scaleSize(15),
    },

    orderDetailGapStyle: {
        width: SCREEN_WIDTH - (Platform.OS === 'android'? LayoutTool.scaleSize( 81.5):LayoutTool.scaleSize( 82.5)) ,
        height: LayoutTool.scaleSize(35),
        marginLeft: LayoutTool.scaleSize(40),
        // backgroundColor:Platform.OS === 'android'? 'red':'blue',
        resizeMode:'stretch',
    },
    orderDeatilLineStyle: {
        marginLeft: LayoutTool.scaleSize(36),
        marginRight: LayoutTool.scaleSize(36),
        backgroundColor: '#39393B',
        height: LayoutTool.scaleSize(1),
    },
});
