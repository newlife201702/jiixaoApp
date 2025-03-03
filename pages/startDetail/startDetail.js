Page({
    data: {
      productCode: '', // 产品代码
      taskNumber: '', // 任务号
      batchNumber: '', // 批次号
      drawingNumber: '', // 图号
      productName: '', // 产品名称
      employeeName: '', // 员工ID
      deviceId: '', // 设备ID
      processList: [], // 工序列表
      selectedProcess: '', // 选择的工序
      startTime: '', // 开始时间
    },
    onLoad(options) {
      const qrCodeData = JSON.parse(options.qrCodeData); // 解析二维码数据
      const processList = [];
      for (let i = 5; i < qrCodeData.length; i += 2) {
        if (qrCodeData[i] === '') break; // 遇到空值停止
        processList.push(`${qrCodeData[i]} (${qrCodeData[i + 1]})`);
      }
      this.setData({
        productCode: qrCodeData[0],
        taskNumber: qrCodeData[1],
        batchNumber: qrCodeData[2],
        drawingNumber: qrCodeData[3],
        productName: qrCodeData[4],
        processList,
        employeeName: getApp().globalData.employeeName, // 从全局数据获取员工姓名
      });
    },
    // 设备ID输入
    onDeviceIdInput(e) {
      this.setData({ deviceId: e.detail.value });
    },
    // 选择工序
    onProcessChange(e) {
      this.setData({ selectedProcess: this.data.processList[e.detail.value] });
    },
    // 选择开始时间
    onStartTimeChange(e) {
      this.setData({ startTime: e.detail.value });
    },
    // 提交
    submit() {
        console.log('this.data', this.data);
        const app = getApp();
      const { productCode, taskNumber, batchNumber, drawingNumber, productName, employeeName, deviceId, selectedProcess, startTime } = this.data;
      if (!selectedProcess || !startTime) {
        wx.showToast({ title: '请完整填写信息', icon: 'none' });
        return;
      }
      // 将开始时间转换为 Unix 时间戳
      const startTimestamp = new Date(startTime).getTime();
      console.log('startTimestamp', startTimestamp);
      wx.request({
        url: `https://open.feishu.cn/open-apis/bitable/v1/apps/${app.globalData.apptoken}/tables/${app.globalData.tableid}/records/search`,
        method: 'POST',
        header: {
            Authorization: `Bearer ${app.globalData.tenantAccessToken}`,
            'Content-Type': 'application/json; charset=utf-8',
        },
        data: {
            filter: {
                conjunction: "and",
                conditions: [
                  {
                    field_name: "任务号",
                    operator: "is",
                    value: [taskNumber]
                  },
                  {
                    field_name: "批次号",
                    operator: "is",
                    value: [batchNumber]
                  },
                  {
                    field_name: "工序",
                    operator: "is",
                    value: [selectedProcess.split(' (')[0]]
                  }
                ]
            }
        },
        success(res1) {
            if (res1.data.data.items.length === 0) {
                wx.request({
                    url: `https://open.feishu.cn/open-apis/bitable/v1/apps/${app.globalData.apptoken}/tables/${app.globalData.tableid}/records`,
                    method: 'POST',
                    header: {
                        Authorization: `Bearer ${getApp().globalData.tenantAccessToken}`,
                        'Content-Type': 'application/json; charset=utf-8',
                    },
                    data: {
                        fields: {
                            '产品代码': productCode,
                            '任务号': taskNumber,
                            '批次号': batchNumber,
                            '图号': drawingNumber,
                            '产品名称': productName,
                            '员工ID': employeeName,
                            '设备ID': deviceId,
                            '工序': selectedProcess.split(' (')[0],
                            '工序编号': selectedProcess.split(' (')[1].replace(')', ''),
                            '开始时间': startTimestamp,
                            '状态': '1', // 状态字段赋值1
                            '是否同步': 0
                        }
                    },
                    success(res) {
                        wx.showToast({ title: '提交成功' });
                        setTimeout(() => {
                            wx.navigateBack();
                        }, 1000);
                    },
                    fail(err) {
                        wx.showToast({ title: '提交失败', icon: 'none' });
                    }
                });
            } else {
                wx.showToast({ title: '已有开工数据', icon: 'none' });
            }
        },
        fail(err) {
        wx.showToast({ title: '查询失败', icon: 'none' });
        }
        });
    }
  });