/**
 * PreviewImg props 说明
 * @param {Array} source 必填 需要展示图片的地址集合
 * @param {Number} index 必填 当前点击的图片在图片的地址集合中的索引
 */
class PreviewImg {
    source = [];
    screenWidth = 0;
    screenHeight = 0;
    start = 0;
    end = 0;
    moveImg = 0;
    moveStart = 0;
    moveEnd = 0;
    currentIndex = 0;
    moveDirection = 0;
    key = Math.floor(Math.random() * 100000);
    already40 = false;
    loadCount = 0;
    constructor (props) {
        if (!props || Object.prototype.toString.call(props) !== '[object Object]') {
            console.error('new PreviewImg props is invalid')
            return false;
        }
        if (!props.source) {
            console.error('source params is must be afferent!')
            return false;
        }
        let { source, index } = props;
        this.source = source;
        this.screenWidth = window.screen.width;
        this.screenHeight = window.screen.height;
        // 创建预览modal容器
        let previewModal = document.createElement('div');
        $(previewModal).addClass(`preview-modal preview-modal-${this.key}`);
        $(previewModal).html(
            `<div class="preview-modal-body">
                <div class="preview-count preview-count-${this.key}"></div>
            </div>`
        )
        $('body').append(previewModal);
        // 创建图片item
        source.forEach((item, index) => {
            let previewImgBox = document.createElement('div');
            $(previewImgBox).addClass(`preview-img-box preview-img-box-${index}`);
            $(previewImgBox).attr('data-index', index)

            let currentImg = document.createElement('img');
            $(currentImg).addClass('current-img');
            currentImg.src = item;
            $(currentImg).attr('data-index', index)
            $(previewImgBox).append(currentImg)
            $('.preview-modal-body').append(previewImgBox);
            currentImg.onload = () => {
                if ($(currentImg).height() > this.screenHeight) {
                    $(currentImg).css({ transform: 'none', top: 0 })
                    $(previewImgBox).css({ 'overflow-y': 'scroll' })
                }
                this.loadCount = this.loadCount + 1;
                if (this.loadCount == this.source.length) {
                    // 绑定事件
                    this.addListeners();
                }
            }
        })
        // 设置图片容器滚动位置
        $('.preview-modal-body').css({ 
            'margin-left': `-${index * this.screenWidth}px`
        });
        $('html').css({ overflow: 'hidden' })
        // 当前是第几张图片
        $('.preview-count').html(`${index + 1}/${this.source.length}`);
    }
    // 关闭预览弹层
    closePreview () {
        $('.preview-modal').remove()
        $('html').css({ overflow: 'auto' })
    }
    // 页面滑动封装
    scrollApi (e, direction) {
        let index = parseInt($(e.target).attr('data-index'));
        let { source, screenWidth } = this;
        let len = source.length;
        index = direction > 0 ? index - 1 : index + 1;
        if (index < 0 || index > len - 1) {
            return false;
        }
        let marginLeft = `-${index * screenWidth}px`;
        $('.preview-modal-body').animate({ 'margin-left': marginLeft }, 200);
        $('.preview-count').html(`${index + 1}/${len}`)
        $('.preview-img-box')[index].scroll(0, 0);
    }
    // 绑定各种事件
    addListeners () {
        // touchstart
        $('html').on('touchstart', `.preview-modal-${this.key} .preview-img-box`, (e) => {
            this.currentIndex = parseInt($(e.target).attr('data-index'));
            this.moveImg = true;
            this.start = e.changedTouches[0].clientX;
            this.moveStart = e.changedTouches[0].clientX;
        })
        // touchmove
        $('html').on('touchmove', `.preview-modal-${this.key} .preview-img-box`, (e) => {
            this.moveEnd = e.changedTouches[0].clientX;
            let diff = this.moveEnd - this.moveStart;
            let len = this.source.length;
            let margin = parseInt($('.preview-modal-body').css('margin-left'));
            let currentImgHeight = 0;
            let className = $(e.target).prop("className");
            if (className.indexOf('current-img') != -1) {
                currentImgHeight = $(e.target).height();
            } else {
                $(e.target).children('.current-img').height();
            }
            if (margin + diff > 0 || margin + diff < -this.screenWidth * (len - 1)) {
                this.moveImg = false;
            }
            if (
                currentImgHeight < this.screenHeight || 
                (currentImgHeight > this.screenHeight && Math.abs(diff) > 40 && !this.already40) ||
                (currentImgHeight > this.screenHeight && this.already40)
            ) {
                if (currentImgHeight > this.screenHeight && Math.abs(diff) > 40) {
                    // 当图片高度大于一屏的时候，首次左右滑动，要求diff大于40的时候才允许滑动，防止上下
                    // 滑动时，页面抖动
                    this.already40 = true;
                }
                if (this.moveImg) {
                    $('.preview-modal-body').css({ 
                        'margin-left': `${margin + diff}px` 
                    });
                    this.moveDirection = diff;
                    this.moveStart = this.moveEnd;
                }
            }
        })
        // touchend
        $('html').on('touchend', `.preview-modal-${this.key} .preview-img-box`, (e) => {
            this.end = e.changedTouches[0].clientX;
            let { end, start, moveImg, moveDirection, screenWidth, currentIndex } = this;
            if (moveImg && end - start != 0) {
                let goBack = function () {
                    $('.preview-modal-body').animate({ 
                        'margin-left': `-${currentIndex * screenWidth}px`
                    }, 100);
                }
                if ((end - start > 0 && moveDirection > 0) || (end - start < 0 && moveDirection < 0)) {
                    if (Math.abs(end - start) > 50) {
                        this.scrollApi(e, end - start)
                    }  else {
                        goBack();
                    }
                } else {
                    goBack();
                }
            }
            this.moveStart = 0;
            this.moveEnd = 0;
            this.moveDirection = 0;
            this.moveImg = false;
            this.already40 = false;
        })
        // 点击关闭预览弹层
        $('html').on('click', `.preview-modal-${this.key} .preview-img-box`, (e) => {
            this.closePreview();
        })
    }
}