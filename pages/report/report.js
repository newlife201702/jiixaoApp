Page({
    data: {
      qrCodeData: null, // 存储扫码结果
      isButtonDisabled: true, // 默认禁用按钮
    },
    onLoad: function () {
        const isRegistered = getApp().globalData.isRegistered;
        console.log('report_isRegistered', isRegistered);
        this.setData({ isButtonDisabled: !isRegistered });
      },
    // 扫码
    scanCode: function () {
        if (this.data.isButtonDisabled) return; // 如果按钮禁用，直接返回
      const that = this;
      wx.scanCode({
        success(res) {
          const qrCodeData = res.result.split('&&'); // 解析二维码数据
          that.setData({ qrCodeData });
          wx.navigateTo({
            url: `/pages/reportDetail/reportDetail?qrCodeData=${JSON.stringify(qrCodeData)}`,
          });
        },
        fail(err) {
          wx.showToast({ title: '扫码失败', icon: 'none' });
        }
      });
    }
  });