

// 门店列表(地图模式)
import React from 'react'
import {StyleSheet, View, Text, TouchableOpacity, Image, DeviceEventEmitter, SectionList} from 'react-native'

import {SCREEN_WIDTH, unitWidth} from '../../Tools/Layout';
import LayoutTool from "../../Tools/Layout";

import NetService from "../../Tools/NetService";


// 一些常量设置
const cols = 3;
const itemW = LayoutTool.scaleSize(210);//(SCREEN_WIDTH)/cols;//150*unitWidth;
const vMargin = (SCREEN_WIDTH - itemW * cols) / (cols + 1);
const hMargin = LayoutTool.scaleSize(14);//20*unitWidth;

export default class CitySelectView extends React.Component{

    static navigationOptions = ({navigation}) => {
        return {
            title: "选择城市",
        };
    };

    constructor(props) {
        super(props);
        this.state = {

            pushTag: 0,         // 从哪个界面进入标签 1:首页进入  2:取餐列表进入

            cityName: "",

            dataList: [],       // 门店列表数据

            locationTag: require('../../images/HomeImg/icon_loactionCityTag.png'),  // 定位图标路径
        }
    };

    componentDidMount(){
        const { params } = this.props.navigation.state;
        this.setState({
            pushTag: params.pushTag,
        });

        // 获取城市
        this.getCityListNet();

        if (global.locationCityName) {
            this.setState({
                locationTag: require('../../images/HomeImg/icon_loactionCityTag.png'),
            });
        } else {
            this.setState({
                locationTag: require('../../images/HomeImg/icon_loactionCityGrayTag.png'),
            });
        }
    };
    // 获取取餐点列表
    getCityListNet(param){
        // 旧接口：heque-eat/city/get_city_list
        NetService.GET("heque-eat/city/getRegionCities", param, data=>{
            this.setState({
                dataList: data,
            });
        });
    }

    render(){
        let sections = this.state.dataList;
        return (
            <View style={styles.container}>
                <SectionList

                    contentContainerStyle={styles.listViewStyle}
                    ListHeaderComponent={() =>
                        <View style={styles.headBgViewStyle}>
                            <Text style={{
                                    fontSize: LayoutTool.setSpText(26),
                                    color: '#8B8782',
                                    marginTop: LayoutTool.scaleSize(30),
                            }}>当前定位城市</Text>

                            <View style={styles.cityNameViewStyle}>
                                <Image style={{
                                            width: LayoutTool.scaleSize(30),
                                            height: LayoutTool.scaleSize(37),
                                }} source={this.state.locationTag}/>
                                <Text style={{
                                        fontWeight: 'bold',
                                        fontSize: LayoutTool.setSpText(32),
                                        color: '#F2D3AB',
                                        marginLeft: LayoutTool.scaleSize(10),
                                }}>{global.locationCityName?global.locationCityName:"定位失败"}</Text>
                            </View>

                            <Text style={{
                                fontSize: LayoutTool.setSpText(26),
                                color: '#8B8782',
                                marginTop: LayoutTool.scaleSize(30),
                            }}>当前支持其他城市</Text>
                        </View>
                    }
                    renderSectionHeader={this._renderSectionHeader}
                    renderItem={({item, index, section}) =>
                        this._renderItem(item, index, section)
                    }
                    sections={sections}

                    keyExtractor={(item, index) => item + index}
                />

            </View>
        )
    }
    _renderSectionHeader = ({section}) => {
        return(
            <View style={styles.sectionViewStyle}>
                <Text style={styles.sectionTitleStyle}>{section.name}</Text>
            </View>
        )
    };

    // 创建列表item
    _renderItem(item, index, section) {
        let cityName = "";
        if (item.name.length > 5) {
            cityName = item.name.substring(0,5) + "...";
        } else {
            cityName = item.name;
        }

        return(
            <TouchableOpacity key={index} style={styles.itemStyle} activeOpacity={0.7} onPress={()=>this.itemClick(item)}>
                <Text
                    numberOfLines={1}
                    style={{
                        fontSize: LayoutTool.setSpText(26),
                        color: "#F2D3AB",
                }}>{cityName}</Text>
            </TouchableOpacity>
        )
    }

    // 去点餐按钮点击
    itemClick(data) {
        // 发送事件
        if (this.state.pushTag === 1) { // 发送到首页
            DeviceEventEmitter.emit('citySelectNotification', data);
        } else if (this.state.pushTag === 2) { // 发送到取餐点列表
            DeviceEventEmitter.emit('citySelectStoreMapListNotification', data);
        }

        this.props.navigation.pop();
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222224',
    },

    listViewStyle: {
        flexDirection:'row', // 一行显示不下,换一行
        flexWrap:'wrap', // 侧轴方向
        alignItems:'center', // 必须设置,否则换行不起作用
    },

    headBgViewStyle: {
        width: SCREEN_WIDTH-LayoutTool.scaleSize(35),
        height: LayoutTool.scaleSize(232),
        marginLeft:LayoutTool.scaleSize(35),
    },
    cityNameViewStyle: {
        height: LayoutTool.scaleSize(100),
        flexDirection: 'row',
        alignItems: 'center',
    },

    sectionViewStyle: {
        width: SCREEN_WIDTH,//-LayoutTool.scaleSize(35),
        height: LayoutTool.scaleSize(80),
        justifyContent:'center',
        marginLeft:LayoutTool.scaleSize(35),
    },
    sectionTitleStyle: {
        fontSize: LayoutTool.setSpText(30),
        color: '#FF9C43',
        fontWeight: 'bold',
        marginTop: LayoutTool.scaleSize(10),
    },

    itemStyle: {
        width:itemW,
        height: LayoutTool.scaleSize(54),
        justifyContent: 'center',
        alignItems:'center',
        borderRadius: 6*unitWidth,
        marginBottom: hMargin,
        backgroundColor: '#2F2F30',
        marginLeft: vMargin,
    },

});
