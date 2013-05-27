// 正确的模块文件
exports.load = function (exports) {
  exports.hello = function (n) {
    return 'hello, ' + n;
  };
};