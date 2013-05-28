// unload时出错
exports.load = function (exports) {

};
exports.unload = function () {
  throw new Error('Unload error');
};