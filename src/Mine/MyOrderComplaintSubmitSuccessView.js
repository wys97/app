
// 订单投诉成功

import React from 'react'
import {StyleSheet, View, Text, TouchableOpacity, Image, ImageBackground, ScrollView, BackHandler} from 'react-native'

import {SCREEN_WIDTH, STATUSBAR_HEIGHT} from '../../Tools/Layout';
import {unitWidth} from "../../Tools/Layout";
import LayoutTool from "../../Tools/Layout"


type Props = {};
export default class MyOrderComplaintSubmitSuccessView extends React.Component<Props>{

    constructor(props) {
        super(props);
        this.state = {
            data: "",
        }
    }

    static navigationOptions = ({navigation}) => {
        return {
            title: "订单投诉",
            gesturesEnabled: false,

            headerLeft: (
                <TouchableOpacity activeOpacity={1} onPress={() =>{navigation.goBack(routKey)}}>
                    <View style={styles.navView}>
                        <Image style={styles.navRightImage} source={require('../../images/Nav/icon_navBack.png')}/>
                    </View>

                </TouchableOpacity>
            ),
        };
    };

    componentDidMount(){
        const { params } = this.props.navigation.state;
        console.log(this.props.navigation.state);
        console.log("........");
        this.setState({
            data: params.data,
        });
        BackHandler.addEventListener("handleBack", this.handleBack);
    }
    componentWillUnmount() {
        BackHandler.removeEventListener("handleBack", this.handleBack);
        //组件卸载时一定要将事件注销！！
    }
    handleBack = () => {
        this.props.navigation.goBack(routKey);
        return true;
    };

    render(){
        return (
            <ScrollView style={styles.container}>

                <View style={styles.successTopViewStyle}>
                    <ImageBackground style={{
                                width: LayoutTool.scaleSize(580),
                                height: LayoutTool.scaleSize(367),
                                marginLeft: LayoutTool.scaleSize(45),
                                marginTop: LayoutTool.scaleSize(44),
                    }} source={require("../../images/MineImg/icon_orderComplaintProgress.png")}>
                        <Text style={{
                            fontSize: LayoutTool.setSpText(30),//15,
                            color: "#F2D3AB",
                            marginLeft: LayoutTool.scaleSize(194),
                            bottom: LayoutTool.scaleSize(-8),
                            position: 'absolute',
                        }}>{this.state.data.date}</Text>
                    </ImageBackground>
                    <Text style={{
                        fontSize: LayoutTool.setSpText(24),
                        color: "#8B8782",
                        marginLeft: LayoutTool.scaleSize(103),
                        marginTop: LayoutTool.scaleSize(18),
                    }}>{"订单ID："+this.state.data.orderId}</Text>
                </View>

                <View style={styles.successBottomViewStyle}>
                    <Text style={{
                        fontSize: LayoutTool.setSpText(30),
                        fontWeight: "bold",
                        color: "#F2D3AB",
                        marginLeft: LayoutTool.scaleSize(45),
                        marginTop: LayoutTool.scaleSize(40),
                    }}>投诉详情</Text>

                    <View style={{
                        backgroundColor: "#2F2F30",
                        flexDirection: 'row',
                    }}>
                        <Text style={{
                            fontSize: LayoutTool.setSpText(28),//14,
                            color: "#8B8782",
                            marginTop: LayoutTool.scaleSize(40),
                            marginLeft: LayoutTool.scaleSize(45),
                        }}>投诉类型：</Text>
                        <Text style={{
                            fontSize: LayoutTool.setSpText(28),//14,
                            color: "#F2D3AB",
                            marginTop: LayoutTool.scaleSize(40),
                        }}>{this.state.data.content}</Text>
                    </View>

                    <View style={{
                        backgroundColor: "#2F2F30",
                        flexDirection: 'row',
                        width: LayoutTool.scaleSize(620),
                    }}>
                        <Text style={{
                            fontSize: LayoutTool.setSpText(28),//14,
                            color: "#8B8782",
                            marginTop: LayoutTool.scaleSize(20),
                            marginLeft: LayoutTool.scaleSize(45),
                        }}>问题描述：</Text>
                        <Text style={{
                            fontSize: LayoutTool.setSpText(28),//14,
                            color: "#F2D3AB",
                            marginTop: LayoutTool.scaleSize(20),
                            width: LayoutTool.scaleSize(460),
                        }}>{this.state.data.remark}</Text>
                    </View>

                    <View style={{
                        backgroundColor: "#2F2F30",
                        flexDirection: 'row',
                    }}>
                        <Text style={{
                            fontSize: LayoutTool.setSpText(28),//14,
                            color: "#8B8782",
                            marginTop: LayoutTool.scaleSize(20),
                            marginLeft: LayoutTool.scaleSize(45),
                        }}>附件：</Text>
                        {this.state.data.fileInfoUrl?<Image style={{
                            width: LayoutTool.scaleSize(130),
                            height: LayoutTool.scaleSize(130),
                            marginTop: LayoutTool.scaleSize(20),
                            borderRadius: LayoutTool.scaleSize(10),
                        }} source={{uri:this.state.data.fileInfoUrl}}/>:null}
                    </View>

                    <View style={{height: LayoutTool.scaleSize(40),}}/>
                </View>

            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222224',
    },
    successTopViewStyle: {
        backgroundColor: "#2F2F30",
        marginRight: LayoutTool.scaleSize(40),
        marginLeft: LayoutTool.scaleSize(40),
        marginTop: LayoutTool.scaleSize(40),
        height:LayoutTool.scaleSize(508),
        borderRadius: LayoutTool.scaleSize(16),
    },
    successBottomViewStyle: {
        backgroundColor: "#2F2F30",
        marginRight: LayoutTool.scaleSize(40),
        marginLeft: LayoutTool.scaleSize(40),
        marginTop: LayoutTool.scaleSize(40),
        borderRadius: LayoutTool.scaleSize(16),
    },

    navView: {
        width: 50,
        height: 44,
    },

    navRightImage: {
        marginTop: 13,
        marginLeft: 18,
        width: 9,
        height: 17,
    },
});
