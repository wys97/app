
import React from 'react';

import ToastView from "./ToastHudView";

import Loading from './Loading'

import Storage from 'react-native-storage';
import asyncStorage from "@react-native-community/async-storage";
const storage = new Storage({
    size: 1000,// 最大容量，默认值1000条数据循环存储
    storageBackend: asyncStorage, // 存储引擎：对于RN使用AsyncStorage，如果不指定则数据只会保存在内存中，重启后即丢失
    defaultExpires: null,// 数据过期时间，默认一整天（1000 * 3600 * 24 毫秒），设为null则永不过期
    enableCache: true,// 读写时在内存中缓存数据。默认启用。
    sync: {} // 如果storage中没有相应数据，或数据已过期,则会调用相应的sync方法，无缝返回最新数据。
});

//先定义延时函数
const delay = (timeOut = 8*1000) =>{
    return new Promise((resolve,reject) =>{
        setTimeout(() =>{
            // reject(new Error('网络超时'),
            Loading.dismiss();
        },timeOut);
    })
};

export default class NetService {

    // 内网开发环境
    // static pre_url = 'http://192.168.10.200:8763/';

    // 外网测试环境
    static pre_url = 'http://47.107.118.242:8763/';

    // 生产环境
    // static pre_url = 'https://api.hequecheguanjia.com/';

    static Code_OK = '000000';     // 数据请求成功

    static Token_Lose = '100304';  // token失效

    static timeOut = 8*1000;        // 请求时间限制

    //race任务
    static _fetch = (fetchPromise, timeout) => {
        return Promise.race([fetchPromise, delay(timeout)]);
    };

    /**
     *  GET 请求
     */
    static GET = (url, params, success, fail, error, timeout = this.timeOut)  =>{

        return this._fetch(this.get(url, params, success, fail, error), timeout);
    };

    static get(url, params, success, fail, error){

        if (params) {
            let paramsArray = [];
            //拼接参数
            Object.keys(params).forEach(key => paramsArray.push(key + '=' + params[key]));
            if (url.search(/\?/) === -1) {
                url += '?' + paramsArray.join('&')
            } else {
                url += '&' + paramsArray.join('&')
            }
        }
        console.log('Get Url =>' + this.pre_url+url, params);
        // fetch 请求
        fetch(this.pre_url+url,{
            headers:{
                "Authorization":global.token,
            },
        })
            .then(response=>response.json())//把response转为json
            .then(responseJson=> { // 拿到上面的转好的json
                console.log('get response -->URL:' + url);
                console.log(responseJson); // 打印返回结果

                if (responseJson.code === this.Code_OK){ // 200为请求成功
                    success && success(responseJson.data)
                }else {
                    if (responseJson.code === this.Token_Lose) {
                        global.isLogin = false;
                        global.phoneNo = "";
                        storage.remove({
                            key: 'userInfo'
                        });
                        ToastView.showShortHudView('登录失效，请重新登录');
                    } else {
                        ToastView.showShortHudView(responseJson.message);
                    }
                    fail && fail(responseJson)//可以处理返回的错误信息
                }
            })
            .catch(e=>{
                console.log(e);
                error && error(e);
                Loading.dismiss();
                ToastView.showShortHudView('网络不给力哦');
            })
    }

    /**
     *  POST 请求，经测试用FormData传递数据也可以
     */
    static POST = (url, params, success, fail, error, timeout = this.timeOut)  =>{

        return this._fetch(this.post(url, params, success, fail, error), timeout);
    };
    static post(url, params, success, fail, error){
        console.log('POST ->URL:' + this.pre_url+url, params);

        let formData = new FormData();
        for (const key in params) {
            formData.append(key, params[key]);
        }
        fetch(this.pre_url+url,{
            method: 'POST',
            headers:{
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data',

                "Authorization":global.token,
            },
            body: formData, //JSON.stringify(params)
        }) .then(response=>response.json())//把response转为json
            .then(responseJson=> { // 拿到上面的转好的json
                console.log('post response -->URL:', url);
                console.log(responseJson); // 打印返回结果

                if (responseJson.code === this.Code_OK){ // 200为请求成功
                    success && success(responseJson.data)
                }else {
                    if (responseJson.code === this.Token_Lose) {
                        global.isLogin = false;
                        global.phoneNo = "";
                        storage.remove({
                            key: 'userInfo'
                        });
                        ToastView.showShortHudView('登录失效，请重新登录');
                    }else {
                        ToastView.showShortHudView(responseJson.message);
                    }
                    fail && fail(responseJson)//可以处理返回的错误信息
                }
            })
            .catch(e=>{
                console.log(e);
                error && error(error);
                Loading.dismiss();
                ToastView.showShortHudView('网络不给力哦');
            })
    }

    /**
     *  @images uri数组
     *  @param  FormData格式,没有参数的话传null
     */
    static uploadFile = (url, images, params, success, fail, error, timeout = this.timeOut)  =>{

        return this._fetch(this.UploadFile(url, images, params, success, fail, error), timeout);
    };
    static UploadFile(url, images, params, success, fail, error){

        let formData = new FormData();
        for (const key in params) {
            formData.append(key, params[key]);
        }

        for(let i = 0;i<images.length;i++){
            let uri = images[i];
            let date = new Date();
            let name = date.getTime() + '.png';//用时间戳保证名字的唯一性
            let file = {uri: uri, type: 'multipart/form-data', name: name};
            formData.append('file', file)
        }
        console.log(this.pre_url + url,formData);
        fetch(this.pre_url + url, {
            method: 'POST',
            headers:{
                'Accept': 'application/json',
                'Content-Type':'multipart/form-data',

                "Authorization":global.token,
            },
            body: formData,
        }) .then(response=>response.json())//把response转为json
            .then(responseJson=> { // 拿到上面的转好的json
                console.log(responseJson); // 打印返回结果
                if (responseJson.code === this.Code_OK){ // 200为请求成功
                    success && success(responseJson.data)
                }else {
                    fail && fail()//可以处理返回的错误信息
                }
            })
            .catch(e=>{
                console.log(e);
                error && error(error);
                Loading.dismiss();
                ToastView.showShortHudView('网络不给力哦');
            })
    }


    static regeoGet(url, params, success, fail, error){

        if (params) {
            let paramsArray = [];
            //拼接参数
            Object.keys(params).forEach(key => paramsArray.push(key + '=' + params[key]))
            if (url.search(/\?/) === -1) {
                url += '?' + paramsArray.join('&')
            } else {
                url += '&' + paramsArray.join('&')
            }
        }
        console.log('Get Url =>' + url, params);
        // fetch 请求
        fetch(url,{
            headers:{

            },
        })
            .then(response=>response.json())//把response转为json
            .then(responseJson=> { // 拿到上面的转好的json
                console.log(responseJson); // 打印返回结果

                if (responseJson.status == 1){ // 200为请求成功
                    success && success(responseJson)
                }else {
                    fail && fail(responseJson)//可以处理返回的错误信息
                }
            })
            .catch(e=>{
                console.log(e)
            })
    }

}

