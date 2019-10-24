
// 菜品详情

import React from 'react'
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    SectionList,
    Alert,
    Linking,
    Modal,
    DeviceEventEmitter,
    ActionSheetIOS,
} from 'react-native'

import {ANDROID, IOS, SCREEN_WIDTH, STATUSBAR_HEIGHT, unitWidth} from '../../Tools/Layout';
import LayoutTool from '../../Tools/Layout'
import NetService from "../../Tools/NetService";
import MapUntil from "../../Tools/MapUntil";
import Loading from '../../Tools/Loading';

import SureOrderView from "./SureOrderView"
import LoginView from "../Login/Login"
import ShowNoPayPointOutView from "../Hud/ShowNoPayPointOutView";

export default class FoodDetailsView extends React.Component{

    static navigationOptions = ({navigation}) => {
        return {
            title: "菜品详情",
        }
    };

    constructor(props) {
        super(props);

        this.state = {

            index: "",              // 套餐编号
            storeData: "",          // 门店模型数据
            distance: "",           // 门店距离

            dataModel: "",          // 菜品信息模型数据
            foodImgArray: [],       // 菜品介绍图片

            noPayShowView: false,   // 是否显示未支付订单提示

            showTakeMealPayParam: "",       // 1:未支付  2:已支付未取餐
        }
    }

    // 移除通知事件
    componentWillUnmount(){
        this.listener.remove();
    }
    componentDidMount() {
        const { params } = this.props.navigation.state;

        let distance = "";
        if (params.storeData.number > 1000) {
            distance = params.storeData.number / 1000;
            distance = '距您：' + distance.toFixed(2) + 'km';
        } else {
            distance = '距您：' + params.storeData.number + 'm';
        }
        this.setState({
            index: params.index,
            storeData: params.storeData,
            distance: distance,
        });

        let that = this;
        // 去支付按钮点击
        this.listener =DeviceEventEmitter.addListener('goPayNotification',function(type){
            that.setState({
                noPayShowView: false,
            });
            global.orderSuccess = 1;
            that.props.navigation.pop();
        });

        this.getFoodDetailsNet({"dishId":params.foodData.dishId, "eatEverydayDishesDishesId":params.foodData.eatEverydayDishesDishesId, "stroeId":params.storeData.id});
    }
    // 查询菜品详情数据
    getFoodDetailsNet(param){
        Loading.showLoading("数据加载中...");
        NetService.POST("heque-eat/eat/eatUrlInfo", param, data=>{
            Loading.dismiss();
            this.setState({
                dataModel: data,
                foodImgArray: data.dishesDetailsImgUrl,
            });
        }, response=>{
            Loading.dismiss();
        });
    }

