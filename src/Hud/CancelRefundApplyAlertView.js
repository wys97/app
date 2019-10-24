
// 撤销申请退款弹框

import React from 'react'
import {StyleSheet, View, Text, TouchableOpacity, Image, DeviceEventEmitter} from 'react-native'

import {SCREEN_WIDTH, STATUSBAR_HEIGHT, unitWidth} from '../../Tools/Layout';
import LayoutTool from '../../Tools/Layout'
import NetService from '../../Tools/NetService'

export default class CancelRefundApplyAlertView extends React.Component{

    constructor(props) {
        super(props);
        this.state = {

        }
    }
    componentDidMount(){

    }

    render(){

        return (
            <View style={styles.container}>
                <View style={styles.whiteBgViewStyle}>
                    <Text style={styles.cancelTitleStyle}>确定撤消？</Text>
                    <Text style={styles.cancelBriefStyle}>撤消后无法再次申请</Text>
                    <View style={styles.cancelLineStyle}/>
                    <View style={styles.btnViewStyle}>
                        <TouchableOpacity activeOpacity={0.7} onPress={() =>this.cancelBtnClick()}>
                            <View style={styles.cancelBtnViewStyle}>
                                <Text style={{
                                    fontWeight: 'bold',
                                    color: "#FF9C43",
                                    fontSize: LayoutTool.setSpText(34),
                                }}>取消</Text>
                            </View>

                        </TouchableOpacity>

                        <View style={styles.cancelShuLineStyle}/>

                        <TouchableOpacity activeOpacity={0.7} onPress={() =>this.sureBtnCancel()}>
                            <View style={styles.sureBtnViewStyle}>
                                <Text style={{
                                    fontWeight: 'bold',
                                    color: "#FF9C43",
                                    fontSize: LayoutTool.setSpText(34),
                                }}>确认</Text>
                            </View>

                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }

    cancelBtnClick() {
        DeviceEventEmitter.emit('cancelRevokeRefundApplyNotification', '1');
    }
    sureBtnCancel() {
        DeviceEventEmitter.emit('sureRevokeRefundApplyNotification', '2');
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent:'center',
    },

    whiteBgViewStyle: {
        width: LayoutTool.scaleSize(560),
        height: LayoutTool.scaleSize(280),
        backgroundColor: "#2F2F30",
        borderRadius: LayoutTool.scaleSize(10),
        alignItems: 'center',
    },
    cancelTitleStyle: {
        fontWeight: "bold",
        fontSize: LayoutTool.setSpText(32),
        color:"#F2D3AB",
        marginTop: LayoutTool.scaleSize(46),
    },
    cancelBriefStyle: {
        fontSize: LayoutTool.setSpText(28),
        color:"#A7A39E",
        marginTop: LayoutTool.scaleSize(14),
    },
    cancelLineStyle: {
        marginLeft: 0,
        marginRight: 0,
        marginTop: LayoutTool.scaleSize(44),
        height: LayoutTool.scaleSize(1),
        width: LayoutTool.scaleSize(560),
        backgroundColor: "#39393B",
    },

    btnViewStyle: {
        backgroundColor: "#2F2F30",
        flexDirection: 'row',
        width: LayoutTool.scaleSize(560),
        height: LayoutTool.scaleSize(110),
    },
    cancelBtnViewStyle: {
        width: LayoutTool.scaleSize(560)/2,
        height: LayoutTool.scaleSize(110),
        alignItems: 'center',
        justifyContent:'center',
    },
    sureBtnViewStyle: {
        width: LayoutTool.scaleSize(560)/2,
        height: LayoutTool.scaleSize(110),
        alignItems: 'center',
        justifyContent:'center',
    },
    cancelShuLineStyle: {
        marginTop: 0,
        width: LayoutTool.scaleSize(1),
        height: LayoutTool.scaleSize(110),
        backgroundColor: "#39393B",
    }

});
