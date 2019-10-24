// 选择使用优惠券

import React from 'react'
import {StyleSheet, View, Text, TouchableOpacity, Image, FlatList, ImageBackground} from 'react-native'

import {SCREEN_WIDTH, STATUSBAR_HEIGHT, unitWidth} from '../../Tools/Layout';
import LayoutTool from "../../Tools/Layout";
import ToastView from "../../Tools/ToastHudView";
import NetService from "../../Tools/NetService";
import LoadingView from "../../Tools/Loading";
import Layout from "../../Tools/Layout";


export default class SelectUseCouponView extends React.Component {

    static navigationOptions = ({navigation}) => {
        return {
            title: "选择优惠券",
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            orderId: "",

            dataList: [],

            selectCouponId: "",       // 选中的优惠券Id

            couponUseStateImg: require("../../images/TakeMealsImg/icon_couponNormal.png"),
        }
    }

    componentDidMount() {
        const {params} = this.props.navigation.state;

        this.setState({
            orderId: params.orderId,
            selectCouponId: params.selectCouponId,
        });
        if (!params.selectCouponId) {
            this.setState({
                couponUseStateImg: require("../../images/TakeMealsImg/icon_selectCoupon.png"),
            });
        }
        console.log(params);

        if (params.fromType == "sureOrder") {
            // 查询是否有券可以使用
            this.getSureOrderUseCouponNetData({
                "userId": global.userId,
                "totalPrice": params.totalPrice,
                "dishId": params.foodData.dishId,
                "storeId": params.storeData.id
            });
        } else {
            if (params.orderId) {
                this.getUseCouponNetData({"orderId": params.orderId});
            }
        }
    }

    // 查询是否有券可以使用
    getUseCouponNetData(param) {
        LoadingView.showLoading("数据加载中...");
        NetService.GET("heque-coupon/discount_coupon/query_card_rolls_use", param, data => {
            LoadingView.dismiss();
            let dataArray = [];
            for (let i = 0; i < data.length; i++) {
                let tempData = data[i];
                // type 1:不可使用  2:可使用
                if (tempData.type == 2) {
                    dataArray.push(tempData);
                }
            }
            this.setState({
                dataList: dataArray,
            });
        }, response => {
            LoadingView.dismiss();
            ToastView.showShortHudView(response.message);
            if (response.code === NetService.Token_Lose) {
                global.isLogin = false;
                // 删除数据
                this.setState({
                    dataList: [],
                });
                // 返回堆栈中的第一个页面
                this.props.navigation.popToTop();
            }
        });
    }

