
// 我的订单


import React from 'react'
import {StyleSheet, View, Text, FlatList, Image, TouchableOpacity, Alert, DeviceEventEmitter} from 'react-native'

import NetService from '../../Tools/NetService';
import Loading from '../../Tools/Loading';
import ToastView from "../../Tools/ToastHudView";
import {SCREEN_WIDTH, unitWidth} from "../../Tools/Layout";
import LayoutTool from "../../Tools/Layout"


import MyOrderDetailView from "./MyOrderDetailView"


export default class MyOrderListView extends React.Component{

    static navigationOptions = ({navigation}) => {
        return {
            title: "我的订单",
        }
    };

    constructor(props) {
        super(props);
        // 初始状态
        this.state = {
            dataList: [],
            refreshing: false,
            page: 1,
            pageSize: 10,

            totalDataNum: "",
        };
    }

    componentDidMount(){

        // 请求数据
        this.getMyOrderListDateNet({'userId':userId, 'page':1, 'pageSize': this.state.pageSize,});
    }

    render(){
        return (
            <View style={styles.container}>
                {(this.state.dataList.length > 0)?<FlatList data={this.state.dataList}

                                               renderItem={this.renderItem.bind(this)}

                                               onRefresh = {this._onRefresh.bind(this)} // 下拉刷新操作

                                               onEndReached={this._onEndReached.bind(this)}
                                               onEndReachedThreshold={0.2}
                                               refreshing = {this.state.refreshing} //等待加载出现加载的符号是否显示

                                               keyExtractor={(item, index) => 'key' + index}

                                               showsVerticalScrollIndicator={false}
                                    />:
                                    <View style={styles.noOrderDataViewStyle}>
                                        <Image style={{
                                                    width: LayoutTool.scaleSize(672),
                                                    height: LayoutTool.scaleSize(735),
                                                    marginTop: LayoutTool.scaleSize(100),
                                        }} source={require("../../images/MineImg/icon_noOrderImg.png")}/>
                                    </View>}
                <Loading ref={(view)=>{Loading.loadingDidCreate(view)}}>
                </Loading>
            </View>
        )
    }
    // 设置item
    renderItem({item}) {
        // state 状态1未完成 2失败 3已完成 4已取消 5 退款中(用户发起退款) 6退款失败(微信返回失败) 7退款成功(微信返回成功) 8.拒绝退款 9.取消退款
        if (item.state == 1 || item.state == 2) { // 未完成(待支付)
            return(

                <View style={styles.btnItemBgViewStyle}>

                    <TouchableOpacity activeOpacity={1} onPress={() => this.itemBtnClick(item.id)}>
                        <View style={styles.itemTitleStateBgViewStyle}>
                            <Text style={styles.storeNameTextStyle}>{item.storeName}</Text>
                            <Text style={styles.orderStateTextStyle}>未支付</Text>
                        </View>

                        <View style={styles.foodInfoBgViewStyle}>
                            <View style={styles.foodImgBgViewStyle}>
                                {item.dishesUrl?<Image style={styles.foodImgStyle} source={{uri:item.dishesUrl}}/>:null}
                            </View>

                            <View style={styles.foodOrderDescBgViewStyle}>
                                <Text style={styles.foodNameTextStyle}>{item.dishesName}</Text>
                                <Text style={styles.foodNumTextStyle}>{"共 " + item.orderNum + " 件商品"}</Text>
                                <Text style={styles.orderTimeTextStyle}>{"下单时间：" + this.timestampToTime(item.createTime)}</Text>
                            </View>

                            <View style={styles.priceBgViewStyle}>
                                <Text style={styles.priceTextViewStyle}>{'￥' + item.paymentPrice}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity={1}
                                      onPress={() => this.cancelOrderBtnClick(item.id)}>
                        <View style={styles.bottomBgViewStyle}>
                            <Image style={styles.linViewStyle} source={require('../../images/MineImg/icon_orderListLine.png')}/>
                            {/*<View style={styles.btnViewStyle}>*/}
                                {/*<Text style={styles.btnTextStyles}>取消订单</Text>*/}
                            {/*</View>*/}
                            <Image style={styles.btnViewStyle} source={require('../../images/MineImg/icon_orderListCancel.png')}/>

                        </View>
                    </TouchableOpacity>

                    <View style={styles.grayViewStyle}/>
                </View>
            )
        }else if (item.state == 4 || item.state == 7){ // 4已取消订单  7退款成功(微信返回成功)
            return(
                <TouchableOpacity activeOpacity={1} onPress={() => this.itemBtnClick(item.id)}>

                    <View style={styles.normalItemBgViewStyle}>
                        <View style={styles.itemTitleStateBgViewStyle}>
                            <Text style={styles.storeNameTextStyle}>{item.storeName}</Text>
                            <Text style={styles.orderStateTextStyle}>{(item.state==4)?"已取消":"退款成功"}</Text>
                        </View>

                        <View style={styles.foodInfoBgViewStyle}>
                            <View style={styles.foodImgBgViewStyle}>
                                {item.dishesUrl?<Image style={styles.foodImgStyle} source={{uri:item.dishesUrl}}/>:null}
                            </View>

                            <View style={styles.foodOrderDescBgViewStyle}>
                                <Text style={styles.foodNameTextStyle}>{item.dishesName}</Text>
                                <Text style={styles.foodNumTextStyle}>{"共 " + item.orderNum + " 件商品"}</Text>
                                <Text style={styles.orderTimeTextStyle}>{"下单时间：" + this.timestampToTime(item.createTime)}</Text>
                            </View>

                            <View style={styles.priceBgViewStyle}>
                                <Text style={styles.priceTextViewStyle}>{'￥' + item.paymentPrice}</Text>
                            </View>
                        </View>

                        <View style={styles.grayViewStyle}/>
                    </View>

                </TouchableOpacity>
            )
        }else if (item.state == 3 || item.state == 5 || item.state == 6 || item.state == 8 || item.state == 9){
            // 3已完成 5 退款中(用户发起退款) 6退款失败(微信返回失败) 7退款成功(微信返回成功) 8.拒绝退款 9.取消退款
            return(
                <TouchableOpacity activeOpacity={1} onPress={() => this.itemBtnClick(item.id)}>

                    <View style={styles.normalItemBgViewStyle}>
                        <View style={styles.itemTitleStateBgViewStyle}>
                            <Text style={styles.storeNameTextStyle}>{item.storeName}</Text>
                            <Text style={styles.orderStateTextStyle}>{(item.state == 3)?"已支付":(item.state == 5)?"退款中":"退款失败"}</Text>
                        </View>

                        <View style={styles.foodInfoBgViewStyle}>
                            <View style={styles.foodImgBgViewStyle}>
                                {item.dishesUrl?<Image style={styles.foodImgStyle} source={{uri:item.dishesUrl}}/>:null}
                            </View>

                            <View style={styles.foodOrderDescBgViewStyle}>
                                <Text style={styles.foodNameTextStyle}>{item.dishesName}</Text>
                                <Text style={styles.foodNumTextStyle}>{"共 " + item.orderNum + " 件商品"}</Text>
                                <Text style={styles.orderTimeTextStyle}>{"下单时间：" + this.timestampToTime(item.createTime)}</Text>
                            </View>

                            <View style={styles.priceBgViewStyle}>
                                <Text style={styles.priceTextViewStyle}>{'￥' + item.paymentPrice}</Text>
                            </View>
                        </View>

                        <View style={styles.grayViewStyle}/>
                    </View>

                </TouchableOpacity>

            )
        }else if (item.state === 2){ // 失败
        }
    }

