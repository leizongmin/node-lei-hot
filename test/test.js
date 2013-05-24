/**
 * Tests
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var path = require('path');
var should = require('should');
var HotReload = require('../').HotReload;


function filePath (f) {
  return path.resolve(__dirname, 'files', f);
}

describe('HotReload', function () {

  it('#载入不存在的文件 - 抛出异常', function () {
    try {
      new HotReload().load('abc');
      var throwsError = false;
    } catch (err) {
      var throwsError = true;
    }
    throwsError.should.equal(true);
  });

  it('#载入文件时出错 - 抛出异常', function () {
    try {
      new HotReload().load(filePath('syntax_error.js'));
      var throwsError = false;
    } catch (err) {
      var throwsError = true;
    }
    throwsError.should.equal(true);
  });

  it('#载入不符合格式的文件 - 抛出异常', function () {
    try {
      new HotReload().load(filePath('wrong_format.js'));
      var throwsError = false;
    } catch (err) {
      var throwsError = true;
    }
    throwsError.should.equal(true);
  });

});