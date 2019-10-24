
// 取餐点详情

import React from 'react'
import {StyleSheet, View, Text, TouchableOpacity, Image, Alert} from 'react-native'

import MapView from 'react-native-amap3d'

import {SCREEN_HEIGHT, SCREEN_WIDTH, STATUSBAR_HEIGHT, unitWidth, SOFT_MENU_BAR_HEIGHT} from '../../Tools/Layout';
import LayoutTool from "../../Tools/Layout";
import MapUntil from "../../Tools/MapUntil";


export default class StoreMapInfoDetailView extends React.Component{

    static navigationOptions = ({navigation}) => {
        return {
            title: "",
            header: null,
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            storeData: {
                longitude: 113.932544,
                latitude: 22.541566,
                name:"",
            },      // 门店数据模型
        }
    };
    componentDidMount(){
        const { params } = this.props.navigation.state;
        this.setState({
            storeData: params.storeData,
        });
    };

    render(){

        let distance = "";
        if (this.state.storeData.number > 1000) {
            distance = this.state.storeData.number / 1000;
            distance = '距您:' + distance.toFixed(2) + 'km';
        } else {
            distance = '距您:' + this.state.storeData.number + 'm';
        }

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
            <View style={styles.container}>

                <MapView style={styles.mapViewStyle}
                         coordinate={{
                             latitude: this.state.storeData.latitude,
                             longitude: this.state.storeData.longitude,
                         }}
                         showsCompass={false}
                         zoomLevel={18}
                >
                    <MapView.Marker
                        active
                        title= {this.state.storeData.name}
                        image = 'icon_map_tag_sele'
                        coordinate={{
                            latitude: this.state.storeData.latitude,
                            longitude: this.state.storeData.longitude,
                        }}
                    />

                </MapView>

                <View style={styles.backViewStyle}>
                    <TouchableOpacity activeOpacity={0.7} onPress={()=>this.backClick()}>
                        <Image style={{
                            width: LayoutTool.scaleSize(90),
                            height: LayoutTool.scaleSize(92),
                        }} source={require("../../images/HomeImg/icon_mapBack.png")}/>
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomViewStyle}>
                    <View style={styles.topViewStyle}>
                        <View>
                            <Text style={{
                                        fontWeight: 'bold',
                                        fontSize: LayoutTool.setSpText(34),
                                        marginLeft: LayoutTool.scaleSize(30),
                                        marginTop: LayoutTool.scaleSize(35),
                                        color: "#F2D3AB",
                            }}>{this.state.storeData.name}</Text>
                            <Text style={{
                                fontSize: LayoutTool.setSpText(28),
                                marginLeft: LayoutTool.scaleSize(30),
                                marginTop: LayoutTool.scaleSize(15),
                                color: "#F2D3AB",
                            }}>{distance}</Text>
                        </View>
                        <TouchableOpacity activeOpacity={0.7} onPress={()=>this.mapRouteClick()}>
                            <Image style={{
                                        width: LayoutTool.scaleSize(189),
                                        height: LayoutTool.scaleSize(70),
                                        marginRight: LayoutTool.scaleSize(40),
                                        marginTop: LayoutTool.scaleSize(30),
                            }} source={require("../../images/HomeImg/icon_mapRoute.png")}/>
                        </TouchableOpacity>
                    </View>
                    <Text style={{
                        fontSize: LayoutTool.setSpText(24),
                        marginLeft: LayoutTool.scaleSize(30),
                        marginTop: LayoutTool.scaleSize(12),
                        color: "#8B8782",
                    }}>{this.state.storeData.adds}</Text>
                    <Text style={{
                        fontSize: LayoutTool.setSpText(24),
                        marginLeft: LayoutTool.scaleSize(30),
                        marginTop: LayoutTool.scaleSize(12),
                        color: "#8B8782",
                    }}>供餐时间 {timeArray.join('/')}</Text>
                </View>

            </View>
        )
    }

    backClick() {
        this.props.navigation.pop();
    }

    mapRouteClick() {
        console.log(this.state.storeData.adds);
        Alert.alert(
            '',
            '请选择地图导航',
            [
                {text: '百度地图', onPress: () => MapUntil.turnMapApp(this.state.storeData.longitude,this.state.storeData.latitude, 'baidu', this.state.storeData.adds)},
                {text: '高德地图', onPress: () => MapUntil.turnMapApp(this.state.storeData.longitude,this.state.storeData.latitude, 'gaode', this.state.storeData.adds)},
                {text: '取消', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
            ],
            { cancelable: false },
        )
    }
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    mapViewStyle: {
       width:SCREEN_WIDTH,
       height:SCREEN_HEIGHT,
    },

    backViewStyle: {
        position: 'absolute',
        width: LayoutTool.scaleSize(90),
        height: LayoutTool.scaleSize(92),
        top: STATUSBAR_HEIGHT,
        left: LayoutTool.scaleSize(18),
    },

    bottomViewStyle: {
        backgroundColor: '#2F2F30',
        position: 'absolute',
        width: SCREEN_WIDTH-LayoutTool.scaleSize(30),
        height: 269*unitWidth,
        bottom: LayoutTool.scaleSize(15),
        left: LayoutTool.scaleSize(15),
        borderRadius: LayoutTool.scaleSize(10),
    },

    topViewStyle: {
        width: SCREEN_WIDTH,
        flexDirection: 'row',
        justifyContent:'space-between',
    },

});
