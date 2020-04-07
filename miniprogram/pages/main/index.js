
Page({

    /**
     * 页面的初始数据
     */
    data: {
        canShow: -1,
        entryInfos: [
            {
                icon: "../../resource/interactionLive.png",
                subtitle: '示例',
                title: "电商直播",
                navigateTo: "../roomList/index"
            },
        ]
    },

    onEntryTap(e) {
        if (this.data.canShow) {
            // 防止两次点击操作间隔太快
            var nowTime = new Date();
            if (nowTime - this.data.tapTime < 1000) {
                return;
            }
            var toUrl = this.data.entryInfos[e.currentTarget.id].navigateTo;
            console.log(toUrl);
            wx.navigateTo({
                url: toUrl,
            });
            this.setData({'tapTime': nowTime});
        } else {
            wx.showModal({
                title: '提示',
                content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后再试。',
                showCancel: false
            });
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log(">>> main onLoad");

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        console.log(">>> main onReady");
    },


    /**
     * 生命周期函数--监听页面显示 
     */
    onShow() {
        console.log(">>> main onShow");
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {
        console.log(">>> main onHide");

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {
        console.log(">>> main onUnload");
    },

});