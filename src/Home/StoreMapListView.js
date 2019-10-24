// 门店列表(地图模式)
import React from 'react'
import {StyleSheet, View, Text, TouchableOpacity, Image, DeviceEventEmitter, FlatList} from 'react-native'

import {SCREEN_WIDTH, unitWidth} from '../../Tools/Layout';
import LayoutTool from "../../Tools/Layout";

import {MapView} from 'react-native-amap3d'
// import MapView from 'react-native-amap3d'
import NetService from "../../Tools/NetService";
import Loading from "../../Tools/Loading";
import ToastView from "../../Tools/ToastHudView"

import StoreDetailsInfoView from "./StoreDetailsInfoView"       // 用餐点信息
import CitySelectView from "./CitySelectView"                   // 城市选择


export default class StoreMapListView extends React.Component {

    static navigationOptions = ({navigation}) => {
        return {
            title: "选择取餐点",
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            cityName: "",       // 城市名称
            cityCode: "",       // 城市编号

            dataList: [],       // 门店列表数据
            storeData: {
                longitude: 113.932544,
                latitude: 22.541566,
            },      // 选中的门店数据模型

            selectCityData: "",
        }
    };

    componentDidMount() {
        this.setState({
            cityName: global.city,
            cityCode: global.cityCode,
        });

        let that = this;
        // 接受选择城市的通知
        this.listener = DeviceEventEmitter.addListener('citySelectStoreMapListNotification', function (data) {
            that.setState({
                cityName: data.name,
                selectCityData: data,
            });

            // 获取取餐点列表
            that.getStoreListNet({"cityCode": data.codeC, "longitude": lon, "latitude": lat});
        });

        // 获取取餐点列表
        this.getStoreListNet({"cityCode": cityCode, "longitude": lon, "latitude": lat});
    };

    // 获取取餐点列表
    getStoreListNet(param) {
        // 初始化一个数组
        let storeArray = [];
        let stateTrueArray = [];
        let stateFalseArray = [];
        Loading.showLoading();
        NetService.POST("heque-eat/eat/storeList", param, data => {
            Loading.dismiss();
            this.setState({
                storeData: {
                    longitude: 113.932544,
                    latitude: 22.541566,
                },
            });
            // 按照距离升序排序
            data.sort(function (a, b) {
                return (a.number - b.number)
            });
            // state  false:非营业  true:营业中
            for (let i = 0; i < data.length; i++) {
                let tempData = data[i];
                // 营业中
                if (tempData.state == true) {
                    stateTrueArray.push(tempData);
                } else { // 非营业中
                    stateFalseArray.push(tempData);
                }
            }
            storeArray = stateTrueArray.concat(stateFalseArray);

            let storeData = {};
            if (storeArray.length > 0) {
                storeData = storeArray[0];
            }
            this.setState({
                dataList: storeArray,
                storeData: storeData,
            });
            if (data.length == 0) {
                ToastView.showShortHudView('暂无符合条件的取餐点');
            }
            Loading.dismiss();
            // feeType  1- 点餐模式 2-自助模式

        }, response => {
            Loading.dismiss();
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.headBgViewStyle}>
                    {/*城市*/}
                    <TouchableOpacity activeOpacity={1} onPress={() => this.cityNameClick()}>
                        <View style={styles.cityViewStyle}>
                            <Text style={{
                                fontSize: LayoutTool.setSpText(36),
                                color: "#F2D3AB",
                                marginLeft: LayoutTool.scaleSize(35),
                            }}>{this.state.cityName}</Text>
                            <Image style={{
                                width: LayoutTool.scaleSize(15),
                                height: LayoutTool.scaleSize(24),
                                marginLeft: LayoutTool.scaleSize(20),
                            }} source={require("../../images/MineImg/icon_right.png")}/>
                        </View>
                    </TouchableOpacity>

                    {(this.state.dataList.length > 0)?<MapView style={styles.mapViewStyle}
                                                               coordinate={{
                                                                   latitude: this.state.storeData.latitude,
                                                                   longitude: this.state.storeData.longitude,
                                                               }}
                                                               showsCompass={false}
                                                               zoomLevel={17}

                                                        >
                                                            {this.setUpMarker(this.state.dataList)}
                                                        </MapView>:null}
                </View>

                <FlatList data={this.state.dataList}

                          renderItem={this.renderItem.bind(this)}

                          keyExtractor={(item, index) => 'key' + index}
                />

                <Loading ref={(view) => {
                    Loading.loadingDidCreate(view)
                }}>
                </Loading>
            </View>
        )
    }

