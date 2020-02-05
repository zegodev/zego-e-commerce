// components/zego-navigator/zegonavigator.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
         native: {type: Boolean, value: false},
         navBarHeight: {type: Number, value: 0},
         statusBarHeight: {type: Number, value: 0},
    },

    created() {
        
    },
    /**
     * 组件的初始数据
     */
    data: {
    },

    ready() {
        // let systemInfo = wx.getSystemInfoSync();
        // let rect = wx.getMenuButtonBoundingClientRect();
        // // console.log(rect.top, systemInfo.statusBarHeight);
        // let gap = rect.top - systemInfo.statusBarHeight; //动态计算每台手机状态栏到胶囊按钮间距
        // let navBarHeight = gap + rect.bottom;
        // // console.log('navBarHeight', rect, navBarHeight);
        // this.setData({
        //     navBarHeight,
        //     statusBarHeight: systemInfo.statusBarHeight
        // });
    },
    /**
     * 组件的方法列表
     */
    methods: {
        back() {
            console.log('back');
            if(getCurrentPages().length>1){
                wx.navigateBack();
            }else{
                wx.navigateTo({
                    url:'/pages/main/main'
                });
            }
        },
    }
});
