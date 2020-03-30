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
    // let { tokenURL,cgi_token, appSign, tokenURL2 } = getApp().globalData;
    let tokenURL = "https://wssliveroom-demo.zego.im/token";  // 即构demo 获取token的专用接口，开发者请填写appSign 使用临时接口
    let appSign = ''; // 填写即构控制台获取的appSign
    let cgi_token = '';
    let tokenURL2 = "https://sig-wstoken.zego.im:8282/tokenverify"; // 即构提供的测试环境的测试接口，正式环境要由业务服务端实现
    if (appSign) {
        console.log('>>> get token first type')
        const now = new Date().getTime();
        const time = Math.floor(now / 1000 + 30 * 60);
        return _request({
            url: tokenURL2,
            data: {
                app_id: appid,
                app_secret: appSign,
                id_name: userID,
                nonce: now,
                expired: time
            },
            testMode: false
        })
    } else {
        console.log('>>> get token second type')
        return _request({
            url: tokenURL,
            data: {
                app_id: appid,
                id_name: userID,
                cgi_token
            },
            testMode: true
        })
    }
}

module.exports = {
    getLoginToken,
};