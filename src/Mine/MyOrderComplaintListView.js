
// 订单投诉列表

import React from 'react'
import {StyleSheet, View, Text, TouchableOpacity, ScrollView, Image} from 'react-native'

import {SCREEN_WIDTH, STATUSBAR_HEIGHT} from '../../Tools/Layout';
import {unitWidth} from "../../Tools/Layout";

import NetService from "../../Tools/NetService"
import Loading from '../../Tools/Loading';
import ToastView from "../../Tools/ToastHudView";
import LayoutTool from "../../Tools/Layout"

import MyOrderComplaintSubmitView from "./MyOrderComplaintCommintView"  // 订单投诉提交


export default class MyOrderComplaintListView extends React.Component{

    static navigationOptions = ({navigation}) => {
        return {
            title: "订单投诉",
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            dataList: [],

            shopDataList:[],

            menDataList:[],
        }
    }

    componentDidMount(){

        this.getOrderComplaintListNet({"type":1});
    }

    // 获取投诉列表数据
    getOrderComplaintListNet(param){
        Loading.showLoading("数据加载中...");
        var shopDataList = [];
        var menDataList = [];
        NetService.GET("heque-eat/complaint_details/complaint_or_refund_options", param, data=>{
            Loading.dismiss();
            for (let i = 0; i < data.length; i++) {
                var dataModel = data[i];
                // type 1：订单投诉  2：申请售后
                if (dataModel.type == 1) {
                    shopDataList.push(data[i]);
                } else {
                    menDataList.push(data[i]);
                }
            }
            this.setState({
                dataList: data,
                shopDataList: shopDataList,
                menDataList: menDataList,
            });
        }, response=>{
            Loading.dismiss();
            ToastView.showShortHudView(response.message);
        });
    }

    render(){
        return (
            <View style={styles.container}>
                <ScrollView style={styles.container}>
                    <Image style={styles.topHalfImgStyle} source={require("../../images/MineImg/icon_kefuTopHalfImg.png")}/>
                    <View style={styles.topRadiusViewStyle}>
                        <Text style={{
                            fontSize: LayoutTool.setSpText(32),//16,
                            fontWeight: "bold",
                            color: "#A7A39E",
                            marginLeft: LayoutTool.scaleSize(34),
                        }}>投诉商品</Text>
                    </View>

                    {this.setUpShopItemView(this.state.shopDataList)}

                    <View style={styles.bottomRadiusViewStyle}/>

                    <Image style={styles.topHalfImgStyle} source={require("../../images/MineImg/icon_kefuTopHalfImg.png")}/>

                    <View style={styles.topRadiusViewStyle}>
                        <Text style={{
                            fontSize: LayoutTool.setSpText(32),//16,
                            fontWeight: "bold",
                            color: "#A7A39E",
                            marginLeft: LayoutTool.scaleSize(40),
                        }}
                        >投诉快递员</Text>
                    </View>

                    {this.setUpMenItemView(this.state.menDataList)}

                    <View style={styles.bottomRadiusViewStyle}/>

                    <View style={{height: LayoutTool.scaleSize(40)}}/>

                </ScrollView>
                <Loading ref={(view)=>{Loading.loadingDidCreate(view)}}>
                </Loading>
            </View>
        )
    }

    setUpShopItemView(shopDataList) {
        let itemArr = [];
        for (let i = 0; i < shopDataList.length; i++) {
            let data = shopDataList[i];
            itemArr.push(
                <TouchableOpacity style={styles.TouchableOpacityStyle} key={i} activeOpacity={0.7} onPress={() =>this.itemBtnClick(data)}>
                    <View style={styles.itemViewStyle}>
                        <Text style={styles.itemContentStyle}>{data.content}</Text>
                        <Image style={styles.itemImgStyle} source={require("../../images/MineImg/icon_right.png")}/>
                    </View>

                    {(i === (shopDataList.length-1))?null:<View style={styles.lineStyle}>
                        <View style={styles.lineStyle}/>
                    </View>}

                </TouchableOpacity>
            );
        }
        return itemArr;
    }

    // 创建投诉快递员的item
    setUpMenItemView(menDataList) {
        let itemArr = [];
        for (let i = 0; i < menDataList.length; i++) {
            let data = menDataList[i];
            itemArr.push(
                <TouchableOpacity style={styles.TouchableOpacityStyle} key={i} activeOpacity={0.7} onPress={() =>this.itemBtnClick(data)}>
                    <View style={styles.itemViewStyle}>
                        <Text style={styles.itemContentStyle}>{data.content}</Text>
                        <Image style={styles.itemImgStyle} source={require("../../images/MineImg/icon_right.png")}/>
                    </View>

                    {(i === (menDataList.length-1))?null:<View style={styles.lineStyle}>
                        <View style={styles.lineStyle}/>
                    </View>}

                </TouchableOpacity>
            );
        }
        return itemArr;
    }


    itemBtnClick(data) {
        this.props.navigation.push('MyOrderComplaintSubmitView', {"data":data, "dataList":this.state.dataList});
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222224',
    },

    topHalfImgStyle: {
        marginLeft: LayoutTool.scaleSize(40),
        marginTop: LayoutTool.scaleSize(20),
        width: LayoutTool.scaleSize(670),
        height: LayoutTool.scaleSize(37),
    },
    topRadiusViewStyle: {
        backgroundColor:"#2F2F30",
        marginLeft: LayoutTool.scaleSize(40),
        width: LayoutTool.scaleSize(670),
    },

    itemViewStyle: {
        backgroundColor:"#2F2F30",
        height: LayoutTool.scaleSize(120),
        width: LayoutTool.scaleSize(670),
        flexDirection: 'row',
        justifyContent:'space-between',
        alignItems: 'center',
    },

    itemContentStyle: {
        fontSize: LayoutTool.setSpText(30),//15,
        color: "#F2D3AB",
        marginLeft: LayoutTool.scaleSize(40),
    },
    itemImgStyle: {
        width: LayoutTool.scaleSize(15),
        height: LayoutTool.scaleSize(24),
        marginRight: LayoutTool.scaleSize(44),
    },

    TouchableOpacityStyle: {
        backgroundColor: "#2F2F30",
        width: LayoutTool.scaleSize(670),
        marginLeft: LayoutTool.scaleSize(40),
        marginRight: LayoutTool.scaleSize(40),
    },
    lineStyle: {
        backgroundColor: "#39393B",
        height: LayoutTool.scaleSize(1),
        marginLeft: LayoutTool.scaleSize(40),
        marginRight: LayoutTool.scaleSize(30),
    },

    bottomRadiusViewStyle: {
        backgroundColor:"#2F2F30",
        width:LayoutTool.scaleSize(670),
        height: LayoutTool.scaleSize(16),
        marginLeft: LayoutTool.scaleSize(40),
        borderBottomLeftRadius: LayoutTool.scaleSize(16),
        borderBottomRightRadius: LayoutTool.scaleSize(16),
    },

});
