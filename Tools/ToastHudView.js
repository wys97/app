
import React from 'react';

import Toast from "react-native-root-toast";

export default class ToastHudViewView {

    static showShortHudView(message){
        Toast.show(message, {
            duration: Toast.durations.SHORT, // toast显示时长
            position: Toast.positions.CENTER, // toast位置
            shadow: true, // toast是否出现阴影
            animation: true, // toast显示/隐藏的时候是否需要使用动画过渡
            hideOnPress: true, // 是否可以通过点击事件对toast进行隐藏
            delay: 0, // toast显示的延时
        });
    }
}
