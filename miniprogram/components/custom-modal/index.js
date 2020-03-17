// components/custom-modal/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isShowModal: { //是否显示整个modal框
      type: Boolean,
      value: false
    },
    isShowTitle: { // 是否显示标题
      type: Boolean,
      value: false
    },
    modalTitle: { // 标题内容
      type: String,
      value: "标题"
    },
    placeholder: { // input框提示文字
      type: String,
      value: "请输入提示文字"
    },
    showDesc: { // 备注文字
      type: String,
      value: ""
    },
    inputType: { // input框类型
      type: String,
      value: 'text'
    },
    isShowInput: { // 是否显示 input框
      type: Boolean,
      value: false
    },
    inputVal: {
      type: [String, Number],
      value: ''
    },
    top: {
      type: Number,
      value: 0
    },
    hasConfirm: {
      type: Boolean,
      value: false
    },
    hasCancel: {
      type: Boolean,
      value: false
    },
    confirmText: {
      type: String,
      value: '确定'
    },
    cancelText: {
      type: String,
      value: '取消'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isFocus: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindFous() {
			this.setData({
				isFocus:true
			})
		},
		bindBlur() { 
			this.setData({
				isFocus: false
			})
		},
		_bindInput(e) {
			this.triggerEvent('customBindInput', e.detail.value)
		},
		cancel() { 
			this.triggerEvent('cancel')
		},
		_confirm(e) {
			this.triggerEvent("confirm"); 
		}
  }
})
