
import { Linking, Platform } from 'react-native';

export default class MapUntil {

     /**
     * 跳转到导航界面
     * @param lon
     * @param lat
     * @param name
     * @param targetAppName browser-浏览器打开， gaode-高德APP， baidu-百度APP，如果没有安装相应APP则使用浏览器打开。
     */
     static turnMapApp(longitude = "0", latitude = "0", targetAppName = 'baidu', name = '目标地址'){
        if (0 == latitude && 0 == longitude) {
            console.warn('暂时不能导航');
            return;
        }

        let url = '';
        let webUrl = `http://uri.amap.com/navigation?to=${longitude},${latitude},${name}&mode=bus&coordinate=gaode`;
        let webUrlGaode = `http://uri.amap.com/navigation?to=${longitude},${latitude},${name}&mode=car&coordinate=gaode`;

        // let webUrlBaidu = `http://api.map.baidu.com/direction?destination=latlng:${latitude},${longitude}|name=${name}&mode=driving&coord_type=gcj02&output=html&src=mybaoxiu|wxy`;
         let webUrlBaidu = `http://api.map.baidu.com/direction?origin=latlng:${lat},${lon}|name:我的位置&destination=${name}&mode=driving&region=nil&output=html&src=com.hqcgj.driver|禾师傅`;

        url = webUrl;
        if (Platform.OS == 'android') {//android

            if (targetAppName == 'gaode') {
                url = `androidamap://route?sourceApplication=禾师傅&dev=0&m=0&t=1&dlon=${longitude}&dlat=${latitude}&dname=${name}`;
                webUrl = webUrlGaode;
            } else if (targetAppName == 'baidu') {
                url = `baidumap://map/direction?destination=name:${name}|latlng:${latitude},${longitude}&mode=driving&coord_type=gcj02&src=thirdapp.navi.mybaoxiu.wxy#Intent;scheme=bdapp;package=com.baidu.BaiduMap;end`;
                webUrl = webUrlBaidu;
            }
        } else if (Platform.OS == 'ios') {//ios

            if (targetAppName == 'gaode') {
                // url = `iosamap://path?sourceApplication=禾师傅&dev=0&m=0&t=1&dlon=${longitude}&dlat=${latitude}&dname=${name}`;
                webUrl = webUrlGaode;
                url = `iosamap://path?sourceApplication=禾师傅&backScheme=demoURL://&lat=${latitude}&lon=${longitude}&dname=${name}`;
            } else if (targetAppName == 'baidu') {
                webUrl = webUrlBaidu;
                url = `baidumap://map/direction?origin={{我的位置}}&destination=latlng:${latitude},${longitude}|name:${name}&mode=driving&coord_type=gcj02`;
            }

        }

        Linking.canOpenURL(url).then(supported => {
            if (!supported) {
                console.log('Can\'t handle url: ' + webUrl);
                return Linking.openURL(webUrl).catch(e => console.warn(e));
            } else {
                console.log('APP->url: ' + url);
                return Linking.openURL(url).catch(e => console.warn(e));
            }
        }).catch(err => console.error('An error occurred', err));
    }
}
