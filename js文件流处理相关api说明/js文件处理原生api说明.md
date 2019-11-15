## FileReader对象
### [HTML5] FileReader对象
说明：Blob对象只是二进制数据的容器，本身并不能操作二进制，FileReader主要用于将文件内容读入内存，通过一系列异步接口，可以在主线程中访问本地文件。使用FileReader对象，web应用程序可以异步的读取存储在用户计算机上的文件(或者原始数据缓冲)内容，可以使用File对象或者Blob对象来指定所要处理的文件或数据。

### 创建实例
var reader = new FileReader(); // 通过new FileReader创建读取流容器

### reader实例方法 
----注释：下面api中file参数可以是 File 对象、Blob 对象或者 MediaSource 对象。​
abort():void // 终止文件读取操作
readAsArrayBuffer(file):void // 异步按字节读取文件内容，结果用ArrayBuffer对象表示
readAsBinaryString(file):void // 异步按字节读取文件内容，结果为文件的二进制串
readAsDataURL(file):void // 异步读取文件内容，结果用data:url的字符串形式表示
readAsText(file,encoding):void // 异步按字符读取文件内容，结果用字符串形式表示

### 事件
onabort // 当读取操作被中止时调用
onerror // 当读取操作发生错误时调用
onload // 当读取操作成功完成时调用
onloadend // 当读取操作完成时调用,不管是成功还是失败
onloadstart // 当读取操作将要开始之前调用
onprogress // 在读取数据过程中周期性调用

### 应用场景 上传图片时，在线预览图片

