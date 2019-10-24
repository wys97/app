
// 取餐点详情

import React from 'react'
import {StyleSheet, View, Text, TouchableOpacity, Image, ScrollView} from 'react-native'

import SwView from 'react-native-swiper';

import {SCREEN_WIDTH, unitWidth} from '../../Tools/Layout';
import LayoutTool from "../../Tools/Layout";
import NetService from "../../Tools/NetService";

import StoreMapInfoDetailView from "./StoreMapInfoDetailView"


export default class StoreDetailsInfoView extends React.Component{

    static navigationOptions = ({navigation}) => {
        return {
            title: "用餐点信息",
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            storeData: "",      // 门店数据模型

            imgArray: [],       // 取餐点介绍图片数组

            storeSurplusShareNumber: "0",   // 门店菜品库存数量
        }
    };
    componentDidMount(){
        const { params } = this.props.navigation.state;
        this.setState({
            storeData: params.storeData,
        });
        // 获取取餐点介绍图片
        this.getStoreAddressImgNet({"storeImg":params.storeData.storeImg});

        this.getStoreStockNumNet({"id": params.storeData.id})
    };
    // 获取取餐点介绍图片
    getStoreAddressImgNet(param) {
        NetService.GET("heque-eat/eat/take_meal_img", param, data => {
            this.setState({
                imgArray: data,
            });
        });
    }

    // 获取取餐点库存数据
    getStoreStockNumNet(param) {
        NetService.GET("heque-eat/eat/take_meals_info", param, data=>{
            this.setState({
                storeSurplusShareNumber: data.storeSurplusShareNumber,
            });
        });
    }

    render(){

        let data = this.state.storeData;

        let foodTime1 = "";
        let foodTime2 = "";
        let foodTime3 = "";
        let foodTime4 = "";
        let timeArray = [];
        if (this.state.storeData.foodTime1) {
            foodTime1 = this.state.storeData.foodTime1.slice(0, 5) + "-" + this.state.storeData.foodTime1.slice(11, 16);
            timeArray.push(foodTime1);
        }
        if (this.state.storeData.foodTime2) {
            foodTime2 = this.state.storeData.foodTime2.slice(0, 5) + "-" + this.state.storeData.foodTime2.slice(11, 16);
            timeArray.push(foodTime2);
        }
        if (this.state.storeData.foodTime3) {
            foodTime3 = this.state.storeData.foodTime3.slice(0, 5) + "-" + this.state.storeData.foodTime3.slice(11, 16);
            timeArray.push(foodTime3);
        }
        if (this.state.storeData.foodTime4) {
            foodTime4 = this.state.storeData.foodTime4.slice(0, 5) + "-" + this.state.storeData.foodTime4.slice(11, 16);
            timeArray.push(foodTime4);
        }

        return (
            <ScrollView style={styles.container}>
                <SwView style={styles.bannerStyle}
                        horizontal={true}
                        autoplay={true}
                        showsPagination={false}
                        loop={true}
                        removeClippedSubviews={false}
                >
                    {this.state.imgArray.map((item, index) => {
                        return (<Image style={styles.bannerImageStyle} key = {index} source={{uri: item}}/>)
                    })}
                    {/*<Image style={styles.bannerImageStyle} source={{uri:"https://heque-base-dev.oss-cn-shenzhen.aliyuncs.com/group2/718c38e1337f40a4bc82d7cd7f0cce4c.jpg"}}/>*/}
                    {/*<Image style={styles.bannerImageStyle} source={{uri:"https://heque-base-dev.oss-cn-shenzhen.aliyuncs.com/group2/6d54f035845d427c80251d1d88dc42d8.jpg"}}/>*/}
                    {/*<Image style={styles.bannerImageStyle} source={{uri:"https://heque-base-dev.oss-cn-shenzhen.aliyuncs.com/group2/c63ffc6f57f94f8e90e18bca3628c598.jpg"}}/>*/}
                    {/*<Image style={styles.bannerImageStyle} source={{uri:"https://heque-base-dev.oss-cn-shenzhen.aliyuncs.com/group2/627b5e4fcaa04e45bdf7a8f6401c6f94.jpg"}}/>*/}
                </SwView>

                <View style={styles.itemViewStyle}>
                    <Text style={styles.itemTitleStyle}>取餐点名称</Text>
                    <Text style={styles.itemBriefStyle}>{this.state.storeData.name}</Text>

                    <View style={styles.lineViewStyle}/>
                </View>

                <View style={{  width: SCREEN_WIDTH,
                                flexDirection: 'row',
                                justifyContent:'space-between',}}>
                    <Text style={{
                        fontSize: LayoutTool.setSpText(28),
                        color: "#8B8782",
                        marginLeft: LayoutTool.scaleSize(35),
                        marginTop: LayoutTool.scaleSize(30),
                    }}>取餐点地址</Text>

                    <Text style={{
                        fontSize: LayoutTool.setSpText(28),
                        color: "#F2D3AB",
                        marginRight: 35*unitWidth,
                        textAlign: 'right',
                        width: LayoutTool.scaleSize(480),
                        marginTop: LayoutTool.scaleSize(30),
                    }}>{data.adds}</Text>
                </View>

                <View style={{
                                backgroundColor: '#323234',
                                marginLeft: LayoutTool.scaleSize(36),
                                marginRight: LayoutTool.scaleSize(36),
                                width: SCREEN_WIDTH-LayoutTool.scaleSize(72),
                                height: LayoutTool.scaleSize(1),
                                marginTop: LayoutTool.scaleSize(30),
                }}/>

                <View style={{  width: SCREEN_WIDTH,
                    flexDirection: 'row',
                    justifyContent:'space-between',}}>
                    <Text style={{
                        fontSize: LayoutTool.setSpText(28),
                        color: "#8B8782",
                        marginLeft: LayoutTool.scaleSize(35),
                        marginTop: LayoutTool.scaleSize(30),
                    }}>供餐时间</Text>

                    <Text style={{
                        fontSize: LayoutTool.setSpText(28),
                        color: "#F2D3AB",
                        marginRight: 35*unitWidth,
                        textAlign: 'right',
                        width: LayoutTool.scaleSize(480),
                        marginTop: LayoutTool.scaleSize(30),
                    }}>{timeArray.join('/')}</Text>
                </View>

                <View style={{
                    backgroundColor: '#323234',
                    marginLeft: LayoutTool.scaleSize(36),
                    marginRight: LayoutTool.scaleSize(36),
                    width: SCREEN_WIDTH-LayoutTool.scaleSize(72),
                    height: LayoutTool.scaleSize(1),
                    marginTop: LayoutTool.scaleSize(30),
                }}/>

                <TouchableOpacity activeOpacity={0.7} onPress={()=>this.DHBtnClick()}>
                    <Image style={styles.btnStyle} source={require("../../images/HomeImg/icon_btnDaoHangGoImg.png")}/>
                </TouchableOpacity>

            </ScrollView>
        )
    }