    render(){

        return (
            <View style={styles.container}>
                <SectionList
                    ListHeaderComponent={() =>
                        <View style={styles.headBgViewStyle}>
                            {/*菜品头图*/}
                            <Image style={styles.foodImgStyle} source={{uri:this.state.dataModel.dishesUrl}}/>
                            {/*菜品名称、剩余份数*/}
                            <View style={styles.foodNameNumBgViewStyle}>
                                <Text style={styles.foodNameStyle}>{this.state.dataModel.dishName}</Text>
                            </View>
                            {/*菜品描述*/}
                            <Text style={styles.foodBriefTextStyle}>{this.state.dataModel.dishesRemake}</Text>
                            {/*菜品价格信息View*/}
                            <View style={styles.foodPriceBgViewStyle}>
                                <View style={styles.foodPriceInfoViewStyle}>
                                    <View style={styles.leftBgViewStyle}>
                                        <Image style={styles.teHuiStyle} source={require('../../images/HomeImg/icon_teHuiLine.png')}/>
                                    </View>

                                    <View style={styles.rightBgViewStyle}>
                                        {/*实际价格*/}
                                        {this.state.dataModel.appSpecialOffer?<Text style={styles.deletePriceStyle}>{"￥" + this.state.dataModel.originalPrice}</Text>:null}
                                        <Text style={styles.signTextStyle}>￥</Text>
                                        {/*特惠价格*/}
                                        <Text style={styles.priceTextStyle}>{this.state.dataModel.appSpecialOffer?this.state.dataModel.appSpecialOffer:this.state.dataModel.originalPrice}</Text>
                                    </View>
                                </View>
                            </View>
                            {/*门店信息*/}
                            <View style={styles.storeInfoTitleViewStyle}>
                                <Text style={styles.titleNameTextStyle}>取餐点地址</Text>
                            </View>
                            <View style={styles.lineStyle}/>

                            <View style={styles.storeNameBgViewStyle}>
                                <Text style={styles.storeNameTextStyle}>{this.state.storeData.name}</Text>
                                <View style={styles.itemBtnViewStyle}>

                                    <TouchableOpacity activeOpacity={0.7} onPress={()=>this.daoHangClick()}>
                                        <Image style={{width: 50*unitWidth,
                                            height: 50*unitWidth,
                                            marginRight: 24*unitWidth,}}
                                               source={require("../../images/TakeMealsImg/icon_commonDaoHang.png")}/>
                                    </TouchableOpacity>

                                    <TouchableOpacity activeOpacity={0.7} onPress={()=>this.phoneClick()}>
                                        <Image style={{width: 50*unitWidth,
                                            height: 50*unitWidth,
                                            marginRight: 35*unitWidth,}}
                                               source={require("../../images/TakeMealsImg/icon_commonPhone.png")}/>
                                    </TouchableOpacity>

                                </View>
                            </View>
                            <Text style={styles.addressTextStyle} numberOfLines={1}>{this.state.distance + "  |  " + this.state.storeData.adds}</Text>
                        </View>
                    }

                    renderItem={({item, index, section}) =>
                        this._renderItem(item, index, section)
                    }

                    sections={[
                        { title: "菜品详情", data:this.state.foodImgArray }
                    ]}

                    keyExtractor={(item, index) => item + index}
                />
                <View style={styles.bottomBgViewStyle}>
                    <View style={styles.leftBottomViewStyle}>
                        <Text style={styles.bottomDeletePriceStyle}>{this.state.dataModel.originalPrice?"￥" + this.state.dataModel.originalPrice:"￥0"}</Text>
                        <Text style={styles.bottomSignTextStyle}>￥</Text>
                        <Text style={styles.bottomPriceTextStyle}>{this.state.dataModel.appSpecialOffer?this.state.dataModel.appSpecialOffer:this.state.dataModel.originalPrice}</Text>
                    </View>

                    <TouchableOpacity activeOpacity={1} onPress={()=>this.buyClick()}>
                        <View style={styles.rightBottomViewStyle}>
                            <Text style={{
                                fontSize: LayoutTool.setSpText(32),
                                fontWeight: 'bold',
                                color: '#fff',
                            }}>立即购买</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <Modal animationType={'none'}
                       transparent={true}
                       visible={this.state.noPayShowView}>
                    {/*1:未支付；2:已支付未取餐*/}
                    <ShowNoPayPointOutView info={this.state.showTakeMealPayParam}>

                    </ShowNoPayPointOutView>
                </Modal>

                <Loading ref={(view)=>{Loading.loadingDidCreate(view)}}>
                </Loading>
            </View>
        )
    }

    _renderItem(item, index, section){

        let valueScale = item.imageWidth/item.imageHeight;
        let foodImgStyle = {
            width: SCREEN_WIDTH,
            height: SCREEN_WIDTH/valueScale,
        };
        return(
            <View>
                <Image style={foodImgStyle} source={{uri:item.fullpath}}/>
            </View>
        )
    }

