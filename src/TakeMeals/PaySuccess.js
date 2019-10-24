
// 支付成功

import React from 'react'
import {StyleSheet, View, Text, Image, Modal, DeviceEventEmitter} from 'react-native'

import {unitWidth} from "../../Tools/Layout";
import LayoutTool from "../../Tools/Layout";

import CouponManyTypeShowView from "../Hud/CouponManyTypeShowView"
import CouponSolaDrawShowView from "../Hud/CouponSolaDrawShowView"
import NetService from "../../Tools/NetService";


export default class PaySuccess extends React.Component{

    static navigationOptions = ({navigation}) => {
        return {
            title: "支付成功",
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            showView: false,        // 是否展示领券View

            showMoreView: false,    // 是否展示多种领券View
        }
    }

    componentDidMount(){
        let that = this;
        this.listener =DeviceEventEmitter.addListener('drawCouponNotification',function(type){
            that.setState({
                showView: false,
                showMoreView: false,
            });
        });

        // 获取是否有券可以领取
        let param = {"userId":userId};
        NetService.GET('heque-eat/discount_coupon/get_not_read', param, data=>{
            data.sort(function (a, b) {
                return (a.receiveType - b.receiveType)
            });
            // receiveType 1注册成功 2邀请好友成功 3下单
            let orderArray = [];
            let shareArray = [];
            if (data.length > 1) {
                for (let i = 0; i < data.length; i++) {
                    let tempData = data[i];
                    if (tempData.receiveType == 2) {
                        shareArray.push(tempData);
                    } else if (tempData.receiveType == 3) {
                        orderArray.push(tempData);
                    }
                }
                // 有多种类型的券
                if (shareArray.length > 0 && orderArray.length > 0) {
                    this.setState({
                        showView: false,
                        showMoreView: true,
                    });
                } else { // 单种类型的券
                    this.setState({
                        showView: true,
                        showMoreView: false,
                    });
                }
            } else {
                if (data.length === 1) {
                    this.setState({
                        showView: true,
                        showMoreView: false,
                    });
                } else {
                    this.setState({
                        showView: false,
                        showMoreView: false,
                    });
                }
            }

        });
    }



    render(){
        return (
            <View style={styles.container}>
                <Image  style={{
                            width: 750*unitWidth,
                            height: 417*unitWidth,
                }}
                        source={require("../../images/TakeMealsImg/icon_paySuccessImg.png")}>
                </Image>

                <Text style={{
                            fontSize: LayoutTool.setSpText(36),
                            color: "#101111",
                            marginTop: 10*unitWidth,
                }}>支付成功</Text>

                <Text style={{
                    fontSize: LayoutTool.setSpText(26),
                    color: "#727272",
                    marginTop: 80*unitWidth,
                    textAlign: 'center',
                    lineHeight: 40*unitWidth,
                }} >祝您用餐愉快{"\n"}用餐后记得来评价用餐体验</Text>

                <Modal animationType={'none'}
                       transparent={true}
                       visible={this.state.showView}>
                        <CouponSolaDrawShowView>

                        </CouponSolaDrawShowView>
                </Modal>

                <Modal animationType={'none'}
                       transparent={true}
                       visible={this.state.showMoreView}>
                    <CouponManyTypeShowView>

                    </CouponManyTypeShowView>
                </Modal>

            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        alignItems: 'center',
    },
});