    // item点击事件
    itemBtnClick(orderId) {
        global.orderId = orderId;
        this.props.navigation.push('MyOrderDetailView', {"orderId":orderId});
    }

    // 取消订单按钮点击
    cancelOrderBtnClick(orderId) {
        console.log("orderId......" + orderId);
        Alert.alert('确认取消订单？', '',
            [
                {text: '取消'},
                {
                    text: '确认',
                    onPress: () => {
                        this.setCancelOrderNet({"id":orderId});
                    }
                }
            ],
            {cancelable: false}
        )
    }
    setCancelOrderNet(param){
        Loading.showLoading("数据加载中...");
        NetService.GET('heque-eat/eat/delete_order', param, data=>{
            Loading.dismiss();

            DeviceEventEmitter.emit('cancelOrderNotification', '1');

            ToastView.showShortHudView("取消订单成功");
            // 请求数据
            this.getMyOrderListDateNet({'userId':userId, 'page':'1', 'pageSize': this.state.pageSize,});
        }, response=>{
            Loading.dismiss();
            if (response.code === NetService.Token_Lose) {
                // 返回堆栈中的第一个页面
                this.props.navigation.popToTop();
            }
            ToastView.showShortHudView(response.message);
        })
    }

    //下拉刷新,更改状态，重新获取数据
    _onRefresh(){
        this.setState({
            refreshing:true,
        },()=>{
            this.getMyOrderListDateNet({'userId':userId, 'page':1, 'pageSize': this.state.pageSize,});
        });
    }

