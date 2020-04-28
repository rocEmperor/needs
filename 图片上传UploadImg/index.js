import React from 'react';
import { testImgType, geFileSize, fileBlobToBase64 } from './util';
import ImageUploader from './UploadClass';
import * as YTUI from '@yt/YTUI';
import './index.scss';

const { showToast }  = YTUI;

/**
 * 图片上传组件
 * props参数说明
 * @param {Function} afterUpload 上传成功后的回调
 */
class UpLoadImg extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            imageUploaderInstance: '',
            isWeb: true
        }
    }
    componentDidMount () {
        let _th = this;
        let { ua } = window.baseInfo;
        let { isWechatSRWeb, type, isAli } = ua;
        let isWeb = true;
        // 小程序&芸泰app&支付宝
        if (isWechatSRWeb || type == 'ytApp' || isAli) {
            isWeb = false;
        }
        this.setState({ isWeb })
        // 初始化图片上传类
        this.setState({
            imageUploaderInstance: new ImageUploader({
                onUpload: (imgUrl) => {
                    let { isWeb } = _th.state;
                    if (isWeb) { // 当前为web环境时，图片长传成功后重置input的value
                        document.getElementById('upload-ipt').value = '';
                    }
                    _th.props.afterUpload && _th.props.afterUpload(imgUrl)
                }
            })
        })
    }
    /**
     * 各终端选择图片
     */
    choiceImgFromTerminal () {
        let { imageUploaderInstance } = this.state;
        imageUploaderInstance.action()
    }
    /**
     * web方式选择图片
     */
    choiceImgFromWeb (e) {
        let { imageUploaderInstance } = this.state;
        if (!e) {
            return false;
        }
        let target = e.target;
        let typeArr = [];
        for (let i = 0; i < target.files.length; i++) {
            typeArr.push(testImgType(target.files[i].name))
        }
        // 校验格式
        if (typeArr.indexOf(false) != -1) {
            showToast('格式错误，请重新上传', 2);
            return false;
        }
        for (let i = 0; i < target.files.length; i++) {
            imageUploaderInstance.action(target.files[i])
        }
    }
    render () {
        let { isWeb } = this.state;
        return (
            <div className="upLoad-img-container">
                <div className="upload-button">
                    <input 
                        id="upload-ipt" 
                        type="file" 
                        // mutiple="mutiple"
                        accept="image/*"
                        onChange={(e) => this.choiceImgFromWeb(e)}
                        className="upload-ipt">
                    </input>
                </div>
                {/* {isWeb 
                    ? <div className="upload-button">
                        <input 
                            id="upload-ipt" 
                            type="file" 
                            // mutiple="mutiple"
                            accept="image/*"
                            onChange={(e) => this.choiceImgFromWeb(e)}
                            className="upload-ipt">
                        </input>
                    </div>
                    : <div 
                        className="upload-button" 
                        onClick={() => this.choiceImgFromTerminal()}> 
                    </div>} */}
            </div>
        )
    }
}

export default UpLoadImg;