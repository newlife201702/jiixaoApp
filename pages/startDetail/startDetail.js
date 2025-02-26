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
      const { productCode, taskNumber, batchNumber, drawingNumber, productName, employeeName, deviceId, selectedProcess, startTime } = this.data;
      // 将开始时间转换为 Unix 时间戳
      const startTimestamp = new Date(startTime).getTime();
      wx.request({
        url: `https://open.feishu.cn/open-apis/bitable/v1/apps/DophbeShaaRCFysppoPcY0m4nre/tables/tblEKWjU7T5SQKBH/records`,
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
                '工序': selectedProcess,
                '开始时间': startTimestamp,
                '状态': '1', // 状态字段赋值1
            }
        },
        success(res) {
          wx.showToast({ title: '提交成功' });
          wx.navigateBack();
        },
        fail(err) {
          wx.showToast({ title: '提交失败', icon: 'none' });
        }
      });
    }
  });