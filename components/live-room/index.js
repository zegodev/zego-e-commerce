// components/live-room/index.js
let { ZegoClient } = require("../lib/jZego-wx-1.4.0.js");
let { getLoginToken } = require("../lib/server.js");

let zg;
let connectType = -1;
let zgPusher;
let zgPlayer;
let priseTotal = 0;

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    zegoAppID: {
      type: Number,
      value: 1739272706,
      observer: function(newVal, oldVal) {
        // this.data.zegoAppID = newVal;
        // console.error('zegoAppID')
      }
    },
    logServerURL: {
      type: String,
      value: ""
    },
    loginType: {
      type: String,
      value: ""
    },
    roomID: {
      type: String,
      value: "",
      observer: function(newVal, oldVal, changedPath) {
        // this.setData({ items: newVal });
      }
    },
    avatar: {
      type: String,
      value: ""
    },
    nickName: {
      type: String,
      value: "",
      observer: function(newVal, oldVal) {
        // this.data.userName = newVal;
      }
    },
    navBarHeight: {
      type: Number,
      value: 0
    }
  },
  /**
   * 页面的初始数据
   */
  data: {
    // loginType: '', // 登录类型。anchor：主播；audience：观众
    // roomID: "",             // 房间 ID
    roomName: "", // 房间名
    userID: "", // 当前初始化的用户 ID
    userName: "", // 当前初始化的用户名
    zegoAppID: "", // appID，用于初始化 sdk
    anchorID: "", // 主播 ID
    anchorName: "", // 主播名
    anchorStreamID: "", // 主播推流的流 ID
    publishStreamID: "", // 推流 ID
    pusherVideoContext: null, // live-pusher Context，内部只有一个对象
    playStreamList: [], // 拉流流信息列表，列表中每个对象结构为 {anchorID:'xxx', streamID:'xxx', playContext:{}, playUrl:'xxx', playingState:'xxx'}
    beginToPublish: false, // 准备连麦标志位
    reachStreamLimit: false, // 房间内达到流上限标志位
    isPublishing: false, // 是否正在推流
    pushConfig: {
      // 推流配置项
      mode: "RTC",
      aspect: "3:4", // 画面比例，取值为 3:4, 或者 9:16
      isBeauty: 9, // 美颜程度，取值范围 [0,9]
      isMute: false, // 推流是否静音
      showLog: false, // 是否显示 log
      frontCamera: true, // 前后置摄像头，false 表示后置
      minBitrate: 800, // 最小视频编码码率
      maxBitrate: 1200, // 最大视频编码码率
      isMirror: false, // 画面是否镜像
      bgmStart: false, // 是否
      bgmPaused: false,
      orientation: "vertical"
    },
    playConfig: {
      mode: "live"
    },
    preferPublishSourceType: 1, // 0：推流到 cdn；1：推流到 bgp
    preferPlaySourceType: 1, // 0：auto；1：从 bgp 拉流
    upperStreamLimit: 4, // 房间内限制为最多 4 条流，当流数大于 4 条时，禁止新进入的用户连麦
    tapTime: "",
    pushUrl: "",
    containerAdapt: "",
    containerBaseAdapt: "containerBase-big-calc-by-height",
    messageAdapt: "message-hide",
    requestJoinLiveList: [], // 请求连麦的成员列表
    isCommentShow: false,
    inputMessage: "",
    isMessageHide: true,
    scrollToView: "",
    imgTempPath: "",
    tryPlayCount: 0,

    messageList: [], // 消息列表，列表中每个对象结构为 {name:'xxx', time:xxx, content:'xxx'}
    priseCount: 0,
    priseTapTime: "",
    userCount: 1,
    reMsgCount: 0,
    imColors: ["#FFC000", "#AAFF6C", "#63E3FF", "#FF7920"],
    newestName: "",
    inputShow: false,
    inputBottom: 0,
    clearHide: true,
    keyboardHold: true,

    newBot: 568,
    meBot: 140,
    mmBot: 0,

    userTop: 0,

    playUrl: "",
    sid: "",
    isFull: false,
  },

  ready: function() {
    console.log(" ", this.data.loginType);
    zgPusher = this.selectComponent("#zg-pusher");
    zgPlayer = this.selectComponent("#zg-player");
    console.error("zg", zgPusher, zgPlayer);
    // if (iphoneXX) {
    //   this.data.mmBot += 68;
    //   this.data.meBot += 68;
    //   this.data.newBot += 68;
    //   this.setData({
    //     mmBot: this.data.mmBot,
    //     meBot: this.data.meBot,
    //     newBot: this.data.newBot
    //   })
    // }
    console.log("ready", this.data.zegoAppID, this.data);
    let userTop = this.data.navBarHeight + 16;
    this.setData({
      userTop
    });

    let timestamp = new Date().getTime();
    const nickName = this.data.nickName
      ? this.data.nickName
      : "xcxU" + timestamp;
    const avatar = this.data.avatar
      ? this.data.avatar
      : "../resource/avatar-logo.png";
    const nickAvatar = {
      nickName: nickName,
      avatar: avatar
    };
    this.setData({
      roomName: this.data.roomID,
      // loginType: "anchor",
      preferPlaySourceType: 0,
      userID: "xcxU" + timestamp,
      userName: JSON.stringify(nickAvatar),
      // zegoAppID: ,
      publishStreamID: "xcxS" + timestamp,
      avatar,
      nickName
    });

    zg = new ZegoClient();
    zg.config({
      appid: this.data.zegoAppID, // 必填，应用id，由即构提供
      idName: this.data.userID, // 必填，用户自定义id，全局唯一
      nickName: this.data.userName, // 必填，用户自定义昵称
      remoteLogLevel: 2, // 日志上传级别，建议取值不小于 logLevel
      logLevel: 0, // 日志级别，debug: 0, info: 1, warn: 2, error: 3, report: 99, disable: 100（数字越大，日志越少）
      server: "wss://wsliveroom" + this.data.zegoAppID + "-api.zego.im:8282/ws", // 必填，服务器地址，由即构提供
      logUrl: this.data.logServerURL, // 必填，log 服务器地址，由即构提供
      audienceCreateRoom: true // false观众不允许创建房间
    });

    this.bindCallBack(); //监听zego-sdk回调

    console.log(
      ">>>[liveroom-room] publishStreamID is: " + this.data.publishStreamID
    );

    // 进入房间，自动登录
    getLoginToken(this.data.userID, this.data.zegoAppID).then(token => {
      console.log("tokenn", token);
      this.setData({
        token
      });
      zg.setUserStateUpdate(true);
      this.loginRoom(token);
    });

    this.onNetworkStatus();
    // wx.getUserInfo({
    //   success: (res) => {
    //     console.log('getUserInfo', res);
    //   }
    // });
    // 保持屏幕常亮
    wx.setKeepScreenOn({
      keepScreenOn: true
    });
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindCallBack() {
      let self = this;

      // startPlayStream、startPublishStream 后，服务端主动推过来的流更新事件
      // type: {play: 0, publish: 1};
      zg.onStreamUrlUpdate = function(streamid, url, type, reason) {
        console.log(
          ">>>[liveroom-room] zg onStreamUrlUpdate, streamId: " +
            streamid +
            ", type: " +
            (type === 0 ? "play" : "publish") +
            ", url: " +
            url
        );

        if (type === 1) {
          self.setPushUrl(url);
        } else {
          self.setPlayUrl(streamid, url);
        }
      };

      // 服务端主动推过来的 连接断开事件
      zg.onDisconnect = function(err) {
        console.log(">>>[liveroom-room] zg onDisconnect");
        connectType = 0;
        if (!networkOk) {
          wx.showModal({
            title: "提示",
            content: "连接断开，请退出重试",
            showCancel: false,
            success(res) {
              // 用户点击确定，或点击安卓蒙层关闭
              if (res.confirm || !res.cancel) {
                // 强制用户退出
                // wx.navigateBack();
                const content = {};
                self.triggerEvent("RoomEvent", {
                  tag: "onBack",
                  // code: 0,
                  content
                });
                zg.logout();
              }
            }
          });
        }
      };

      // 服务端主动推过来的 用户被踢掉在线状态事件
      zg.onKickOut = function(err) {
        console.log(">>>[liveroom-room] zg onKickOut");
      };

      // 接收服务端主推送的自定义信令
      zg.onRecvCustomCommand = function(
        from_userid,
        from_idName,
        custom_content
      ) {
        console.log(
          ">>>[liveroom-room] zg onRecvCustomCommand" +
            "from_userid: " +
            from_userid +
            "from_idName: " +
            from_idName +
            "content: "
        );
        console.log("prise custom_content", custom_content);
        const { type, detail } = custom_content;
        if (type === "prise") {
          priseTotal += detail;
          // self.setData({
          //   priseCount: self.data.priseCount
          // })
        }
      };

      // 服务端主动推过来的 流的创建/删除事件；updatedType: { added: 0, deleted: 1 }；streamList：增量流列表
      zg.onStreamUpdated = function(updatedType, streamList) {
        console.log(
          ">>>[liveroom-room] zg onStreamUpdated, updatedType: " +
            (updatedType === 0 ? "added" : "deleted") +
            ", streamList: "
        );
        console.log(streamList);

        if (updatedType === 1) {
          // 流删除通知触发事件：有推流成员正常退出房间；有推流成员停止推流；90s 超时。播放失败不会导致流删除
          self.stopPlayingStreamList(streamList);
        } else {
          // 有成员正常推流成功，流增加
          self.startPlayingStreamList(streamList);
        }
      };

      // 服务端主动推过来的 流信息中的 ExtraInfo更新事件（暂时不用实现）
      zg.onStreamExtraInfoUpdated = function(streamList) {
        console.log(">>>[liveroom-room] zg onStreamExtraInfoUpdated");
      };

      // 服务端主动推过来的 流的播放状态, 视频播放状态通知
      // type: { start:0, stop:1};
      zg.onPlayStateUpdate = function(updatedType, streamID) {
        console.log(
          ">>>[liveroom-room] zg onPlayStateUpdate, " +
            (updatedType === 0 ? "start " : "stop ") +
            streamID
        );

        if (updatedType === 1) {
          // 流播放失败, 停止拉流
          for (let i = 0; i < self.data.playStreamList.length; i++) {
            if (self.data.playStreamList[i]["streamID"] === streamID) {
              self.data.playStreamList[i]["playContext"] &&
                self.data.playStreamList[i]["playContext"].stop();
              self.data.playStreamList[i]["playingState"] = "failed";
              break;
            }
          }
        } else if (updatedType === 0) {
          // 流播放成功, 更新状态
          for (let i = 0; i < self.data.playStreamList.length; i++) {
            if (self.data.playStreamList[i]["streamID"] === streamID) {
              self.data.playStreamList[i]["playingState"] = "succeeded";
            }
          }
        }

        self.setData({
          playStreamList: self.data.playStreamList
        });
      };

      // 接收房间IM消息
      zg.onRecvRoomMsg = function(chat_data, server_msg_id, ret_msg_id) {
        console.log(">>>[liveroom-room] zg onRecvRoomMsg, data: ", chat_data);

        // 收到其他成员的回到前台通知
        let content = chat_data[0].msg_content;
        let category = chat_data[0].msg_category;

        if (category === 2) {
          // 系统消息
          // let data = content.split(".");
          // let streamID = data[1];
          // if (data[0] === "onShow") {
          //   for (let i = 0; i < self.data.playStreamList.length; i++) {
          //     if (self.data.playStreamList[i]["streamID"] === streamID && self.data.playStreamList[i]["playingState"] !== 'succeeded') {
          //       self.data.playStreamList[i]["playContext"] && self.data.playStreamList[i]["playContext"].stop();
          //       self.data.playStreamList[i]["playContext"] && self.data.playStreamList[i]["playContext"].play();
          //     }
          //   }
          // }
        } else {
          // 评论消息
          const { type, detail } = JSON.parse(content);
          if (type === "IM") {
            // let name = chat_data[0].id_name;
            // let time = chat_data[0].send_time;
            // let message = {};
            // message.name = name;
            // message.time = format(time);
            // message.content = detail;
            // message.id = name + time;
            // self.data.messageList.push(message);
            // self.setData({
            //   messageList: self.data.messageList,
            //   scrollToView: message.id,
            // });
          } else if (type === "prise") {
          }
        }
      };

      // 接收大房间IM消息
      (zg.onRecvBigRoomMessage = function(messageList, roomID) {
        console.log("msgList", messageList);
        for (let i = 0; i < messageList.length; i++) {
          let message = {};
          const { avatar: anchorAvatar, nickName } = JSON.parse(
            messageList[i].nickName
          );
          message.name = nickName;

          const logTime = messageList[i].time
            ? messageList[i].time
            : Date.parse(new Date());
          message.content = messageList[i].content;
          message.id = messageList[i].idName + logTime;
          // message.count = self.data.reMsgCount;
          message.color = self.data.imColors[self.data.reMsgCount % 4];

          self.data.messageList.push(message);
          self.data.reMsgCount++;
          self.setData({
            messageList: self.data.messageList,
            scrollToView: message.id,
            reMsgCount: self.data.reMsgCount
          });
        }
      }),
        // 接收可靠消息
        (zg.onRecvReliableMessage = function(type, seq, data) {
          // console.log('onRecvReliableMessage', type, seq, data);
          // if (type === 'prise') {
          //   self.setData({
          //     priseCount: +data
          //   });
          // }
        });

      // 服务端主动推过来的 流的质量更新
      zg.onPublishQualityUpdate = function(streamID, streamQuality) {
        console.log(
          ">>>[liveroom-room] zg onPublishQualityUpdate",
          streamQuality
        );
      };
      // 服务端主动推过来的 流的质量更新
      zg.onPlayQualityUpdate = function(streamID, streamQuality) {
        console.log(">>>[liveroom-room] zg onPlayQualityUpdate", streamQuality);
      };

      // 推流后，服务器主动推过来的，流状态更新
      // type: { start: 0, stop: 1 }，主动停止推流没有回调，其他情况均回调
      zg.onPublishStateUpdate = function(type, streamid, error) {
        console.log(
          ">>>[liveroom-room] zg onPublishStateUpdate, streamid: " +
            streamid +
            ", type: " +
            (type === 0 ? "start" : "stop") +
            ", error: " +
            error
        );

        self.setData({
          isPublishing: type === 0 ? true : false,
          beginToPublish: false
        });
        // 推流失败
        if (type == 1) {
          wx.showModal({
            title: "提示",
            content: "推流断开，请退出房间后重试",
            showCancel: false,
            success(res) {
              // 用户点击确定，或点击安卓蒙层关闭
              if (res.confirm || !res.cancel) {
                // 强制用户退出
                // wx.navigateBack();
                const content = {};
                self.triggerEvent("RoomEvent", {
                  tag: "onBack",
                  // code: 0,
                  content
                });
                zg.logout();
              }
            }
          });
        }
      };

      // 登录成功后，服务器主动推过来的，主播信息
      zg.onGetAnchorInfo = function(anchorId, anchorName) {
        console.log(
          ">>>[liveroom-room] onGetAnchorInfo, anchorId: " +
            anchorId +
            ", anchorName: " +
            anchorName
        );

        self.setData({
          anchorID: anchorId,
          anchorName: anchorName
        });
      };

      // 收到连麦请求
      zg.onRecvJoinLiveRequest = function(
        requestId,
        fromUserId,
        fromUsername,
        roomId
      ) {
        console.log(
          ">>>[liveroom-room] onRecvJoinLiveRequest, roomId: " +
            roomId +
            "requestUserId: " +
            fromUserId +
            ", requestUsername: " +
            fromUsername
        );

        self.data.requestJoinLiveList.push(requestId);

        let content = "观众 " + fromUsername + " 请求连麦，是否允许？";
        wx.showModal({
          title: "提示",
          content: content,
          success(res) {
            if (res.confirm) {
              console.log(
                ">>>[liveroom-room] onRecvJoinLiveRequest accept join live"
              );
              // self.switchPusherOrPlayerMode('pusher', 'RTC');

              // 已达房间上限，主播依然同意未处理的连麦，强制不处理
              if (self.data.reachStreamLimit) {
                wx.showToast({
                  title: "房间内连麦人数已达上限，不建立新的连麦",
                  icon: "none",
                  duration: 2000
                });
                zg.respondJoinLive(requestId, false); // true：同意；false：拒绝
              } else {
                zg.respondJoinLive(requestId, true); // true：同意；false：拒绝
              }

              self.handleMultiJoinLive(
                self.data.requestJoinLiveList,
                requestId,
                self
              );
            } else {
              console.log(
                ">>>[liveroom-room] onRecvJoinLiveRequest refuse join live"
              );
              zg.respondJoinLive(requestId, false); // true：同意；false：拒绝

              self.handleMultiJoinLive(
                self.data.requestJoinLiveList,
                requestId,
                self
              );
            }
          }
        });
      };

      // 收到停止连麦请求
      zg.onRecvEndJoinLiveCommand = function(
        requestId,
        fromUserId,
        fromUsername,
        roomId
      ) {
        console.log(
          ">>>[liveroom-room] onRecvEndJoinLiveCommand, roomId: " +
            roomId +
            "requestUserId: " +
            fromUserId +
            ", requestUsername: " +
            fromUsername
        );
      };

      zg.onUserStateUpdate = function(roomId, userList) {
        console.log(
          ">>>[liveroom-room] onUserStateUpdate, roomID: " +
            roomId +
            ", userList: "
        );
        console.log(userList);

        // 主播信息
        // const audienceList = userList.filter(item => item.role === 2 && item.action === 1);
        // const latest = audienceList.pop();

        // if (latest) {
        //   const {
        //     avatar: anchorAvatar,
        //     nickName
        //   } = JSON.parse(latest.nickName);

        //   self.setData({
        //     newestName: nickName
        //   });
        // }

        //for (let i = 0; i < userList.length; i++) {
        if (
          userList.length === 1 &&
          userList[0].role === 1 &&
          userList[0].action === 2
        ) {
          // 主播退出房间
          // wx.showModal({
          //   title: '提示',
          //   content: '主播已离开，请前往其他房间观看',
          //   showCancel: false,
          //   success(res) {
          //     // 用户点击确定，或点击安卓蒙层关闭
          //     if (res.confirm || !res.cancel) {
          //       // 强制用户退出
          //       // wx.navigateBack();
          //       const content = {
          //       }
          //       self.triggerEvent('RoomEvent',{
          //         tag: 'onBack',
          //         // code: 0,
          //         content
          //       })
          //       zg.logout();
          //     }
          //   }
          // });
          //break;
        }
        //}
      };

      //
      zg.onUpdateOnlineCount = function(roomId, userCount) {
        console.log(
          ">>>[liveroom-room] onUpdateOnlineCount, roomId: " +
            roomId +
            ", userCount: " +
            userCount
        );
        self.setData({
          userCount
        });
      };
    },
    loginRoom(token) {
      let self = this;
      console.log(
        ">>>[liveroom-room] login room, roomID: " + self.data.roomID,
        ", userID: " + self.data.userID + ", userName: " + self.data.userName
      );

      zg.login(
        self.data.roomID,
        self.data.loginType === "anchor" ? 1 : 2,
        token,
        function(streamList) {
          console.log(">>>[liveroom-room] login success, streamList is: ");
          console.log(streamList);

          connectType = 1;

          // 房间内已经有流，拉流
          self.startPlayingStreamList(streamList);

          // 主播登录成功即推流
          if (self.data.loginType === "anchor") {
            if (streamList && streamList.length) {
              // 房间内已有流, 退出
              wx.showModal({
                title: "提示",
                content: "主播已存在，请退出",
                showCancel: false,
                success(res) {
                  if (res.confirm || !res.cancel) {
                    // wx.navigateBack();
                    const content = {};
                    self.triggerEvent("RoomEvent", {
                      tag: "onBack",
                      // code: 0,
                      content
                    });
                  }
                }
              });
              return;
            }
            console.log(
              ">>>[liveroom-room] anchor startPublishingStream, publishStreamID: " +
                self.data.publishStreamID
            );
            zg.setPreferPublishSourceType(self.data.preferPublishSourceType);
            zg.startPublishingStream(self.data.publishStreamID, "");

            // 间隔发布点赞
            // setInterval(() => {
            //   console.log('222', priseTotal);
            //   if (priseTotal > self.data.priseCount) {
            //     self.setData({
            //       priseCount: priseTotal
            //     });
            //   }

            //   zg.sendReliableMessage(
            //     'prise',
            //     '' + priseTotal,
            //     function (res) {
            //       console.log('prise success', res);
            //     },
            //     function (e) {
            //       console.error('prise fail', e);
            //     }
            //   )
            // }, 5000);
          } else {
            if (streamList.length === 0) {
              let title = "主播已经退出！";
              wx.showModal({
                title: "提示",
                content: title,
                showCancel: false,
                success(res) {
                  if (res.confirm || !res.cancel) {
                    // wx.navigateBack();
                    const content = {};
                    self.triggerEvent("RoomEvent", {
                      tag: "onBack",
                      // code: 0,
                      content
                    });
                  }
                }
              });
            }
          }
        },
        function(err) {
          console.log(">>>[liveroom-room] login failed, error is: ", err);
          if (err) {
            let title = "登录房间失败，请稍后重试。\n失败信息：" + err.msg;
            wx.showModal({
              title: "提示",
              content: title,
              showCancel: false,
              success(res) {
                if (res.confirm || !res.cancel) {
                  // wx.navigateBack();
                  const content = {};
                  self.triggerEvent("RoomEvent", {
                    tag: "onBack",
                    // code: 0,
                    content
                  });
                }
              }
            });
          }
        }
      );
    },
    onNetworkStatus() {
      console.log("onNetworkStatus");
      wx.onNetworkStatusChange(res => {
        console.log("net", res);
        // if (res.isConnected && connectType === 0 && zg) {
        //   console.log('connectType', connectType);
        //   zg.setUserStateUpdate(true);
        //   this.loginRoom(this.data.token);
        // }
        if (res.isConnected) {
          networkOk = true;
        } else {
          networkOk = false;
        }
      });
    },
    setPushUrl(url) {
      console.error(">>>[liveroom-room] setPushUrl: ", url);
      let self = this;

      if (!url) {
        console.log(">>>[liveroom-room] setPushUrl, url is null");
        return;
      }

      // console.error('uurl', this.data.pushUrl);
      this.setData(
        {
          pushUrl: url
          // pusherVideoContext: wx.createLivePusherContext(),
        },
        () => {
          console.error("zgPusher", zgPusher);
          zgPusher.start();
        }
      );
    },

    setPlayUrl(streamid, url) {
      console.error(">>>[liveroom-room] setPlayUrl: ", url);
      let self = this;
      if (!url) {
        console.log(">>>[liveroom-room] setPlayUrl, url is null");
        return;
      }
      self.setData(
        {
          sid: streamid,
          playUrl: url
        },
        () => {
          zgPlayer.play();
        }
      );
      // for (let i = 0; i < self.data.playStreamList.length; i++) {
      //   if (self.data.playStreamList[i]['streamID'] === streamid && self.data.playStreamList[i]['playUrl'] === url) {
      //     console.log('>>>[liveroom-room] setPlayUrl, streamid and url are repeated');
      //     return;
      //   }
      // }

      // let streamInfo = {};
      // let isStreamRepeated = false;

      // // 相同 streamid 的源已存在，更新 Url
      // for (let i = 0; i < self.data.playStreamList.length; i++) {
      //   if (self.data.playStreamList[i]['streamID'] === streamid) {
      //     isStreamRepeated = true;
      //     self.data.playStreamList[i]['playUrl'] = url;
      //     self.data.playStreamList[i]['playingState'] = 'initial';
      //     break;
      //   }
      // }

      // // 相同 streamid 的源不存在，创建新 player
      // if (!isStreamRepeated) {
      //   streamInfo['streamID'] = streamid;
      //   streamInfo['playUrl'] = url;
      //   streamInfo['playContext'] = wx.createLivePlayerContext(streamid, self);
      //   streamInfo['playingState'] = 'initial';
      //   self.data.playStreamList.push(streamInfo);
      // }

      // self.setData({
      //   playStreamList: self.data.playStreamList,
      // }, function () {
      //   // 检查流新增后，是否已经达到房间流上限
      //   if (self.data.playStreamList.length >= self.data.upperStreamLimit) {

      //     self.setData({
      //       reachStreamLimit: true,
      //     }, function () {
      //       wx.showToast({
      //         title: "房间内连麦人数已达上限，不允许新的连麦",
      //         icon: 'none',
      //         duration: 2000
      //       });
      //     });

      //   }

      //   //播放地址更新，需要重新停止再次播放
      //   if (isStreamRepeated) {
      //     self.data.playStreamList.forEach(streamInfo => {
      //       if (streamInfo.streamID == streamid) {
      //         streamInfo.playContext.stop();
      //         streamInfo.playingState = 'initial';
      //         streamInfo.playContext.play();
      //       }
      //     })
      //   }
      // });
    },

    startPlayingStreamList(streamList) {
      let self = this;

      if (streamList.length === 0) {
        console.log(
          ">>>[liveroom-room] startPlayingStream, streamList is null"
        );
        return;
      }

      zg.setPreferPlaySourceType(self.data.preferPlaySourceType);

      console.log(
        ">>>[liveroom-room] startPlayingStream, preferPlaySourceType: ",
        self.data.preferPlaySourceType
      );

      // 获取每个 streamID 对应的拉流 url
      for (let i = 0; i < streamList.length; i++) {
        let streamID = streamList[i].stream_id;
        let anchorID = streamList[i].anchor_id_name; // 推这条流的用户id
        console.log(
          ">>>[liveroom-room] startPlayingStream, playStreamID: " +
            streamID +
            ", pushed by : " +
            anchorID
        );
        zg.startPlayingStream(streamID);
      }
    },

    stopPlayingStreamList(streamList) {
      let self = this;

      if (streamList.length === 0) {
        console.log(
          ">>>[liveroom-room] stopPlayingStream, streamList is empty"
        );
        return;
      }

      let playStreamList = self.data.playStreamList;
      for (let i = 0; i < streamList.length; i++) {
        let streamID = streamList[i].stream_id;

        console.log(
          ">>>[liveroom-room] stopPlayingStream, playStreamID: " + streamID
        );
        zg.stopPlayingStream(streamID);

        // 删除播放流列表中，删除的流
        for (let j = 0; j < playStreamList.length; j++) {
          if (playStreamList[j]["streamID"] === streamID) {
            console.log(
              ">>>[liveroom-room] stopPlayingStream, stream to be deleted: "
            );
            console.log(playStreamList[j]);

            playStreamList[j]["playContext"] &&
              playStreamList[j]["playContext"].stop();

            // let content = '一位观众结束连麦，停止拉流';
            // wx.showToast({
            //   title: content,
            //   icon: 'none',
            //   duration: 2000
            // });

            playStreamList.splice(j, 1);
            break;
          }
        }
      }

      self.setData(
        {
          playStreamList: playStreamList
        },
        function() {
          // 检查流删除后，是否低于房间流上限
          if (
            self.data.playStreamList.length ===
            self.data.upperStreamLimit - 1
          ) {
            self.setData(
              {
                reachStreamLimit: false
              },
              function() {
                if (self.data.loginType === "audience") {
                  wx.showToast({
                    title: "一位观众结束连麦，允许新的连麦",
                    icon: "none",
                    duration: 2000
                  });
                }
              }
            );
          }

          // 主播结束了所有的连麦，切换回 live 模式   （可选）
          if (
            self.data.loginType === "anchor" &&
            self.data.playStreamList.length === 0
          ) {
            // self.switchPusherOrPlayerMode('pusher', 'live');
          }
        }
      );
    },
    
    onPushStateChange(e) {
      console.error("onPushStateChange", e);
      console.error(
        ">>>[liveroom-room] onPushStateChange, code: " +
          e.detail.code +
          ", message:" +
          e.detail.message
      );
      // console.error('onPushStateChange', e.detail.detail.code);
      zg.updatePlayerState(this.data.publishStreamID, e);
    },
    onPushNetStateChange(e) {
      zg.updatePlayerNetStatus(this.data.publishStreamID, e);
    },
    onPlayStateChange(e) {
      console.error("onPlayStateChange", e);
      console.error(
        ">>>[liveroom-room] onPlayStateChange, code: " +
          e.detail.code +
          ", message:" +
          e.detail.message
      );
      zg.updatePlayerState(e.detail.streamID, e);
    },
    onPlayNetStateChange(e) {
      zg.updatePlayerNetStatus(e.detail.streamID, e);
    }
  }
});