    // 创建地图Marker点
    setUpMarker(dataList) {
        let itemArr = [];
        for (let i = 0; i < dataList.length; i++) {
            let data = dataList[i];
            if (this.state.storeData.latitude == data.latitude && this.state.storeData.longitude == data.longitude) {
                itemArr.push(
                    <MapView.Marker
                        key={i}
                        active={true}
                        title={this.state.storeData.name}
                        image='icon_map_tag_sele'
                        coordinate={{
                            latitude: this.state.storeData.latitude,
                            longitude: this.state.storeData.longitude,
                        }}
                    />
                );
            } else {
                itemArr.push(
                    <MapView.Marker
                        key={i}
                        active={false}
                        title={''}
                        image='icon_map_tag_normal'
                        coordinate={{
                            latitude: data.latitude,
                            longitude: data.longitude,
                        }}
                        onPress={({nativeEvent}) =>
                            this.itemClick(data)
                        }
                    />
                );
            }

        }
        return itemArr;
    }

    // 创建列表item
    renderItem({item, index}) {
        let distance = "";
        if (item.number > 1000) {
            distance = item.number / 1000;
            distance = distance.toFixed(2) + 'km';
        } else {
            distance = item.number + 'm';
        }

        let nameTextStyle = "";
        let width = "";
        // provideStyle 1:堂食    2:外带
        if (index === 0) {
            if (item.name.length > 13) {
                width = LayoutTool.scaleSize(420);
                nameTextStyle = {
                    fontSize: LayoutTool.setSpText(34),
                    fontWeight: 'bold',
                    color: '#F2D3AB',
                    marginLeft: LayoutTool.scaleSize(35),
                    marginTop: LayoutTool.scaleSize(25),
                    width: width,
                };
            } else {
                nameTextStyle = {
                    fontSize: LayoutTool.setSpText(34),
                    fontWeight: 'bold',
                    color: '#F2D3AB',
                    marginLeft: LayoutTool.scaleSize(35),
                    marginTop: LayoutTool.scaleSize(25),
                };
            }
        } else {
            nameTextStyle = {
                fontSize: LayoutTool.setSpText(34),
                fontWeight: 'bold',
                color: '#F2D3AB',
                marginLeft: LayoutTool.scaleSize(35),
                marginTop: LayoutTool.scaleSize(25),
            };
        }
        let foodTime1 = "";
        let foodTime2 = "";
        let foodTime3 = "";
        let foodTime4 = "";
        let timeArray = [];
        if (item.foodTime1) {
            foodTime1 = item.foodTime1.slice(0, 5) + "-" + item.foodTime1.slice(11, 16);
            timeArray.push(foodTime1);
        }
        if (item.foodTime2) {
            foodTime2 = item.foodTime2.slice(0, 5) + "-" + item.foodTime2.slice(11, 16);
            timeArray.push(foodTime2);
        }
        if (item.foodTime3) {
            foodTime3 = item.foodTime3.slice(0, 5) + "-" + item.foodTime3.slice(11, 16);
            timeArray.push(foodTime3);
        }
        if (item.foodTime4) {
            foodTime4 = item.foodTime4.slice(0, 5) + "-" + item.foodTime4.slice(11, 16);
            timeArray.push(foodTime4);
        }

        return (
            <TouchableOpacity activeOpacity={0.7} onPress={() => this.itemClick(item)}>
                <View style={styles.itemBgViewStyle}>
                    <View style={styles.bgViewStyle}>
                        <View style={styles.leftViewStyle}>
                            <View style={styles.titleNameViewStyle}>
                                <Text style={nameTextStyle}>{item.name}</Text>
                                {(index === 0) ? <Image style={styles.zjStyle}
                                                        source={require("../../images/HomeImg/icon_zjTag.png")}/> : null}
                            </View>
                            <Text style={styles.distanceNumTextStyle}>{distance}</Text>
                            <Text style={styles.addressStyle}>{item.adds}</Text>

                            <Text style={styles.timeTextStyle}>{(timeArray.length > 2)?"供餐时间：":"供餐时间：" + timeArray.join('/')}</Text>
                        </View>

                        <View style={styles.rightViewStyle}>
                            {item.state ?
                                <TouchableOpacity activeOpacity={0.7} onPress={() => this.goOrderBtnClick(item)}>

                                    <Image style={{
                                            width: LayoutTool.scaleSize(140),
                                            height: LayoutTool.scaleSize(55),
                                            marginTop: LayoutTool.scaleSize(45),
                                    }} source={require("../../images/HomeImg/icon_storeListGoDianCan.png")}/>

                                </TouchableOpacity> : <Image style={{
                                                            width: LayoutTool.scaleSize(140),
                                                            height: LayoutTool.scaleSize(55),
                                                            marginTop: LayoutTool.scaleSize(45),
                                }} source={require("../../images/HomeImg/icon_storeListRest.png")}/>
                            }
                            <TouchableOpacity activeOpacity={0.7} onPress={() => this.moreBtnClick(item)}>
                                <View style={styles.detailViewStyle}>
                                    <Text style={styles.moreDetailTextStyle}>更多详情</Text>
                                    <Image style={{
                                        width: LayoutTool.scaleSize(13),
                                        height: LayoutTool.scaleSize(22),
                                        marginLeft: LayoutTool.scaleSize(12),
                                    }}
                                           source={require("../../images/MineImg/icon_right.png")}
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {(timeArray.length > 2)?<Text style={styles.moreTimeTextStyle}>{timeArray.join('/')}</Text>:null}

                    <View style={styles.lineViewStyle}/>
                </View>
            </TouchableOpacity>
        )
    }