    // 加载列表网络数据
    getMyOrderListDateNet(param){
        Loading.showLoading("数据加载中...");
        NetService.GET('heque-eat/eat/get_order_info_list', param, data=>{
            Loading.dismiss();
            this.setState({
                dataList:data.data,

                page: 1,
                refreshing: false,
                totalDataNum: data.totalRecord,
            });
        }, response=>{
            this.setState({
                refreshing: false,
            });
            Loading.dismiss();
            if (response.code === NetService.Token_Lose) {
                // 返回堆栈中的第一个页面
                this.props.navigation.popToTop();
            }
            ToastView.showShortHudView(response.message);
        }, error=>{
            this.setState({
                refreshing: false,
            });
        })
    }

    // 上拉加载更多
    _onEndReached(){
        let page = ++this.state.page;
        console.log("上拉加载更多..." + page);

        this.getMoreMyOrderData({'userId':userId, 'page':page, 'pageSize': this.state.pageSize,});
    }
    getMoreMyOrderData(param) {
        Loading.showLoading("数据加载中...");
        NetService.GET('heque-eat/eat/get_order_info_list', param, data=>{
            Loading.dismiss();
            let tempArray = [];
            if (data.data.length > 0) {
                tempArray = this.state.dataList.concat(data.data);
                this.setState({
                    dataList:tempArray,
                    page: param.page,
                });
            } else {
                let tempPage = --param.page;
                this.setState({
                    page: tempPage,
                });
            }

        }, response=>{
            let tempPage = --param.page;
            this.setState({
                page: tempPage,
            });
            Loading.dismiss();
            if (response.code === NetService.Token_Lose) {
                // 返回堆栈中的第一个页面
                this.props.navigation.popToTop();
            }
            ToastView.showShortHudView(response.message);
        }, error=>{
            let tempPage = --param.page;
            this.setState({
                page: tempPage,
            });
        })
    }



    // 时间戳转时间
    timestampToTime(timeString) {
        let time = timeString.replace(/-/g,'/');
        let timestamp = new Date(time).getTime();

        var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000

        let months= (date.getMonth()+1)>9?(date.getMonth()+1) :"0"+(date.getMonth()+1);
        let days= date.getDate()>9?date.getDate() :"0"+date.getDate();
        let hours = date.getHours()>9?date.getHours():"0"+date.getHours();
        let minutes= date.getMinutes()>9?date.getMinutes() :"0"+date.getMinutes();

        var date = (date.getFullYear()) + "." +
            (months) + "." +
            (days) + " " + (hours) + ":" + (minutes);
        return date;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222224',
    },
    noOrderDataViewStyle: {
        flex: 1,
        backgroundColor: '#222224',
        alignItems: 'center',
    },

