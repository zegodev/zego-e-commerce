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
