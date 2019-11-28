'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * PreviewImg props 说明
 * @param {Array} source 必填 需要展示图片的地址集合
 * @param {Number} index 必填 当前点击的图片在图片的地址集合中的索引
 */
var PreviewImg = function () {
    function PreviewImg(props) {
        var _this = this;

        _classCallCheck(this, PreviewImg);

        this.source = [];
        this.screenWidth = 0;
        this.screenHeight = 0;
        this.start = 0;
        this.end = 0;
        this.moveImg = 0;
        this.moveStart = 0;
        this.moveEnd = 0;
        this.currentIndex = 0;
        this.moveDirection = 0;
        this.key = Math.floor(Math.random() * 100000);
        this.already40 = false;
        this.loadCount = 0;

        if (!props || Object.prototype.toString.call(props) !== '[object Object]') {
            console.error('new PreviewImg props is invalid');
            return false;
        }
        if (!props.source) {
            console.error('source params is must be afferent!');
            return false;
        }
        var source = props.source,
            index = props.index;

        this.source = source;
        this.screenWidth = window.screen.width;
        this.screenHeight = window.screen.height;
        // 创建预览modal容器
        var previewModal = document.createElement('div');
        $(previewModal).addClass('preview-modal preview-modal-' + this.key);
        $(previewModal).html('<div class="preview-modal-body">\n                <div class="preview-count preview-count-' + this.key + '"></div>\n            </div>');
        $('body').append(previewModal);
        // 创建图片item
        source.forEach(function (item, index) {
            var previewImgBox = document.createElement('div');
            $(previewImgBox).addClass('preview-img-box preview-img-box-' + index);
            $(previewImgBox).attr('data-index', index);

            var currentImg = document.createElement('img');
            $(currentImg).addClass('current-img');
            currentImg.src = item;
            $(currentImg).attr('data-index', index);
            $(previewImgBox).append(currentImg);
            $('.preview-modal-body').append(previewImgBox);
            currentImg.onload = function () {
                if ($(currentImg).height() > _this.screenHeight) {
                    $(currentImg).css({ transform: 'none', top: 0 });
                    $(previewImgBox).css({ 'overflow-y': 'scroll' });
                }
                _this.loadCount = _this.loadCount + 1;
                if (_this.loadCount == _this.source.length) {
                    // 绑定事件
                    _this.addListeners();
                }
            };
        });
        // 设置图片容器滚动位置
        $('.preview-modal-body').css({
            'margin-left': '-' + index * this.screenWidth + 'px'
        });
        $('html').css({ overflow: 'hidden' });
        // 当前是第几张图片
        $('.preview-count').html(index + 1 + '/' + this.source.length);
    }
    // 关闭预览弹层


    _createClass(PreviewImg, [{
        key: 'closePreview',
        value: function closePreview() {
            $('.preview-modal').remove();
            $('html').css({ overflow: 'auto' });
        }
        // 页面滑动封装

    }, {
        key: 'scrollApi',
        value: function scrollApi(e, direction) {
            var index = parseInt($(e.target).attr('data-index'));
            var source = this.source,
                screenWidth = this.screenWidth;

            var len = source.length;
            index = direction > 0 ? index - 1 : index + 1;
            if (index < 0 || index > len - 1) {
                return false;
            }
            var marginLeft = '-' + index * screenWidth + 'px';
            $('.preview-modal-body').animate({ 'margin-left': marginLeft }, 200);
            $('.preview-count').html(index + 1 + '/' + len);
            $('.preview-img-box')[index].scroll(0, 0);
        }
        // 绑定各种事件

    }, {
        key: 'addListeners',
        value: function addListeners() {
            var _this2 = this;

            // touchstart
            $('html').on('touchstart', '.preview-modal-' + this.key + ' .preview-img-box', function (e) {
                _this2.currentIndex = parseInt($(e.target).attr('data-index'));
                _this2.moveImg = true;
                _this2.start = e.changedTouches[0].clientX;
                _this2.moveStart = e.changedTouches[0].clientX;
            });
            // touchmove
            $('html').on('touchmove', '.preview-modal-' + this.key + ' .preview-img-box', function (e) {
                _this2.moveEnd = e.changedTouches[0].clientX;
                var diff = _this2.moveEnd - _this2.moveStart;
                var len = _this2.source.length;
                var margin = parseInt($('.preview-modal-body').css('margin-left'));
                var currentImgHeight = 0;
                var className = $(e.target).prop("className");
                if (className.indexOf('current-img') != -1) {
                    currentImgHeight = $(e.target).height();
                } else {
                    $(e.target).children('.current-img').height();
                }
                if (margin + diff > 0 || margin + diff < -_this2.screenWidth * (len - 1)) {
                    _this2.moveImg = false;
                }
                if (currentImgHeight < _this2.screenHeight || currentImgHeight > _this2.screenHeight && Math.abs(diff) > 40 && !_this2.already40 || currentImgHeight > _this2.screenHeight && _this2.already40) {
                    if (currentImgHeight > _this2.screenHeight && Math.abs(diff) > 40) {
                        // 当图片高度大于一屏的时候，首次左右滑动，要求diff大于40的时候才允许滑动，防止上下
                        // 滑动时，页面抖动
                        _this2.already40 = true;
                    }
                    if (_this2.moveImg) {
                        $('.preview-modal-body').css({
                            'margin-left': margin + diff + 'px'
                        });
                        _this2.moveDirection = diff;
                        _this2.moveStart = _this2.moveEnd;
                    }
                }
            });
            // touchend
            $('html').on('touchend', '.preview-modal-' + this.key + ' .preview-img-box', function (e) {
                _this2.end = e.changedTouches[0].clientX;
                var end = _this2.end,
                    start = _this2.start,
                    moveImg = _this2.moveImg,
                    moveDirection = _this2.moveDirection,
                    screenWidth = _this2.screenWidth,
                    currentIndex = _this2.currentIndex;

                if (moveImg && end - start != 0) {
                    var goBack = function goBack() {
                        $('.preview-modal-body').animate({
                            'margin-left': '-' + currentIndex * screenWidth + 'px'
                        }, 100);
                    };
                    if (end - start > 0 && moveDirection > 0 || end - start < 0 && moveDirection < 0) {
                        if (Math.abs(end - start) > 50) {
                            _this2.scrollApi(e, end - start);
                        } else {
                            goBack();
                        }
                    } else {
                        goBack();
                    }
                }
                _this2.moveStart = 0;
                _this2.moveEnd = 0;
                _this2.moveDirection = 0;
                _this2.moveImg = false;
                _this2.already40 = false;
            });
            // 点击关闭预览弹层
            $('html').on('click', '.preview-modal-' + this.key + ' .preview-img-box', function (e) {
                _this2.closePreview();
            });
        }
    }]);

    return PreviewImg;
}();
