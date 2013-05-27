/**
 * Tests
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var fs = require('fs');
var path = require('path');
var should = require('should');
var brightFlow = require('bright-flow');
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

  it('#载入成功 - 返回模块', function () {
    var hot = new HotReload();
    var filename = filePath('right_normal.js');
    var m = hot.load(filename);
    (typeof m).should.equal('function');
    (typeof m().hello).should.equal('function');
    m().hello('HAHA').should.equal('hello, HAHA');
    (typeof hot.cache[filename]).should.equal('object');
  });

  it('#载入模块成功，模块未更改 - 不重新载入', function () {
    var hot = new HotReload();
    var filename = filePath('right_load_once.js');

    var m = hot.load(filename);
    (typeof m).should.equal('function');
    (typeof m().value).should.equal('function');
    var value = m().value();
    value.should.equal(m().value());

    m = hot.load(filename);
    (typeof m).should.equal('function');
    (typeof m().value).should.equal('function');
    value.should.equal(m().value());
  });

  it('#指定别名方式载入模块', function () {
    var hot = new HotReload();
    var filename = filePath('right_normal.js');
    var alias = 'right';
    hot.load(alias, filename);
    (typeof hot.cache[alias]).should.equal('object');

    var m = hot.require(alias);
    (typeof m).should.equal('function');
    (typeof m().hello).should.equal('function');
    m().hello('HAHA').should.equal('hello, HAHA');
  });

  it('#文件修改后自动更新', function (done) {
    var hot = new HotReload();
    var filename = filePath('.modified_auto_reload.js');

    function modify () {
      fs.writeFileSync(filename, fs.readFileSync(filePath('right_load_once.js')))
    }

    modify();
    var m = hot.load(filename);
    (typeof m).should.equal('function');
    (typeof m().value).should.equal('function');
    var value = m().value();
    value.should.equal(m().value());

    modify();
    setTimeout(function () {
      var m = hot.load(filename);
      (typeof m).should.equal('function');
      (typeof m().value).should.equal('function');
      var value2 = m().value();
      value2.should.equal(m().value());

      value.should.not.equal(value2);

      fs.unlink(filename);
      done();
    }, 1000);
  });

  it('#unload', function () {
    var hot = new HotReload();
    var filename = filePath('right_load_once.js');

    var m = hot.load(filename);
    (typeof m).should.equal('function');
    (typeof m().value).should.equal('function');
    var value = m().value();
    value.should.equal(m().value());

    hot.unload(filename);

    m = hot.load(filename);
    (typeof m).should.equal('function');
    (typeof m().value).should.equal('function');
    var value2 = m().value();
    value2.should.equal(m().value());

    value.should.not.equal(value2);
  });

  it('#reload', function () {
    var hot = new HotReload();
    var filename = filePath('right_load_once.js');

    var m = hot.load(filename);
    (typeof m).should.equal('function');
    (typeof m().value).should.equal('function');
    var value = m().value();
    value.should.equal(m().value());

    m = hot.reload(filename);
    (typeof m).should.equal('function');
    (typeof m().value).should.equal('function');
    var value2 = m().value();
    value2.should.equal(m().value());

    value.should.not.equal(value2);
  });

  it('卸载模块时执行unload函数', function () {
    // TODO
  });

  it('#事件 - load & first load & reload & unload', function (done) {
    var hot = new HotReload();
    var filename = filePath('.modified_auto_reload.js');

    function modify () {
      fs.writeFileSync(filename, fs.readFileSync(filePath('right_load_once.js')))
    }

    var counter = {
      load:   0,
      fload:  0,
      reload: 0,
      unload: 0
    };

    hot.on('load', function (f) {
      f.should.equal(filename);
      counter.load++;
    });

    hot.on('first load', function (f) {
      f.should.equal(filename);
      counter.fload++;
    });

    hot.on('reload', function (f) {
      f.should.equal(filename);
      counter.reload++;
    });

    hot.on('unload', function (f) {
      f.should.equal(filename);
      counter.unload++;
    });

    var values = [];

    brightFlow.series()
    .do(function (done) {
      modify();
      var m = hot.load(filename);
      (typeof m).should.equal('function');
      (typeof m().value).should.equal('function');
      values[0] = m().value();
      values[0].should.equal(m().value());
      setTimeout(done, 1000);
    })
    .do(function (done) {
      modify();
      var m = hot.load(filename);
      (typeof m).should.equal('function');
      (typeof m().value).should.equal('function');
      values[1] = m().value();
      values[1].should.equal(m().value());
      setTimeout(done, 1000);
    })
    .do(function (done) {
      modify();
      var m = hot.load(filename);
      (typeof m).should.equal('function');
      (typeof m().value).should.equal('function');
      values[2] = m().value();
      values[2].should.equal(m().value());
      setTimeout(done, 1000);
    })
    .end(function (err) {
      should.equal(err, null);

      counter.load.should.equal(3);
      counter.fload.should.equal(1);
      counter.unload.should.equal(2);
      counter.reload.should.equal(2);

      value[0].should.not.equal(value[1]);
      value[0].should.not.equal(value[2]);
      value[1].should.not.equal(value[2]);

      fs.unlink(filename);
      done();
    });
  });

  it('#事件 - error - 调用模块的unload时出错', function () {
    // TODO
  });

});