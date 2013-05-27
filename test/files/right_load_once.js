// 正确的模块文件，保证只载入一次
exports.load = function (exports) {
  var value = Math.random();
  exports.value = function () {
    return value;
  };
};