    // 无按钮item View
    normalItemBgViewStyle: {
        backgroundColor: '#2F2F30',
        width: SCREEN_WIDTH,
        height: LayoutTool.scaleSize(285),
    },

    // 有按钮item View
    btnItemBgViewStyle: {
        backgroundColor: '#2F2F30',
        width: SCREEN_WIDTH,
        height: LayoutTool.scaleSize(370),
    },
    bottomBgViewStyle: {
        width: SCREEN_WIDTH,
        height: LayoutTool.scaleSize(86),
    },
    linViewStyle: {
        height: 2*unitWidth,
        marginLeft: LayoutTool.scaleSize(30),
        marginRight: LayoutTool.scaleSize(30),
        width: SCREEN_WIDTH - LayoutTool.scaleSize(60),
    },

    btnViewStyle: {
        width: LayoutTool.scaleSize(160),
        height: LayoutTool.scaleSize(53),
        position: 'absolute',
        top: LayoutTool.scaleSize(20),
        right: LayoutTool.scaleSize(30),
    },
    btnTextStyles: {
        fontSize: LayoutTool.setSpText(28),
        color: '#0E0E0E',
    },


    // item标题、状态
    itemTitleStateBgViewStyle: {
        width: SCREEN_WIDTH,
        height: LayoutTool.scaleSize(95),
        // 设置主轴方向  row:水平  column:竖直
        flexDirection: 'row',
        justifyContent:'space-between',
        alignItems: 'center',
    },
    // 门店名称
    storeNameTextStyle: {
        fontSize: LayoutTool.setSpText(32),
        color: '#F2D3AB',
        fontWeight: 'bold',
        marginLeft: LayoutTool.scaleSize(30),
    },
    // 订单状态
    orderStateTextStyle: {
        fontSize: LayoutTool.setSpText(30),
        color: '#F2D3AB',
        marginRight: LayoutTool.scaleSize(30),
    },

    // 菜品信息背景View
    foodInfoBgViewStyle: {
        width: SCREEN_WIDTH,
        height: LayoutTool.scaleSize(175),
        // 设置主轴方向  row:水平  column:竖直
        flexDirection: 'row',
    },
    // 菜品图片背景View
    foodImgBgViewStyle: {
        width: LayoutTool.scaleSize(212),
        height: LayoutTool.scaleSize(175),
    },
    foodImgStyle: {
        width: LayoutTool.scaleSize(160),
        height: LayoutTool.scaleSize(127),
        marginLeft: LayoutTool.scaleSize(30),
        borderRadius: LayoutTool.scaleSize(10),
    },

    // 菜品内容View
    foodOrderDescBgViewStyle: {
        height: LayoutTool.scaleSize(175),
    },
    foodNameTextStyle: {
        fontSize: LayoutTool.setSpText(30),
        color: '#F2D3AB',
        marginTop: LayoutTool.scaleSize(6),
    },
    foodNumTextStyle: {
        fontSize: LayoutTool.setSpText(24),
        color: '#F2D3AB',
        marginTop: LayoutTool.scaleSize(12),
    },
    orderTimeTextStyle: {
        fontSize: LayoutTool.setSpText(24),
        color: '#8B8782',
        marginTop: LayoutTool.scaleSize(16),
    },

    // 价格背景View
    priceBgViewStyle: {
        height: LayoutTool.scaleSize(126),
        alignItems: 'center',
        justifyContent: 'center',

        position: 'absolute',
        right: LayoutTool.scaleSize(30),
    },
    priceTextViewStyle: {
        fontSize: LayoutTool.setSpText(28),
        color: '#F2D3AB',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // 灰色隔条
    grayViewStyle:{
        width: SCREEN_WIDTH,
        height: LayoutTool.scaleSize(15),
        backgroundColor: '#222224',
    },
});