    DHBtnClick() {
        this.props.navigation.push('StoreMapInfoDetailView', {"storeData":this.state.storeData});
    }
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222224',
    },
    bannerStyle: {
        height: LayoutTool.scaleSize(470),
        backgroundColor: '#222224',
    },
    bannerImageStyle: {
        width: SCREEN_WIDTH,
        height: LayoutTool.scaleSize(470),
    },

    itemViewStyle: {
        width: SCREEN_WIDTH,
        height: LayoutTool.scaleSize(99),
        alignItems:'center',
        flexDirection: 'row',
        justifyContent:'space-between',
    },
    itemTitleStyle: {
        fontSize: LayoutTool.setSpText(28),
        color: "#8B8782",
        marginLeft: LayoutTool.scaleSize(35),
    },
    itemBriefStyle: {
        fontSize: LayoutTool.setSpText(28),
        color: "#F2D3AB",
        marginRight: LayoutTool.scaleSize(35),
        textAlign: 'right',
    },

    lineViewStyle: {
        position: 'absolute',
        backgroundColor: '#323234',
        marginLeft: LayoutTool.scaleSize(36),
        marginRight: LayoutTool.scaleSize(36),
        width: SCREEN_WIDTH-LayoutTool.scaleSize(72),
        height: LayoutTool.scaleSize(1),
        bottom: 0,
    },

    btnStyle: {
        width: LayoutTool.scaleSize(660),
        height: LayoutTool.scaleSize(84),
        marginTop: LayoutTool.scaleSize(130),
        marginLeft: (SCREEN_WIDTH-LayoutTool.scaleSize(660))/2,
    },

});