    // 导航按钮点击
    daoHangClick() {
        console.log("adds......" + this.state.storeData.adds);
        console.log("longitude......" + this.state.storeData.longitude);
        console.log("latitude......" + this.state.storeData.latitude);
        if(IOS) {
            ActionSheetIOS.showActionSheetWithOptions({
                    options: ["百度地图","高德地图","取消"], // 字符串数组
                    cancelButtonIndex: 2, // 第几个元素(索引)是cancelButton
                    title: '请选择地图导航',

                },
                (buttonIndex) => this.actionSheetClick(buttonIndex)
            );
        }else if(ANDROID) {
            Alert.alert(
                '',
                '请选择地图导航',
                [
                    {text: '百度地图', onPress: () => MapUntil.turnMapApp(this.state.storeData.longitude, this.state.storeData.latitude, 'baidu', this.state.storeData.adds)},
                    {text: '高德地图', onPress: () => MapUntil.turnMapApp(this.state.storeData.longitude, this.state.storeData.latitude, 'gaode', this.state.storeData.adds)},
                    {text: '取消', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                ],
                { cancelable: false },
            )
        }
    }
    actionSheetClick(buttonIndex) {
        if (buttonIndex === 0) {
            MapUntil.turnMapApp(this.state.storeData.longitude, this.state.storeData.latitude, 'baidu', this.state.storeData.adds)
        } else if (buttonIndex === 1) {
            MapUntil.turnMapApp(this.state.storeData.longitude, this.state.storeData.latitude, 'gaode', this.state.storeData.adds)
        }
    }
    // 拨打电话
    phoneClick() {

        let brief = "确定拨打电话：" + this.state.storeData.storePhoneNumber + " 吗？";
        Alert.alert('提示', brief,
            [
                {text: '取消'},
                {
                    text: '确认',
                    onPress: () => {
                        let phone = "tel:" + this.state.storeData.storePhoneNumber;
                        console.log("phone...." + phone);
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
    }

    // 立即购买按钮点击
    buyClick() {
        if (!this.state.dataModel) {
            return false;
        }
        // 未登录状态点击
        if (isLogin === false) {
            this.props.navigation.push('LoginView');
            return false;
        }
        // 查询是否有未支付订单
        let param = {"userId":userId};
        Loading.showLoading("");
        NetService.GET("heque-eat/eat/no_meal_order_info", param, data=>{
            Loading.dismiss();
            let payArray = [];
            let takeMealsArray = [];
            // 有未支付订单
            if (data.length > 0) {
                for (let i = 0 ; i < data.length; i++) {
                    let tempData = data[i];
                    // 未支付订单
                    if (tempData.state == 1 || tempData.state == 2) {
                        payArray.push(tempData);
                    }else { // 已支付未取餐订单
                        takeMealsArray.push(tempData);
                    }
                }
                // showTakeMealPayParam 1:未支付  2:已支付未取餐
                if (payArray.length > 0) {
                    this.setState({
                        noPayShowView: true,
                        showTakeMealPayParam: "1",
                    });
                    return false;
                }
                if(takeMealsArray.length >= 4) {
                    this.setState({
                        noPayShowView: true,
                        showTakeMealPayParam: "2",
                    });
                    return false;
                }else {
                    this.props.navigation.push('SureOrderView', {"storeData":this.state.storeData, "foodData":this.state.dataModel});
                }
            }else {
                this.props.navigation.push('SureOrderView', {"storeData":this.state.storeData, "foodData":this.state.dataModel});
            }
        }, response=>{
            Loading.dismiss();
        });
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    // 头部的背景
    headBgViewStyle: {
        width: SCREEN_WIDTH,
        height: 1030*unitWidth,
        backgroundColor: "#fff",
    },
    // 菜品图片
    foodImgStyle: {
        width: SCREEN_WIDTH,
        height: 603*unitWidth,
    },
    // 菜品名称、数量背景View
    foodNameNumBgViewStyle:{
        width: SCREEN_WIDTH,
        height: 80*unitWidth,
        flexDirection: 'row',
        alignItems: 'center',
    },
    foodNameStyle: {
        color:'#101111',
        fontSize: LayoutTool.setSpText(36),
        fontWeight: "bold",
        marginLeft: 35*unitWidth,
    },
    foodNumViewStyle: {
        width: 128*unitWidth,
        height: 32*unitWidth,
        borderColor: '#ffdcd4',
        borderWidth: 1,
        borderRadius: 5*unitWidth,
        borderStyle: 'solid',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10*unitWidth,
    },
    foodNumTextStyle: {
        color:'#FF513F',
        fontSize: LayoutTool.setSpText(24),
    },
    // 菜品描述
    foodBriefTextStyle: {
        color:'#727272',
        fontSize: LayoutTool.setSpText(24),
        marginLeft: 35*unitWidth,
    },
    // 菜品价格信息
    foodPriceBgViewStyle:{
        backgroundColor: '#f8f8f8',
        width: SCREEN_WIDTH,
        height: 100*unitWidth,
    },
    foodPriceInfoViewStyle: {
        backgroundColor: '#fff',
        width: SCREEN_WIDTH,
        height: 85*unitWidth,
        flexDirection: 'row',
        // 设置主轴对齐方式
        justifyContent:'space-between',
    },
    leftBgViewStyle: {
        marginLeft: 35*unitWidth,
        flexDirection: 'row',
    },
    teHuiStyle: {
        marginTop: 20*unitWidth,
        width: 76*unitWidth,
        height: 30*unitWidth,
    },
    rightBgViewStyle: {
        marginRight: 35*unitWidth,
        flexDirection: 'row',
        marginTop: 16*unitWidth,
    },
    priceTextStyle: {
        color:'#FF513F',
        fontSize: LayoutTool.setSpText(40),
    },
    signTextStyle: {
        color:'#FF513F',
        fontSize: LayoutTool.setSpText(26),
        marginTop: 14*unitWidth,
    },
    deletePriceStyle: {
        marginTop: 14*unitWidth,
        marginRight: 8*unitWidth,
        color: '#727272',
        fontSize: LayoutTool.setSpText(24),
        textDecorationLine:'line-through',
    },

    storeInfoTitleViewStyle: {
        width: SCREEN_WIDTH,
        height: 85*unitWidth,
    },
    titleNameTextStyle: {
        color:'#727272',
        fontSize: LayoutTool.setSpText(26),
        marginLeft: 35*unitWidth,
        marginTop: LayoutTool.scaleSize(36),
    },
    lineStyle: {
        width: SCREEN_WIDTH - 70*unitWidth,
        height: 1,
        marginLeft: 35*unitWidth,
        backgroundColor:'#f0f0f0',
    },

    storeNameBgViewStyle: {
        width: SCREEN_WIDTH,
        height: LayoutTool.scaleSize(80),
        flexDirection: 'row',
        // 设置主轴对齐方式
        justifyContent:'space-between',
        alignItems: 'center',
    },
    storeNameTextStyle: {
        color:'#101111',
        fontWeight: 'bold',
        fontSize: LayoutTool.setSpText(34),
        marginLeft: 34*unitWidth,
    },

    itemBtnViewStyle: {
        flexDirection: 'row',
        // 设置主轴对齐方式
        justifyContent:'center',
    },

    addressTextStyle: {
        color:'#101111',
        fontSize: LayoutTool.setSpText(24),
        marginLeft: 34*unitWidth,
        marginRight: LayoutTool.scaleSize(34),
    },

    // 底部View
    bottomBgViewStyle: {
        width: SCREEN_WIDTH,
        height: 100*unitWidth,
        flexDirection: 'row',
    },
    leftBottomViewStyle: {
        width: 314*unitWidth,
        height: 100*unitWidth,
        backgroundColor: "#464646",
        flexDirection: 'row',
    },
    bottomDeletePriceStyle: {
        marginTop: 40*unitWidth,
        marginLeft: 52*unitWidth,
        color: '#727272',
        fontSize: LayoutTool.setSpText(24),
        textDecorationLine:'line-through',
    },
    bottomSignTextStyle: {
        color:'#fff',
        fontSize: LayoutTool.setSpText(26),
        marginTop: 40*unitWidth,
        marginLeft: 16*unitWidth,
    },
    bottomPriceTextStyle: {
        color:'#fff',
        fontWeight: 'bold',
        marginTop: 18*unitWidth,
        fontSize: LayoutTool.setSpText(50),
    },


    rightBottomViewStyle: {
        width: SCREEN_WIDTH-314*unitWidth,
        height: 100*unitWidth,
        backgroundColor: "#31B1B0",
        alignItems: 'center',
        justifyContent: 'center'
    },
});
