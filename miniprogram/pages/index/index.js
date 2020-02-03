var plugin = requirePlugin("zego-e-commerce");
Page({
  data: {
    items: [],
    currentItem: 0
  },
  onLoad: function () {
    var world = plugin.answer;
  },
  onShow: function() {
    plugin.sayHello();

  },
  addItem: function () {
    this.data.items.push(this.data.currentItem++);
    this.setData({
      items: this.data.items,
      currentItem: this.data.currentItem
    });
  }
});