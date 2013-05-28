// 正确的模块文件，输出一个函数
exports.load = function (exports) {
  exports = function (n) {
    return 'hello, ' + n;
  };
  return exports;
};
