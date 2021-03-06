// miniprogram/pages/live/index.js
var plugin = requirePlugin("zego-e-commerce");
let { sharePage } = require("../../utils/util.js");
let { getLoginToken } = require("../../utils/server.js");

const app = getApp();
let { liveAppID, wsServerURL } = app.globalData;

let liveRoom;
let merT = null;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isNative: false,
    liveAppID: liveAppID,
    wsServerURL: wsServerURL,
    roomID: "",
    logServerURL: "https://wsslogger-demo.zego.im/httplog",
    preferPublishSourceType: 1, // 0：推流到 cdn；1：推流到 bgp
    preferPlaySourceType: 1, // 0：auto；1：从 bgp 拉流
    loginType: "",
    roomShowName: '',
    token: '',
    userInfo: {},
    hasUserInfo: false,


    hideModal:true, //模态框的状态  true-隐藏  false-显示
    animationData:{},

    merchandises: [
      {
        name: 'Givenchy/纪梵希高定香榭天鹅绒唇膏',
        img: '../../resource/m0.png',
        price: '345',
        id: 0,
        link: {
          path: "../web/index",
          extraDatas: {
            url: 'https://shop-ecommerce.yunyikao.com/product.html'
          }
        }
      },
      {
        name: 'OACH蔻驰Charlie 27 Carryal单肩斜挎手提包女包包2952过长样式挎手提包女包包2952过',
        img: '../../resource/m1.png',
        price: '1599',
        id: 1,
        link: {
          path: "../merchandise/index",
        }
      },
      {
        name: 'Vero Moda2020春夏新款褶皱收腰蕾丝拼接雪纺连衣裙',
        img: '../../resource/m2.png',
        price: '749',
        id: 2,
      },
    ],
    pushInx: -1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('>>>onLoad')
    const { roomID, roomName, loginType } = options;
    const roomShowName = roomID.slice(2);
    let timestamp = new Date().getTime();
    const userID = "xcxU" + timestamp;
    this.setData({
      roomID,
      roomName,
      loginType,
      roomShowName,
      userID
    });
    
    console.log('plugin', plugin);
    plugin.sayHello();

    let systemInfo = wx.getSystemInfoSync();
    let rect = wx.getMenuButtonBoundingClientRect();
    console.log(rect.top, systemInfo);
    let gap = rect.top - systemInfo.statusBarHeight; //动态计算每台手机状态栏到胶囊按钮间距
    let navBarHeight = gap + rect.bottom;
    console.log('navBarHeight', rect, navBarHeight);
    this.setData({
        navBarHeight,
        statusBarHeight: systemInfo.statusBarHeight
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.warn('onReady');
    getLoginToken(this.data.userID, this.data.liveAppID).then(token => {
      liveRoom = this.selectComponent('#live-room');
      liveRoom.init();
      liveRoom.loginRoom(token);
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.warn('onShow');
    if (liveRoom) {
      getLoginToken(this.data.userID, this.data.liveAppID).then(token => {
        liveRoom = this.selectComponent('#live-room');
        liveRoom.init();
        liveRoom.loginRoom(token);
      });
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    let obj = sharePage({
        roomID: this.data.roomID,
        loginType: 'audience'
    });
    console.log('onShareAppMessage',obj);
    return obj;
},

  onRoomEvent(ev) {
    console.log('onRoomEvent', ev);
    let { tag, content } = ev.detail;
    switch (tag) {
      case 'onMerchandise': {
        console.log('onMerchandise', content);
        this.showModal();
        break;
      }
      case 'onBack': {
        console.log('onBack', content);
        wx.navigateBack();
        break;
      }
      case 'onModalClick': {
        console.log('onModalClick', content);
        if (!this.data.hideModal) {
          this.hideModal();
        }
        break;
      }
      case 'onRecvMer': {
        console.log('onRecvMer', content);
        const {indx, merTime, merBot} = content;
        merT && clearTimeout(merT);
        this.setData({
          pushInx: indx,
          merBot: merBot
        });
        merT = setTimeout(() => {
          this.setData({
            pushInx: -1,
            merBot: merBot
          });
          clearTimeout(merT);
          merT = null;
        }, merTime * 1000);
        break;
      }
      case 'onPushMerSuc': {
        console.log('onPushMerSuc', content);
        wx.showToast({
          title: '商品推送成功',
          icon: 'none'
        });
        
      }
      default: {
        // console.log('onRoomEvent default: ', e);
        break;
      }
    }
  },

  // 推送商品
  pushMer(e) {
    const {currentTarget:{dataset:{indx}}} = e;
    console.log(indx);
    liveRoom.pushMer(indx);
  },
  // 加入购物车
  addShoppingCart(e) {
    const {currentTarget:{dataset:{indx}}} = e;
    console.log('addShoppingCart ', indx);
  },
  // 显示遮罩层 
  showModal: function() {
    var that = this;
    that.setData({
      hideModal: false
    })
    var animation = wx.createAnimation({
      duration: 150, //动画的持续时间 默认400ms 数值越大，动画越慢 数值越小，动画越快 
      timingFunction: 'linear', //动画的效果 默认值是linear 
    })
    this.animation = animation
    setTimeout(function() {
      that.fadeIn(); //调用显示动画 
    }, 10)
  },
 
  // 隐藏遮罩层 
  hideModal: function() {
    console.log('hideModal');
    var that = this;
    that.setData({
      hideModal: true
    })
    that.fadeDown();
  },
 
  //动画集 
  fadeIn: function() {
    this.animation.translateY(0).step()
    this.setData({
      animationData: this.animation.export() //动画实例的export方法导出动画数据传递给组件的animation属性 
    })
  },
  fadeDown: function() {
    console.log(this.animation);
    this.animation.translateY(450).step()
    this.setData({
      animationData: this.animation.export(),
    })
  },
  clickMech(e) {
    const mer = this.data.merchandises.find(item => item.id == e.currentTarget.id)
    if (!mer || !mer.link) return;
    const link = mer.link;

    if (link) {
      let toUrl = link.path;
      toUrl += link.extraDatas && link.extraDatas.url ? '?url=' + encodeURIComponent(link.extraDatas.url) : '';
      wx.navigateTo({
        url: toUrl,
      });
    }
    
  },
  clickPush() {
    console.log(this.data.pushInx)

    const mer = this.data.merchandises.find(item => item.id == this.data.pushInx)
    if (!mer || !mer.link) return;
    const link = mer.link;
    let toUrl = link.path;
    toUrl += link.extraDatas && link.extraDatas.url ? '?url=' + encodeURIComponent(link.extraDatas.url) : '';
    wx.navigateTo({
      url: toUrl,
    });
  }
})