    // item点击
    itemClick(item) {
        this.setState({
            storeData: item,
        });
    }

    // 城市按钮
    cityNameClick() {
        this.props.navigation.push('CitySelectView', {"pushTag": 2});
    }

    // 去点餐按钮点击
    goOrderBtnClick(data) {
        global.city = this.state.cityName;
        if (this.state.selectCityData) {
            global.cityCode = this.state.selectCityData.codeC;
            DeviceEventEmitter.emit('goOrderHomeNotification', this.state.cityName, this.state.selectCityData.codeC);
        }
        // 发送事件
        DeviceEventEmitter.emit('goOrderNotification', data);

        this.props.navigation.pop();
    }

    // 更多详情
    moreBtnClick(data) {
        this.props.navigation.push('StoreDetailsInfoView', {"storeData": data});
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222224',
    },

    headBgViewStyle: {
        backgroundColor: '#222224',
        width: SCREEN_WIDTH,
        height: LayoutTool.scaleSize(515),
    },
    cityViewStyle: {
        height: LayoutTool.scaleSize(100),
        flexDirection: 'row',
        alignItems: 'center',
    },
    mapViewStyle: {
        marginLeft: 20 * unitWidth,
        width: SCREEN_WIDTH - 40 * unitWidth,
        height: 400 * unitWidth,
        borderRadius: 10 * unitWidth,
    },

    itemBgViewStyle: {
        width: SCREEN_WIDTH,
        backgroundColor: '#222224',
    },
    bgViewStyle: {
        width: SCREEN_WIDTH,
        backgroundColor: '#222224',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    leftViewStyle: {
        width: SCREEN_WIDTH - LayoutTool.scaleSize(200),
        backgroundColor: '#222224',
    },
    titleNameViewStyle: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    zjStyle: {
        width: LayoutTool.scaleSize(61),
        height: LayoutTool.scaleSize(32),
        marginLeft: LayoutTool.scaleSize(10),
        marginTop: LayoutTool.scaleSize(25),
    },
    tsStyle: {
        width: LayoutTool.scaleSize(89),
        height: LayoutTool.scaleSize(32),
        marginLeft: LayoutTool.scaleSize(10),
        marginTop: LayoutTool.scaleSize(25),
    },
    distanceNumTextStyle: {
        fontSize: LayoutTool.setSpText(28),
        color: '#FF9C43',
        marginLeft: LayoutTool.scaleSize(35),
        marginTop: LayoutTool.scaleSize(10),
    },
    addressStyle: {
        fontSize: LayoutTool.setSpText(24),
        color: '#8B8782',
        marginLeft: LayoutTool.scaleSize(35),
        marginRight: LayoutTool.scaleSize(5),
        marginTop: LayoutTool.scaleSize(14),
    },
    timeTextStyle: {
        fontSize: LayoutTool.setSpText(24),
        color: '#8B8782',
        marginLeft: LayoutTool.scaleSize(35),
        marginTop: LayoutTool.scaleSize(14),
    },
    lineViewStyle: {
        // position: 'absolute',
        backgroundColor: '#303030',
        marginLeft: LayoutTool.scaleSize(40),
        marginRight: LayoutTool.scaleSize(40),
        marginTop: LayoutTool.scaleSize(30),
        width: SCREEN_WIDTH - LayoutTool.scaleSize(80),
        height: LayoutTool.scaleSize(1),
        bottom: 0,
    },

    rightViewStyle: {
        width: LayoutTool.scaleSize(200),
        backgroundColor: '#222224',
    },

    detailViewStyle: {
        height: 50 * unitWidth,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 35 * unitWidth,
        marginTop: LayoutTool.scaleSize(50),
    },
    moreDetailTextStyle: {
        fontSize: LayoutTool.setSpText(24),
        color: '#727272',
    },

    moreTimeTextStyle: {
        fontSize: LayoutTool.setSpText(24),
        color: '#727272',
        marginLeft: LayoutTool.scaleSize(35),
    },

});
