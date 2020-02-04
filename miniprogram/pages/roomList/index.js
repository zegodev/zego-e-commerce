
let requestRoomListUrl = 'https://liveroom1739272706-api.zego.im/demo/roomlist?appid=1739272706';


Page({
  data: {
    items: [],
    currentItem: 0,
    roomID: '',
    roomName: '',

    userInfo: {},
    hasUserInfo: false,
  },
  onLoad: function () {

    let userInfo = wx.getStorageSync("userInfo");
    if (userInfo){
      this.setData({
        hasUserInfo: true,
        userInfo: userInfo
      });
    }
  },
  onShow: function () {
    this.fetchRoomList();
    // wx.authorize({
    //   scope:'scope.userInfo',
    //   success() {
    //       console.log('授权成功')
    //       wx.saveImageToPhotosAlbum({
    //           filePath: imgPath,
    //           success(result) {
    //               console.log('userInfo', result)
    //           },
    //           fail(error) {
    //               console.log('userInfo', error)
    //           }
    //       })
    //   }
    // })
  },
  addItem: function () {
    this.data.items.push(this.data.currentItem++);
    this.setData({
      items: this.data.items,
      currentItem: this.data.currentItem
    });
  },
  onGotUserInfo: function(e){
    let userInfo = e.detail.userInfo || {};
    const {currentTarget:{dataset:{id}}} = e;
    console.log('id', id);
    console.log('onGotUserInfo', e);
    // store data for next launch use
    wx.setStorage({
      key: 'userInfo',
      data: userInfo,
    })
    // this.onJoin(userInfo);
    if (id === 'create') {
      this.createRoom();
    } else {
      this.onClickItem(id);
    }

  },
  createRoom: function () {
    var self = this;
    console.log('>>>[liveroom-roomList] onCreateRoom, roomID is: ' + self.data.roomID);

    if (self.data.roomID.length === 0) {
        wx.showToast({
            title: '创建失败，房间 ID 不可为空',
            icon: 'none',
            duration: 2000
        });
        return;
    }

    if (self.data.roomID.match(/^[ ]+$/)) {
        wx.showToast({
            title: '创建失败，房间 ID 不可为空格',
            icon: 'none',
            duration: 2000
        });
        return;
    }

    self.setData({
        loginType: 'anchor'
    });
    // this.getUserInfo();
    // const url = 'plugin://hello-plugin/live-push?roomID=' + this.data.roomID + '&roomName=' + this.data.roomName + '&loginType=' + 'anchor';
    wx.request({
      url: requestRoomListUrl,
      method: "GET",
      success(res) {
          console.log(">>>[liveroom-roomList] fetchRoomList before create room, result is: ");
          if (res.statusCode === 200) {
              var roomList = res.data.data.room_list;
              // self.setData({
              //     roomList: roomList
              // })

              for (var index in roomList) {
                  if (roomList[index].room_id === self.data.roomID) {
                      wx.showToast({
                          title: '创建失败，相同 ID 房间已存在，请重新创建',
                          icon: 'none',
                          duration: 3000
                      });
                      return;
                  }
              }
              const url = '../room/index?roomID=' + 'e-' + self.data.roomID + '&roomName=' + self.data.roomName + '&loginType=' + self.data.loginType;

              wx.navigateTo({
                url: url,
              });
          }
      }
    });
  },
  // 获取房间列表
  fetchRoomList() {
    let self = this;
    console.log(">>>[liveroom-roomList] begin to fetchRoomList");
    wx.showLoading({
        title: '获取房间列表'
    })
    wx.request({
        url: requestRoomListUrl,
        method: "GET",
        success(res) {
            self.stopRefresh();
            console.log(">>>[liveroom-roomList] fetchRoomList, result is: ");
            if (res.statusCode === 200) {
                console.log(res.data);
                const roomList = res.data.data.room_list.
                filter(item => item.room_id.startsWith('e-')).
                map(item => {
                  item.room_show_name = item.room_id.slice(2);
                  console.log('show_name', item.room_show_name);
                  return item;
                });
                console.log('roomList', roomList);
                self.setData({
                    roomList
                });
            } else {
                wx.showToast({
                    title: '获取房间列表失败，请稍后重试',
                    icon: 'none',
                    duration: 2000
                })
            }
        }
    })
  },
  /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
  onPullDownRefresh() {
      console.log('>>>[liveroom-roomList] onPullDownRefresh');
      this.fetchRoomList();
  },
  stopRefresh() {
    wx.hideLoading();
    wx.stopPullDownRefresh();
  },
  // 点击进入房间
  onClickItem(id) {
    console.log('>>>[liveroom-roomList] onClickItem, item is: ',id);

    // 防止两次点击操作间隔太快
    let nowTime = new Date();
    if (nowTime - this.data.tapTime < 1000) {
        return;
    }

    this.setData({
        tapTime: nowTime,
        loginType: 'audience'
    },function(){
        // const url = 'plugin://hello-plugin/live-play?roomID=' + id + '&roomName=' + name + '&loginType=audience';
        // const url = '../play-room/index?roomID=' + id + '&roomName=' + id + '&loginType=audience';
        const url = '../room/index?roomID=' + id + '&roomName=' + id + '&loginType=audience';

        wx.navigateTo({
            url: url
        })
    })
  },

  // 输入的房间 ID
  bindKeyInput(e) {
    this.setData({
        roomID: e.detail.value,
        roomName: e.detail.value,
    })
  },
  getUserInfo() {
    wx.getUserInfo({
      lang: 'zh_CN',
      success: function(res) {
        console.log('getUserInfo success', res);
      },
      fail: function(e) {
        console.error('getUserInfo fail', e);
      }
    })
  }
});