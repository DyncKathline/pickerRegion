// components/pickerRegion/index.js
import { getAreaInfo } from "../../utils/area.js";

Component({
  options: {
    addGlobalClass: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    disabled: {
      type: null, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: false // 属性初始值（可选），如果未指定则会根据类型选择一个
    },
    placeholder: {
      type: null, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: null // 属性初始值（可选），如果未指定则会根据类型选择一个
    },
    multiIndex: {
      type: Array,
      value: [0, 0, 0], //省市[0, 0]，省市区[0, 0, 0](默认)
      observer(val, oldVal) {
        console.log("multiIndex", val, oldVal);
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    areasString: "",
    multiArray: []
  },
  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached() {},
    ready() {
      this.getCityInfo();
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //获取数据库数据
    getCityInfo() {
      // this.setData({
      //   areasString: this.data.placeholder
      // });
      const region = wx.getStorageSync("region");
      if (region) {
        let multiIndex = this.data.multiIndex;
        this.setData({
          multiArray:
            multiIndex.length === 2
              ? [region, region[multiIndex[0]]._child]
              : [region, region[multiIndex[0]]._child, region[multiIndex[0]]._child[multiIndex[1]]._child],
          // multiIndex: multiIndex.length === 2 ? [0, 0] : [0, 0, 0]
        });
        console.log("getCustomerCity  getStorageSync", this.data);
        return;
      }
      getAreaInfo(res => {
        const region = res.data;
        wx.setStorage({
          key: "region",
          data: region
        });
        let multiIndex = this.data.multiIndex;
        this.setData({
          multiArray:
            this.data.multiIndex.length === 2
              ? [region, region[multiIndex[0]]._child]
              : [region, region[multiIndex[0]]._child, region[multiIndex[0]]._child[multiIndex[1]]._child],
          // multiIndex: this.data.multiIndex.length === 2 ? [0, 0] : [0, 0, 0]
        });
        console.log("getCustomerCity", this.data);
      });
    },
    //点击确定
    pickerChange(e) {
      // console.log('picker发送选择改变，携带值为', e.detail.value, this.data);
      let multiIndex = e.detail.value;
      let multiArray = this.data.multiArray;
      if (this.data.multiIndex.length === 2) {
        let areasString =
          multiArray[0][multiIndex[0]].name +
          " " +
          (multiArray[1].length > 0 ? multiArray[1][multiIndex[1]].name : "");
        this.setData({
          multiIndex: multiIndex,
          areasString: areasString
        });
        const values = [multiArray[0][multiIndex[0]]];
        multiArray[1].length > 0 && values.push(multiArray[1][multiIndex[1]]);
        // console.log("onPickerChange", { value: areasString, values });
        this.triggerEvent("onPickerChange", { value: areasString, values });
      } else {
        let areasString =
          multiArray[0][multiIndex[0]].name +
          " " +
          (multiArray[1].length > 0 ? multiArray[1][multiIndex[1]].name : "") +
          " " +
          (multiArray[2].length > 0 ? multiArray[2][multiIndex[2]].name : "");
        this.setData({
          multiIndex: multiIndex,
          areasString: areasString
        });
        const values = [multiArray[0][multiIndex[0]]];
        multiArray[1].length > 0 && values.push(multiArray[1][multiIndex[1]]);
        multiArray[2].length > 0 && values.push(multiArray[2][multiIndex[2]]);
        console.log("onPickerChange", { value: areasString, values });
        this.triggerEvent("onPickerChange", { value: areasString, values });
      }
    },
    pickerCancel(e) {
      // console.log("取消");
      // this.setData({
      //   multiArray: this.data.multiArray,
      //   multiIndex: this.data.multiIndex
      // });
    },
    //滑动
    pickerColumnChange(e) {
      // console.log('修改的列为', e.detail.column, '，值为', e.detail.value, this.data);
      let data = {
        multiArray: this.data.multiArray,
        multiIndex: this.data.multiIndex
      };
      if (this.data.multiIndex.length === 2) {
        //更新滑动的第几列e.detail.column的数组下标值e.detail.value
        data.multiIndex[e.detail.column] = e.detail.value;
        //如果更新的是第一列“省”，第二列“市”和第三列“区”的数组下标置为0
        if (e.detail.column == 0) {
          data.multiIndex = [e.detail.value, 0];
        } else if (e.detail.column == 1) {
          //如果更新的是第二列“市”，第一列“省”的下标不变，第三列“区”的数组下标置为0
          data.multiIndex = [data.multiIndex[0], e.detail.value];
        }
        let temp = data.multiArray[0];
        // console.log(temp[data.multiIndex[0]]._child, temp[data.multiIndex[0]]);
        if (temp[data.multiIndex[0]]._child.length > 0) {
          //如果第二列“市”的个数大于0,通过multiIndex变更multiArray[1]的值
          data.multiArray[1] = temp[data.multiIndex[0]]._child;
        }
      } else {
        //更新滑动的第几列e.detail.column的数组下标值e.detail.value
        data.multiIndex[e.detail.column] = e.detail.value;
        //如果更新的是第一列“省”，第二列“市”和第三列“区”的数组下标置为0
        if (e.detail.column == 0) {
          data.multiIndex = [e.detail.value, 0, 0];
        } else if (e.detail.column == 1) {
          //如果更新的是第二列“市”，第一列“省”的下标不变，第三列“区”的数组下标置为0
          data.multiIndex = [data.multiIndex[0], e.detail.value, 0];
        } else if (e.detail.column == 2) {
          //如果更新的是第三列“区”，第一列“省”和第二列“市”的值均不变。
          data.multiIndex = [
            data.multiIndex[0],
            data.multiIndex[1],
            e.detail.value
          ];
        }
        let temp = data.multiArray[0];
        // console.log(temp[data.multiIndex[0]]._child, temp[data.multiIndex[0]]);
        if (temp[data.multiIndex[0]]._child.length > 0) {
          //如果第二列“市”的个数大于0,通过multiIndex变更multiArray[1]的值
          data.multiArray[1] = temp[data.multiIndex[0]]._child;
          let areaArr =
            temp[data.multiIndex[0]]._child[data.multiIndex[1]]._child;
          //如果第三列“区”的个数大于0,通过multiIndex变更multiArray[2]的值；否则赋值为空数组
          data.multiArray[2] = areaArr && areaArr.length > 0 ? areaArr : [];
        } else {
          //如果第二列“市”的个数不大于0，那么第二列“市”和第三列“区”都赋值为空数组
          data.multiArray[1] = [];
          data.multiArray[2] = [];
        }
      }

      this.setData(data);
    }
  }
});
