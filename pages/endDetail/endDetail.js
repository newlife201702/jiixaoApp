Page({
    data: {
      productCode: '', // 产品代码
      taskNumber: '', // 任务号
      batchNumber: '', // 批次号
      drawingNumber: '', // 图号
      productName: '', // 产品名称
      employeeName: '', // 员工ID
      processList: [], // 工序列表
      selectedProcess: '', // 选择的工序
      endTime: '', // 完成时间
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
    // 选择工序
    onProcessChange(e) {
      this.setData({ selectedProcess: this.data.processList[e.detail.value] });
    },
    // 选择完成时间
    onEndTimeChange(e) {
      this.setData({ endTime: e.detail.value });
    },
    // 提交
    submit() {
      const { productCode, taskNumber, batchNumber, drawingNumber, productName, employeeName, selectedProcess, endTime } = this.data;
      const endTimestamp = new Date(endTime).getTime();
      wx.request({
        url: `https://open.feishu.cn/open-apis/bitable/v1/apps/DophbeShaaRCFysppoPcY0m4nre/tables/tblEKWjU7T5SQKBH/records/search`,
        method: 'POST',
        header: {
            Authorization: `Bearer ${getApp().globalData.tenantAccessToken}`,
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
                    value: [selectedProcess]
                  }
                ]
            }
        },
        success(res1) {
            wx.request({
                url: `https://open.feishu.cn/open-apis/bitable/v1/apps/DophbeShaaRCFysppoPcY0m4nre/tables/tblEKWjU7T5SQKBH/records/${res1.data.data.items[0].record_id}`,
                method: 'PUT',
                header: {
                    Authorization: `Bearer ${getApp().globalData.tenantAccessToken}`,
                    'Content-Type': 'application/json; charset=utf-8',
                },
                data: {
                    fields: {
                        // '产品代码': productCode,
                        // '任务号': taskNumber,
                        // '批次号': batchNumber,
                        // '图号': drawingNumber,
                        // '产品名称': productName,
                        // '员工ID': employeeName,
                        // '设备ID': deviceId,
                        // '工序': selectedProcess,
                        '完成时间': endTimestamp,
                        '状态': '3', // 状态字段赋值3
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
        },
        fail(err) {
          wx.showToast({ title: '查询失败', icon: 'none' });
        }
      });
    }
  });