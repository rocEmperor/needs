import EXIF from './exif.js';

/**
 * 判断图片类型
 * @param name 
 * @param gif|jpg|jpeg|png|GIF|JPG|PNG
 */
export function testImgType(name) {
    if (!/\.(jpg|jpeg|png|JPG|PNG)$/.test(name)) {
        return false;
    }
    return true;
}

/**
 * 校验文件是否超过允许值
 * @param fileData
 * @param Max_Size 最大值
 */
export function testMaxSize(fileData, Max_Size){
    let isAllow = false;
    let size = fileData.size;
    isAllow = size <= Max_Size;
    if (!isAllow) {
        return false;
    }
    return isAllow;
}

/**
 * 获取文件大小，单位M
 */
export function geFileSize (fileData) {
    let size = 0;
    if (fileData) {
        size = fileData.size;
    }
    return size / 1000000;
}

/**
 * 获取图片方向，用于解决ios上传图片发生旋转的问题
 * @param {Object} img 
 */
export function getPhotoOrientation(img) {
    let orient;
    EXIF.getData(img, function () {
        orient = EXIF.getTag(this, 'Orientation');
    });
    return orient;
}

/**
 * 将图片转化为base64
 * @param {Object} // target 目标DOM
 * @param {Function} // callback 回调
 * @param {Boolean} // 控制是否压缩
 */
export function fileBlobToBase64(target, callback, isCompress) {
    let reader = new FileReader();
    reader.onload = function(e) {
        if (isCompress) {
            dealImage(e.target.result, 700, callback);
        } else {
            callback(e.target.result)
        }
    };
    reader.readAsDataURL(target);
}

/**
 * 压缩base64
 * @param {String} base64 
 * @param {Number} w 
 * @param {Function} callback 
 */
export function dealImage (base64, w, callback) {
    let newImage = document.createElement('img');
    let quality = 0.4;    // 压缩系数0-1之间
    newImage.src = base64;
    newImage.setAttribute('crossOrigin', 'Anonymous');	// url为外域时需要
    let imgWidth, imgHeight;
    newImage.onload = function (e) {
        let orient = getPhotoOrientation(e.target)
        let target = e.target;
        imgWidth = newImage.width;
        imgHeight = newImage.height;
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        if (Math.max(imgWidth, imgHeight) > w) {
            if (imgWidth > imgHeight) {
                canvas.width = w;
                canvas.height = w * imgHeight / imgWidth;
            } else {
                canvas.height = w;
                canvas.width = w * imgWidth / imgHeight;
            }
        } else {
            canvas.width = imgWidth;
            canvas.height = imgHeight;
            quality = 0.4;
        }
        // orient为6时，说明时ios上传，图片会在上传时发生旋转，需做特殊处理
        if (orient == 6) { 
            canvas.width = newImage.height * 0.5;
            canvas.height = newImage.width * 0.5;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(90 * Math.PI / 180);
            ctx.drawImage(target, 0 - canvas.height / 2, 0 - canvas.width / 2, canvas.height, canvas.width);
            quality = 0.2;
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(target, 0, 0, canvas.width, canvas.height);
        }
        let base64 = canvas.toDataURL('image/jpeg', quality); // 压缩语句
        // 如想确保图片压缩到自己想要的尺寸,如要求在50-150kb之间，请加以下语句，quality初始值根据情况自定
        // while (base64.length / 1024 > 150) {
        // 	quality -= 0.01;
        // 	base64 = canvas.toDataURL("image/jpeg", quality);
        // }
        // // 防止最后一次压缩低于最低尺寸，只要quality递减合理，无需考虑
        // while (base64.length / 1024 < 50) {
        //     quality += 0.001;
        // 	base64 = canvas.toDataURL("image/jpeg", quality);
        // }
        callback(base64);//必须通过回调函数返回，否则无法及时拿到该值
    }
}

/**
 * base64转文件流
 */
export function dataURLtoFile (dataurl, filename = 'file') {
    let arr = dataurl.split(',')
    let mime = arr[0].match(/:(.*?);/)[1]
    let suffix = mime.split('/')[1]
    let bstr = atob(arr[1])
    let n = bstr.length
    let u8arr = new Uint8Array(n)
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], `${filename}.${suffix}`, {type: mime})
}