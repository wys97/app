
// 申请提交成功

import React from 'react'
import {StyleSheet, View, Text, TouchableOpacity, Image, BackHandler, DeviceEventEmitter} from 'react-native'

import LayoutTool, {SCREEN_WIDTH} from "../../Tools/Layout"
import {unitWidth} from "../../Tools/Layout";


export default class MyOrderApplySuccessView extends React.Component{

    static navigationOptions = ({navigation}) => {
        return {
            title: "申请售后",
            gesturesEnabled: false,
            headerLeft: null,
        };
    };

    constructor(props) {
        super(props);
        this.state = {

        }
    }

    componentDidMount(){

        BackHandler.addEventListener("handleBack", this.handleBack);
    }
    componentWillUnmount() {
        BackHandler.removeEventListener("handleBack", this.handleBack);
        //组件卸载时一定要将事件注销！！
    }

    render(){
        return (
            <View style={styles.container}>
                <Image style={{
                        width: SCREEN_WIDTH,
                        height: LayoutTool.scaleSize(417),
                }} source={require("../../images/MineImg/icon_applyAfterSuccess.png")}/>

                <Text style={{
                    fontWeight: 'bold',
                    fontSize: LayoutTool.setSpText(30),//15,
                    color: '#DFB881',
                    marginTop: LayoutTool.scaleSize(12),
                }}>退款申请提交成功</Text>

                <TouchableOpacity activeOpacity={1} onPress={() =>this.detailBtnClick()}>
                    <Image style={{
                        marginTop: LayoutTool.scaleSize(120),
                        width: LayoutTool.scaleSize(550),
                        height: LayoutTool.scaleSize(86),
                    }} source={require("../../images/MineImg/icon_backOrderContentBtnImg.png")}/>
                </TouchableOpacity>

            </View>
        )
    }

    detailBtnClick() {
        DeviceEventEmitter.emit('refundMoneyNotification', '');
        this.props.navigation.goBack(routKey);
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222224',
        alignItems: 'center',
    },
});
