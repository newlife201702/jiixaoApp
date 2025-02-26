// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    const that = this;
    // 登录
    wx.login({
        success: res => {
          if (res.code) {
            wx.request({
            //   url: 'http://localhost:3000/auth',
              url: 'https://8f98-2409-8929-7058-9626-462-76b0-dbe0-14b2.ngrok-free.app/auth',
              method: 'POST',
              data: { code: res.code },
              success: authRes => {
                console.log('authRes.data', authRes.data);
                if (authRes.data.openid) {
                // if (false) {
                console.log('if');
                that.globalData.isRegistered = true;
                that.globalData.openid = authRes.data.openid;
                that.globalData.employeeName = authRes.data.name;
                } else {
                console.log('else');
                  wx.showModal({
                    title: '提示',
                    content: '用户未注册，请联系管理员',
                    showCancel: false
                  });
                }
                // 触发全局事件，通知页面更新
                if (that.globalDataChangeCallback) {
                    that.globalDataChangeCallback();
                  }
              }
            });
          }
        }
      });

    // 获取 tenant_access_token
    async function getTenantAccessToken() {
        const now = Math.floor(Date.now() / 1000);
        if (that.globalData.tenantAccessToken && now < that.globalData.tokenExpireTime) {
        return; // 如果 token 未过期，直接返回
        }

        wx.request({
            url: 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
            method: 'POST',
            data: { app_id: 'cli_a7eae5f640f95013', app_secret: 'kgljbox36vFqId4Zp3F7Lg7phiqx7AcJ' },
            success: authRes => {
              console.log('authRes.data', authRes.data);
              if (authRes.data.tenant_access_token) {
              that.globalData.tenantAccessToken = authRes.data.tenant_access_token;
              that.globalData.tokenExpireTime = now + authRes.data.expire - 60; // 提前 60 秒刷新
              } else {
                  wx.showModal({
                  title: '提示',
                  content: '获取 tenant_access_token 失败',
                  showCancel: false
                });
              }
            }
          });
    }

    getTenantAccessToken();
    // 定时刷新 token
    setInterval(getTenantAccessToken, 60 * 60 * 1000); // 每小时刷新一次
  },
  // 注册全局回调函数
  setGlobalDataChangeCallback: function (callback) {
    this.globalDataChangeCallback = callback;
  },
  globalData: {
    userInfo: null,
    isRegistered: false, // 默认未注册
    openid: null,
    employeeName: null,
    tenantAccessToken: null,
    tokenExpireTime: 0
  }
})
