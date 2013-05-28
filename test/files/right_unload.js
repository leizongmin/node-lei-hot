// 正确的模块文件，包含unload处理代码

// 此数据用于共享
var share = {};

exports.load = function (exports) {
  exports.set = function (v) {
    share.value = v;
    return share;
  };
};

exports.unload = function () {
  share.value = null;
};
