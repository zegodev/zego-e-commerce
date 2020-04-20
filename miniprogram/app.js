//app.js
App({
  onLaunch: function () {
    wx.getSystemInfo({
      success (res) {
        console.log(res)
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    liveAppID: 1739272706,
    wsServerURL: "wss://wsliveroom1739272706-api.zego.im:8282/ws",
    tokenURL: 'https://wsliveroom-alpha.zego.im:8282/token', // 即构提供的测试环境的测试接口，正式环境要由业务服务端实现
  }
})