import requestApi from '@src/utils/request';
import * as YTUI from '@yt/YTUI'
import { fileBlobToBase64, dataURLtoFile, geFileSize } from './util';
import OSS from "ali-oss";
/**
 * 图片上传
 * 根据 userAgent 判断终端，并调用微信、支付宝、云信相关的上传图片 API
 * 返回图片上传之后的云信地址
 * 初始化实例：
 * const imgUploader = new ImageUploader({
 *   onUpload: (url) => {}
 * })
 *
 * web、微信、支付宝里面使用
 * imgUploader.action()
 * 
 * 普通 web 使用
 * imgUploader.action(input)
 */
class ImageUploader {
    /**
     * @param {object} options 参数对象，支持 tools.imageBase64 所支持的所有参数
     * @param {number} options.wxOptions 微信 API 相关参数
     * @param {number} options.aliOptions 支付宝 API 相关参数
     * @param {function} options.onUpload 上传之后的回调
     */
    constructor (options) {
        this.options = Object.assign({}, ImageUploader.defaultOptions, options)
        this.options.wxOptions = this.options.wxOptions || {}
        this.options.aliOptions = this.options.aliOptions || {}

        // tools.initJSAPI()
    }

    /**
     * 默认参数
     */
    static defaultOptions = {
        maxSize: 3, // 默认图片超过3M进行压缩
        types: ['png', 'jpeg', 'jpg'],
    }

    /**
     * 上传流程
     * 给 input 或者 div click 事件绑定此事件
     */
    action (input, hosId) {
        // 微信小程序
        if(baseInfo.ua.isWechatSRWeb) return this.actionWx();
        // 支付宝
        if(baseInfo.ua.isAli) return this.actionAli();
        // app上传
        if(baseInfo.ua.isYTApp) return this.actionYTApp(hosId);
        // 普通 web
        this.actionWeb(input)
    }

    // 微信小程序上传流程
    actionWx () {
        this.wxChooseImage()
        .then(this.wxUploadImage.bind(this))
        .then(this.wxDownloadImage.bind(this))
        .then(this.reqImageUpload.bind(this))
    }

    // 支付宝图片上传流程
    actionAli () {
        this.aliChooseImage()
        .then(this.reqImageUpload.bind(this))
    }

    // 芸泰app 图片上传流程
    actionYTApp (hosId) {
        let that = this;
        if (window.HundsunBridge) {
            window.HundsunBridge.callHandler('photo', {
                hosId: hosId
            }, function (appData) {
                if (appData) {
                    if (typeof appData === 'string') {
                        appData = JSON.parse(appData);
                    }
                    let base64 = `data:image/png;base64,${appData.data[0].fileData}`;
                    that.reqImageUpload(base64);
                } else {
                    YTUI.showToast({
                        content: "获取图片失败",
                    })
                }
            })
        }
    }

    // 普通 web 图片上传流程
    actionWeb (input) {
        if (!input) {
            throw new Error('ImageUploader: web 方式，请传入 input')
        }
        let size = geFileSize(input);
        let maxSize = this.options.maxSize;
        let isCompress = size > maxSize ? true : false;
        fileBlobToBase64(input, (dataurl) => {
            this.reqImageUpload(dataurl)
        }, isCompress) 
    }

    // 微信：选择图片
    wxChooseImage () {
        let wxOptions = this.options.wxOptions;
        return new Promise((resolve) => {
            wx.chooseImage({
                count: wxOptions.count || 1,
                sizeType: wxOptions.sizeType || ['original', 'compressed'],
                sourceType: wxOptions.sourceType || ['album', 'camera'],
                success(res) {
                    resolve(res.localIds[0])
                }
            })
        })
    }

    // 微信：上传图片
    wxUploadImage(localId){
        let wxOptions = this.options.wxOptions
        return new Promise((resolve) => {
            wx.uploadImage({
                localId,
                isShowProgressTips: wxOptions.isShowProgressTips || 1,
                success (res) {
                    let serverId = res.serverId
                    if (!serverId) {
                        return alert('传输图片出错！')
                    }
                    resolve(serverId)
                }
            })
        })
    }

    // 微信：下载图片
    wxDownloadImage (serverId) {
        return new Promise((resolve, reject) => {
            requestApi({
                url: `/${baseInfo.serverNam}/3rd/${baseInfo.appId}/weixin/downloadWxImage`,
                hideToast: true,
                data: {
                    serverId: serverId
                }
            }).then((res) => {
                if (!res.result) {
                    return YTUI.showToast(res.msg || '下载图片失败')
                }
                let data = res.data;
                resolve(data)
            })
        })
    }

    // 支付宝：选择图片
    aliChooseImage () {
        let aliOptions = this.options.aliOptions;
        return new Promise((resolve) => {
            AlipayJSBridge.call('photo', {
                dataType: 'dataURL',
                imageFormat: aliOptions.imageFormat || 'jpg',
                quality: aliOptions.quality || 75,
                maxWidth: aliOptions.maxWidth || 500,
                maxHeight: aliOptions.maxHeight || 500,
                multimediaConfig: {
                    compress: 3
                }
            }, function (result) {
                if (!result.dataURL) return;
                let imgBase64 = `data:image/jpeg;base64,${result.dataURL}`;
                resolve(imgBase64);
            })

        })
    }

    /**
     * 上传图片
     */
    reqImageUpload (base64) {
        return new Promise(async (resolve, reject) => {
            // 使用base64形式的，则无需上传
            if (this.options.base64) {
                resolve(base64)
                this.options.onUpload && this.options.onUpload(base64)
                return;
            }
            let that = this;
            requestApi({
                loading: '图片上传中...',
                data: {
                    api_name: `/r/11001/100@common`, // 请求接口
                    bizType: 'patient_pic'
                }
            }).then((res) => {
                if(!res.result) {
                    return YTUI.showToast(res.msg || '阿里云凭证获取失败')
                }
                const client = new OSS({
                    region: 'oss-cn-hangzhou',
                    bucket: 'hsytoss',
                    endpoint: 'https://oss-cn-hangzhou.aliyuncs.com',
                    secure: true,
                    accessKeyId: res.data.stsAccessKeyId,
                    accessKeySecret: res.data.stsAccessKeySecret,
                    stsToken: res.data.stsSecurityToken
                });
                const path = '/patient_pic/' + 'nurse_hos_prove.png'.split('.').concat(Date.now()).join('_');
                const imgfile = dataURLtoFile(base64);

                client.multipartUpload(path, imgfile).then(function (result) {
                    if (result.res.statusCode === 200 && result.res.requestUrls[0]) {
                        let imgUrl = result.res.requestUrls[0].split('?')[0]
                        resolve(imgUrl)
                        that.options.onUpload && that.options.onUpload(imgUrl)
                    } else {
                        YTUI.showToast(res.msg || '上传阿里云服务器错误');
                    }
                }).catch(err =>  {
                    console.log(err)
                    YTUI.showToast(res.msg || '上传阿里云服务器错误')
                })
            })
        })
    }
}

export default ImageUploader;