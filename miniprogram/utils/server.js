function _request({url, data = {}, testMode = true}) {
    return new Promise((res, rej) => {
        wx.request({
            url,
            data,
            header: {
                'content-type': 'text/plain'
            },
            success(result) {
                console.log(">>>[liveroom-room] get login token success. token is: " + result.data);
                if (result.statusCode != 200) {
                    return;
                }
                if (testMode) {
                    res(result.data);
                } else {
                    const token = /token:\s(.+)/.exec(result.data)&&/token:\s(.+)/.exec(result.data)[1];
                    res(token)
                }
            },
            fail(e) {
                console.log(">>>[liveroom-room] get login token fail, error is: ")
                console.log(e);
                rej(e)
            }
        })
    })
}

function getLoginToken(userID, appid) {
    let { tokenURL, liveAppID } = getApp().globalData;
    let isDemoApp = [1739272706].includes(liveAppID);
    let url = isDemoApp ? 'https://wssliveroom-demo.zego.im/token' : tokenURL;
    let data = {
        app_id: appid,
        id_name: userID,
    }
    return new Promise((res, rej) => {
        return wx.request({
            url,
            data,
            success(result) {
                console.log(">>>[liveroom-room] get login token success. token is: " + result.data);
                if (result.statusCode != 200) {
                    return;
                }
                res(result.data);

            },
            fail(e) {
                console.log(">>>[liveroom-room] get login token fail, error is: ")
                console.log(e);
                rej(e)
            }
        })
    })
}

module.exports = {
    getLoginToken,
};