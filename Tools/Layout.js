
import {
    Dimensions,
    StatusBar,
    Platform,
    TabBar,
    PixelRatio,
    DeviceInfo,
} from 'react-native';

import ExtraDimensions from 'react-native-extra-dimensions-android';

//UI设计图的宽度
const designWidth = 750;
//UI设计图的高度
const designHeight = 1334;

const {width, height} = Dimensions.get("window");

//计算手机屏幕宽度对应设计图宽度的单位宽度
export const unitWidth = width / designWidth;
//计算手机屏幕高度对应设计图高度的单位高度
export const unitHeight = height / designHeight;

//字体缩放比例，一般情况下不用考虑。
// 当应用中的字体需要根据手机设置中字体大小改变的话需要用到缩放比例
export const fontScale = PixelRatio.getFontScale();

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;
export const IOS = Platform.OS === 'ios';
export const ANDROID = Platform.OS === 'android';
export const IPHONE_X = (IOS && height==812 || IOS && height==896);
export const STATUSBAR_MARGIN = (()=>{
    if(IPHONE_X) return 44;
    if(IOS) return 20;
    if(ANDROID) return 0;
})();

export const STATUSBAR_HEIGHT = (()=>{
    if(IPHONE_X) return 44;
    if(IOS) return 20;
    if(ANDROID) return 0;//StatusBar.currentHeight;
})();

export const tabBar_MARGIN = (()=>{
    if(IPHONE_X) return 83;
    if(IOS) return 49;
    if(ANDROID) return 0;
})();

export const tabBar_HEIGHT = (()=>{
    if(IPHONE_X) return 83;
    if(IOS) return 49;
    if(ANDROID) return 49;//TabBar.currentHeight;
})();

export const SOFT_MENU_BAR_HEIGHT =(()=>{
    if(IPHONE_X) return 34;
    if(IOS) return 0;
    if(ANDROID) return ExtraDimensions.getSoftMenuBarHeight();
})();


// 设备像素密度
export var pixelRatio = PixelRatio.get();

export default class Layout {
    static setSpText = (size)  =>{
        var scaleWidth = SCREEN_WIDTH / 750;
        var scaleHeight = SCREEN_HEIGHT / 1334;
        var scale = Math.min(scaleWidth, scaleHeight);
        size = Math.round((size * scale + 0.5) * pixelRatio / fontScale);
        return size / PixelRatio.get();
    };

    static scaleSize = (size)  =>{
        var scaleWidth = SCREEN_WIDTH / 750;
        var scaleHeight = SCREEN_HEIGHT / 1334;
        var scale = Math.min(scaleWidth, scaleHeight);
        size = Math.round((size * scale + 0.5));
        return size;
    };

    static px = (size)  =>{
        if (PixelRatio.get() >= 3 && Platform.OS === 'ios' && size === 1) {
            return size;
        }
        return SCREEN_WIDTH / 750 * size;
    };
}
