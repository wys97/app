// 我的优惠券列表


import React from 'react'
import {
    StyleSheet,
    View,
    Text,
    DeviceEventEmitter,
    TouchableOpacity,
    Image,
    FlatList,
    ImageBackground
} from 'react-native'

import {unitWidth} from "../../Tools/Layout";
import {SCREEN_WIDTH, STATUSBAR_HEIGHT} from '../../Tools/Layout';
import ToastView from "../../Tools/ToastHudView";
import NetService from '../../Tools/NetService';

import Loading from '../../Tools/Loading';
import Layout from "../../Tools/Layout";


export default class MyCouponList extends React.Component {

    static navigationOptions = ({navigation}) => {
        return {
            title: "我的优惠券",
        }
    };

    componentDidMount() {

        // 获取我的优惠券列表数据
        this.getMyCouponListDataNet({"userId": userId});
    }

    // 构造
    constructor(props) {
        super(props);
        // 初始状态
        this.state = {
            dataList: [],   // 存放我的优惠券列表数组
        };
    }

    render() {
        return (
            <View style={styles.container}>
                {this.state.dataList.length > 0 ? <FlatList data={this.state.dataList}
                                                            renderItem={this.renderItem.bind(this)}
                                                            keyExtractor={(item, index) => 'key' + index}
                                                            showsVerticalScrollIndicator={false}/> :
                    <View style={styles.noCouponDateStyle}>
                        <Image style={styles.noDataImageStyle}
                               source={require('../../images/MineImg/icon_noCouponData.png')}/>
                    </View>}


                <Loading ref={(view) => {
                    Loading.loadingDidCreate(view)
                }}>
                </Loading>
            </View>
        )
    }

    renderItem({item}) {
        //	使用门槛 1:无消费满减  2:有消费满减
        if (item.useType === 2) {
            return (

                <View style={styles.itemCouponBgViewStyle}>
                    <View style={{height: Layout.scaleSize(20)}}/>
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
                            <TouchableOpacity activeOpacity={0.7}
                                              onPress={() => this.goUseBtnClick(item.id)}>
                                <Image style={styles.useBtnBtnViewStyle}
                                       source={require("../../images/MineImg/icon_goUseCoupon.png")}/>
                            </TouchableOpacity>

                        </View>

                    </View>
                    <View style={{height: Layout.scaleSize(10), backgroundColor: '#2F2F30'}}/>
                    <Image style={styles.couponListGapStyle}
                           source={require("../../images/TakeMealsImg/icon_couponListGap.png")}/>

                    <View style={styles.couponLimitViewStyle}>
                        <Text
                            style={styles.bottomTextStyle}>{item.storeInfoName ? '限"' + item.storeName + '"使用' : '不限门店'}</Text>
                    </View>
                    <View style={{
                        height: Layout.scaleSize(16),
                        backgroundColor: '#2F2F30',
                        borderBottomLeftRadius: Layout.scaleSize(16),
                        borderBottomRightRadius: Layout.scaleSize(16),
                    }}/>
                </View>
            )
        } else if (item.useType === 1) {
            return (
                <View style={styles.itemCouponBgViewStyle}>
                    <View style={{height: Layout.scaleSize(20)}}/>
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
                            <TouchableOpacity activeOpacity={0.7}
                                              onPress={() => this.goUseBtnClick(item.id)}>
                                <Image style={styles.useBtnBtnViewStyle}
                                       source={require("../../images/MineImg/icon_goUseCoupon.png")}/>
                            </TouchableOpacity>

                        </View>

                    </View>
                    <View style={{height: Layout.scaleSize(10), backgroundColor: '#2F2F30'}}/>
                    <Image style={styles.couponListGapStyle}
                           source={require("../../images/TakeMealsImg/icon_couponListGap.png")}/>

                    <View style={styles.couponLimitViewStyle}>
                        <Text
                            style={styles.bottomTextStyle}>{item.storeInfoName ? '限"' + item.storeName + '"使用' : '不限门店'}</Text>
                    </View>
                    <View style={{
                        height: Layout.scaleSize(16),
                        backgroundColor: '#2F2F30',
                        borderBottomLeftRadius: Layout.scaleSize(16),
                        borderBottomRightRadius: Layout.scaleSize(16),
                    }}/>
                </View>
            )
        }
    }

    // 去使用按钮点击
    goUseBtnClick(id) {
        const {navigate, goBack, state} = this.props.navigation;
        state.params.callback(id);
        this.props.navigation.goBack();
    }

    // 获取我的优惠券列表数据
    getMyCouponListDataNet(param) {
        Loading.showLoading("数据加载中...");
        NetService.GET('heque-coupon/discount_coupon/get_discount_coupon', param, data => {
            Loading.dismiss();
            console.log(data);
            this.setState({
                dataList: data,
            });

        }, response => {
            Loading.dismiss();
            if (response.code === NetService.Token_Lose) {
                // 返回堆栈中的第一个页面
                this.props.navigation.popToTop();
            }
            ToastView.showShortHudView(response.message);
        })
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

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222224',
    },

    noCouponDateStyle: {
        alignItems: 'center',
    },
    noDataImageStyle: {
        width: Layout.scaleSize(672),
        height: Layout.scaleSize(735),
        marginTop: Layout.scaleSize(100),
    },
    noDataTextStyle: {
        fontSize: Layout.setSpText(30),
        color: '#a5a5a5',
        marginTop: 40 * unitWidth,
    },

    itemCouponBgViewStyle: {
        width: Layout.scaleSize(670),
        marginLeft: (SCREEN_WIDTH - Layout.scaleSize(670)) * 0.5,
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
    useBtnBtnViewStyle: {
        width: Layout.scaleSize(130),
        height: Layout.scaleSize(59),
        marginRight: Layout.scaleSize(30),
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

});