    // 查询是否有券可以使用
    getSureOrderUseCouponNetData(param) {
        LoadingView.showLoading("数据加载中...");
        NetService.GET("heque-coupon/discount_coupon/order_info_get_coupon", param, data => {
            LoadingView.dismiss();
            let dataArray = [];
            for (let i = 0; i < data.length; i++) {
                let tempData = data[i];
                // type 1:不可使用  2:可使用
                if (tempData.type == 2) {
                    dataArray.push(tempData);
                }
            }
            this.setState({
                dataList: dataArray,
            });
        }, response => {
            LoadingView.dismiss();
            ToastView.showShortHudView(response.message);
            if (response.code === NetService.Token_Lose) {
                global.isLogin = false;
                // 删除数据
                this.setState({
                    dataList: [],
                });
                // 返回堆栈中的第一个页面
                this.props.navigation.popToTop();
            }
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <TouchableOpacity activeOpacity={0.7} onPress={() => this.noUseCouponClick()}>
                    <View style={styles.topNoUseCouponViewStyle}>
                        <Text style={{
                            fontSize: LayoutTool.setSpText(32),
                            color: "#F2D3AB",
                            marginLeft: LayoutTool.scaleSize(32)
                        }}>不使用优惠券</Text>
                        <Image style={{
                            width: LayoutTool.scaleSize(42),
                            height: LayoutTool.scaleSize(42),
                            marginRight: LayoutTool.scaleSize(52),
                        }} source={this.state.couponUseStateImg}/>
                    </View>
                </TouchableOpacity>
                {/*创建列表*/}
                {this.state.dataList.length > 0 ? <FlatList data={this.state.dataList}
                                                            renderItem={this.renderItem.bind(this)}
                                                            keyExtractor={(item, index) => 'key' + index}/> :
                    <View style={styles.noCouponDateStyle}>
                        <Image style={styles.noDataImageStyle}
                               source={require('../../images/MineImg/icon_noCouponData.png')}/>
                    </View>}

                <LoadingView ref={(view) => {
                    LoadingView.loadingDidCreate(view)
                }}>
                </LoadingView>
            </View>
        )
    }

    // 创建item
    renderItem({item}) {
        //	使用门槛 1:无消费满减  2:有消费满减
        if (item.useType === 2) {
            return (
                <View style={styles.itemCouponBgViewStyle}>
                    <View style={{width: SCREEN_WIDTH, height: Layout.scaleSize(20)}}/>
                    <TouchableOpacity activeOpacity={0.7}
                                      onPress={() => this.goUseBtnClick(item)}>
                        <Image style={styles.couponTopRadiusStyle}
                               source={require("../../images/TakeMealsImg/icon_couponTopRadius.png")}/>

                        <View style={styles.couponInfoBgViewStyle}>
                            <View style={styles.couponInfoLeftCenterViewStyle}>

                                <View>
                                    <View style={styles.couponInfoLeftViewStyle}>
                                        <Text style={{
                                            fontSize: Layout.setSpText(28),
                                            color: '#FF9C43',
                                            marginTop: Layout.scaleSize(20),
                                            marginLeft: Layout.scaleSize(35)
                                        }}>￥</Text>
                                        {/*面值金额*/}
                                        <Text style={{
                                            fontSize: Layout.setSpText(64),
                                            color: '#FF9C43',
                                            fontWeight: 'bold',
                                            marginLeft: Layout.scaleSize(10)
                                        }}>{item.faceValue}</Text>
                                    </View>
                                    <View style={styles.consumptionMoneyStyle}>
                                        <Text style={{
                                            fontSize: Layout.setSpText(24),
                                            color: '#8B8782',
                                        }}>满</Text>
                                        <Text style={{
                                            fontSize: Layout.setSpText(24),
                                            color: '#FF9C43',
                                        }}>{item.consumptionMoney}</Text>
                                        <Text style={{
                                            fontSize: Layout.setSpText(24),
                                            color: '#8B8782',
                                        }}>元可用</Text>
                                    </View>
                                </View>

                                <View style={styles.couponInfoCenterViewStyle}>
                                    {/*标题*/}
                                    <Text style={{
                                        fontSize: Layout.setSpText(30),
                                        fontWeight: 'bold',
                                        color: '#F2D3AB',
                                    }}>{item.name}</Text>
                                    {/*限制*/}
                                    {item.applyType === 1 ? <Text style={{
                                        fontSize: Layout.setSpText(22),
                                        color: '#727272',
                                        marginTop: Layout.scaleSize(36),
                                    }}
                                    >{this.timestampToTime(item.receiveTime) + '-' + this.timestampToTime(item.expireTime)}</Text> :
                                        <Text style={{
                                            fontSize: Layout.setSpText(22),
                                            color: '#8B8782',
                                            marginTop: Layout.scaleSize(36),
                                        }}>{item.applyType === 3 ? "仅限商品" : item.applyType === 2 ? "仅限菜品" : ""}</Text>}

                                    {/*有效期*/}
                                    {item.applyType !== 1 ? <Text
                                        style={{
                                            fontSize: Layout.setSpText(22),
                                            color: '#8B8782',
                                            marginTop: Layout.scaleSize(10),
                                        }}
                                    >{this.timestampToTime(item.receiveTime) + '-' + this.timestampToTime(item.expireTime)}</Text> : null}

                                </View>
                            </View>

                            <View style={styles.couponInfoRightViewStyle}>

                                <Image style={styles.useBtnBtnViewStyle}
                                       source={(item.id == this.state.selectCouponId) ? require("../../images/TakeMealsImg/icon_selectCoupon.png") :
                                           require("../../images/TakeMealsImg/icon_couponNormal.png")
                                       }/>
                            </View>

                        </View>
                        <View style={{height: Layout.scaleSize(10), backgroundColor: '#2F2F30'}}/>
                        <Image style={styles.couponListGapStyle}
                               source={require("../../images/TakeMealsImg/icon_couponListGap.png")}/>

                        <View style={styles.couponLimitViewStyle}>
                            <Text
                                style={styles.bottomTextStyle}>{(item.storeId == '0') ? '不限门店' : '限"' + item.storeName + '"使用'}</Text>
                        </View>
                        <View style={{
                            height: Layout.scaleSize(16),
                            backgroundColor: '#2F2F30',
                            borderBottomLeftRadius: Layout.scaleSize(16),
                            borderBottomRightRadius: Layout.scaleSize(16),
                        }}/>
                    </TouchableOpacity>
                </View>
            )
        } else if (item.useType === 1) {
            return (
                <View style={styles.itemCouponBgViewStyle}>
                    <View style={{width: SCREEN_WIDTH, height: Layout.scaleSize(20)}}/>
                    <TouchableOpacity activeOpacity={0.7}
                                      onPress={() => this.goUseBtnClick(item)}>
                        <Image style={styles.couponTopRadiusStyle}
                               source={require("../../images/TakeMealsImg/icon_couponTopRadius.png")}/>

                        <View style={styles.couponInfoBgViewStyle}>
                            <View style={styles.couponInfoLeftCenterViewStyle}>

                                <View style={styles.couponInfoLeftViewStyle}>
                                    <Text style={{
                                        fontSize: Layout.setSpText(28),
                                        color: '#FF9C43',
                                        marginTop: Layout.scaleSize(20),
                                        marginLeft: Layout.scaleSize(35)
                                    }}>￥</Text>
                                    {/*面值金额*/}
                                    <Text style={{
                                        fontSize: Layout.setSpText(64),
                                        color: '#FF9C43',
                                        fontWeight: 'bold',
                                        marginLeft: Layout.scaleSize(10)
                                    }}>{item.faceValue}</Text>
                                </View>

                                <View style={styles.couponInfoCenterViewStyle}>
                                    {/*标题*/}
                                    <Text style={{
                                        fontSize: Layout.setSpText(30),
                                        fontWeight: 'bold',
                                        color: '#F2D3AB',
                                    }}>{item.name}</Text>
                                    {/*限制*/}
                                    {item.applyType === 1 ? <Text style={{
                                        fontSize: Layout.setSpText(22),
                                        color: '#727272',
                                        marginTop: Layout.scaleSize(36),
                                    }}
                                    >{this.timestampToTime(item.receiveTime) + '-' + this.timestampToTime(item.expireTime)}</Text> :
                                        <Text style={{
                                            fontSize: Layout.setSpText(22),
                                            color: '#8B8782',
                                            marginTop: Layout.scaleSize(36),
                                        }}>{item.applyType === 3 ? "仅限商品" : item.applyType === 2 ? "仅限菜品" : ""}</Text>}

                                    {/*有效期*/}
                                    {item.applyType !== 1 ? <Text
                                        style={{
                                            fontSize: Layout.setSpText(22),
                                            color: '#8B8782',
                                            marginTop: Layout.scaleSize(10),
                                        }}
                                    >{this.timestampToTime(item.receiveTime) + '-' + this.timestampToTime(item.expireTime)}</Text> : null}

                                </View>
                            </View>

                            <View style={styles.couponInfoRightViewStyle}>
                                <Image style={styles.useBtnBtnViewStyle}
                                       source={(item.id == this.state.selectCouponId) ? require("../../images/TakeMealsImg/icon_selectCoupon.png") :
                                           require("../../images/TakeMealsImg/icon_couponNormal.png")
                                       }/>
                            </View>

                        </View>
                        <View style={{height: Layout.scaleSize(10), backgroundColor: '#2F2F30'}}/>
                        <Image style={styles.couponListGapStyle}
                               source={require("../../images/TakeMealsImg/icon_couponListGap.png")}/>

                        <View style={styles.couponLimitViewStyle}>
                            <Text
                                style={styles.bottomTextStyle}>{(item.storeId == '0') ? '不限门店' : '限"' + item.storeName + '"使用'}</Text>
                        </View>
                        <View style={{
                            height: Layout.scaleSize(16),
                            backgroundColor: '#2F2F30',
                            borderBottomLeftRadius: Layout.scaleSize(16),
                            borderBottomRightRadius: Layout.scaleSize(16),
                        }}/>
                    </TouchableOpacity>
                </View>
            )
        }
    }

    // 去使用按钮点击
    goUseBtnClick(data) {
        this.setState({
            couponUseStateImg: require("../../images/TakeMealsImg/icon_selectCoupon.png"),
        });
        const {navigate, goBack, state} = this.props.navigation;
        state.params.callback(data);
        this.props.navigation.goBack();
    }

    // 时间戳转时间
    timestampToTime(timeString) {
        var time = timeString.replace(/-/g, '/');
        var timestamp = new Date(time).getTime();

        var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000

        var date = (date.getFullYear()) + "." +
            (date.getMonth() + 1) + "." +
            (date.getDate());
        return date;
    }

    // 不使用优惠券
    noUseCouponClick() {

        this.setState({
            couponUseStateImg: require("../../images/TakeMealsImg/icon_selectCoupon.png"),
        });
        const {navigate, goBack, state} = this.props.navigation;
        state.params.callback("");
        this.props.navigation.goBack();
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222224',
    },

    topNoUseCouponViewStyle: {
        backgroundColor: '#2F2F30',
        height: 90 * unitWidth,
        marginTop: 15 * unitWidth,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    noCouponDateStyle: {
        alignItems: 'center',
    },
    noDataImageStyle: {
        width: LayoutTool.scaleSize(672),
        height: LayoutTool.scaleSize(735),
        marginTop: LayoutTool.scaleSize(100),
    },
    noDataTextStyle: {
        fontSize: LayoutTool.setSpText(30),//15,
        color: '#a5a5a5',
        marginTop: 40 * unitWidth,
    },

    itemCouponBgViewStyle: {
        width: Layout.scaleSize(670),
        marginLeft: Layout.scaleSize(40),
    },
    couponTopRadiusStyle: {
        width: Layout.scaleSize(670),
        height: Layout.scaleSize(42),
    },
    couponInfoBgViewStyle: {
        backgroundColor: '#2F2F30',
        width: Layout.scaleSize(670),
        marginTop: Layout.scaleSize(-4),
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    couponInfoLeftCenterViewStyle: {
        backgroundColor: '#2F2F30',
        flexDirection: 'row',
    },
    couponInfoLeftViewStyle: {
        backgroundColor: '#2F2F30',
        flexDirection: 'row',
        alignItems: 'center',
        width: Layout.scaleSize(230),
    },
    couponInfoCenterViewStyle: {
        backgroundColor: '#2F2F30',
    },
    couponInfoRightViewStyle: {
        backgroundColor: '#2F2F30',
    },
    couponListGapStyle: {
        width: Layout.scaleSize(670),
        height: Layout.scaleSize(60),
    },
    couponLimitViewStyle: {
        backgroundColor: '#2F2F30',
        width: Layout.scaleSize(670),
    },
    bottomTextStyle: {
        color: '#8B8782',
        fontSize: Layout.setSpText(24),
        marginLeft: Layout.scaleSize(30),
    },
    consumptionMoneyStyle: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Layout.scaleSize(20),
    },
    useBtnBtnViewStyle: {
        width: LayoutTool.scaleSize(42),
        height: LayoutTool.scaleSize(42),
        marginTop: LayoutTool.scaleSize(40),
        marginRight: Layout.scaleSize(30),
    },

});
