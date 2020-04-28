import React, { Component } from "react";
import $ from 'jquery';
require('./lab/photoSwiper/photoswipe.css');
require('./lab/photoSwiper/default-skin/default-skin.css');
window.PhotoSwipe = require('./lab/photoSwiper/photoswipe.js');
window.PhotoSwipeUI_Default = require('./lab/photoSwiper/photoswipe-ui-default.min.js');
import './index.scss';

export default class PhotoSwiper extends Component {
    constructor(props) {
        super(props);
        this.state = {
            gallery: '',
            dpr: window.devicePixelRatio || 1,
            visible: false
        }
    }

    componentDidMount() {
        // this.photoSwiper();
    }
    componentWillReceiveProps (nextProps) {
        this.setState({
            visible: nextProps.visible || false
        })
    }
    componentDidUpdate() {
        let { visible } = this.state;
        if (visible) {
            this.photoSwiper()
        }
    }


    photoSwiper = () => {
        let { gallery, dpr } = this.state;
        let { imgSrc, currentIndex } = this.props;
        let pswpElement = document.querySelectorAll('.pswp')[0];
        let items = [];
        let count = 0;
        imgSrc.map((src, i) => {
            let Img = new Image();
            Img.src = src;
            Img.onload = (event) => {
                let e = event.target;
                let h = window.screen.width * e.naturalHeight / e.naturalWidth;
                items[i] = {
                    src: src,
                    w: window.screen.width * dpr,
                    h: h * dpr
                }
                count = count + 1;
                if (count == imgSrc.length) {
                    let options = {
                        index: currentIndex,
                        history: false,
                        focus: false,
                        tapToClose: true, // 默认关闭
                        showAnimationDuration: 0,
                        hideAnimationDuration: 0
                    };
                    gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
                    gallery.init();
                    // 监听关闭
                    gallery.listen('close', () => {
                        this.props.onHide && this.props.onHide()
                    })
                    $('.pswp').click((e) => {
                        e.stopPropagation();
                    })
                }
            }
        })
    }
    render() {
        return (
            <div>
                <div className="pswp" tabIndex="-1" role="dialog" aria-hidden="true">
                    <div className="pswp__bg"></div>
                    <div className="pswp__scroll-wrap">
                        <div className="pswp__container">
                            <div className="pswp__item"></div>
                            <div className="pswp__item"></div>
                            <div className="pswp__item"></div>
                        </div>
                        <div className="pswp__ui pswp__ui--hidden">
                            <div className="pswp__top-bar">
                                <div className="pswp__counter"></div>
                                {/* <button className="pswp__button pswp__button--close" title="Close (Esc)"></button>
                                <button className="pswp__button pswp__button--share" title="Share"></button>
                                <button className="pswp__button pswp__button--fs" title="Toggle fullscreen"></button>
                                <button className="pswp__button pswp__button--zoom" title="Zoom in/out"></button> */}
                                <div className="pswp__preloader">
                                    <div className="pswp__preloader__icn">
                                        <div className="pswp__preloader__cut">
                                            <div className="pswp__preloader__donut"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
                                <div className="pswp__share-tooltip"></div>
                            </div>
                            <button className="pswp__button pswp__button--arrow--left" title="Previous (arrow left)">
                            </button>
                            <button className="pswp__button pswp__button--arrow--right" title="Next (arrow right)">
                            </button>
                            <div className="pswp__caption">
                                <div className="pswp__caption__center"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}