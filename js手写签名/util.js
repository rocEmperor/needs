// ------------- canvas转化为base64 -------------
function canvasToBase64 (target) {
    return dataUrl = target.toDataURL('image/png');
}
// -------------- base64转换为Blob对象、dataURL转换为File对象 ---------------
function base64ToBlob(dataurl) {
    let arr = dataurl.split(',');
    let mime = arr[0].match(/:(.*?);/)[1];
    let bstr = window.atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);
    
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([ u8arr ], { type: mime });
}
// -------------- 将File，Blob生成图片储存到本地 ---------------
function saveImgFormFileBlob (blob, name) {
    let Url = window.URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = Url;
    a.download = name || '将File||Blob生成图片储存到本地.png';
    document.body.appendChild(a);
    // 下载
    a.click();
    document.body.removeChild(a); // 下载结束后移除元素
    window.URL.revokeObjectURL(Url); // 下载结束后释放掉内存内临时文件
}