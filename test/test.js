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

  it('#载入成功 - 返回模块 - 输出函数（非默认的对象）', function () {
    var hot = new HotReload();
    var filename = filePath('right_exports_function.js');
    var m = hot.load(filename);
    (typeof m).should.equal('function');
    (typeof m()).should.equal('function');
    m()('HAHA').should.equal('hello, HAHA');
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
    var filename = filePath('.modified_auto_reload_1.js');

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
    var hot = new HotReload();
    var filename = filePath('right_unload.js');

    var m = hot.load(filename);
    var value = Math.random();
    var share = m().set(value);
    (typeof share.should).should.equal('object');
    share.value.should.equal(value);

    hot.unload(filename);
    should.equal(share.value, null);
  });

  it('#事件 - load', function () {
    var hot = new HotReload();
    var filename = filePath('right_load_once.js');

    var counter = 0;
    hot.on('load', function (f) {
      counter++;
    });

    hot.load(filename);
    counter.should.equal(1);
  });

  it('#事件 - reload', function () {
    var hot = new HotReload();
    var filename = filePath('right_load_once.js');

    var counter1 = 0;
    var counter2 = 0;
    hot.on('load', function (f) {
      f.should.equal(filename);
      counter1++;
    });
    hot.on('reload', function (f) {
      f.should.equal(filename);
      counter2++;
    });

    hot.load(filename);
    hot.reload(filename);
    hot.reload(filename);
    counter1.should.equal(3);
    counter2.should.equal(2);
  });

  it('#事件 - unload', function () {
    var hot = new HotReload();
    var filename = filePath('right_load_once.js');

    var counter1 = 0;
    var counter2 = 0;
    var counter3 = 0;
    hot.on('load', function (f) {
      f.should.equal(filename);
      counter1++;
    });
    hot.on('reload', function (f) {
      f.should.equal(filename);
      counter2++;
    });
    hot.on('unload', function (f) {
      f.should.equal(filename);
      counter3++;
    });

    hot.load(filename);
    hot.reload(filename);
    hot.reload(filename);
    hot.unload(filename);
    counter1.should.equal(3);
    counter2.should.equal(2);
    counter3.should.equal(3);
  });

  it('#事件 - error - 卸载模块时出错', function () {
    var hot = new HotReload();
    var filename = filePath('wrong_unload.js');

    var counter = 0;
    hot.on('error', function (err) {
      err.should.instanceof(Error);
      console.log(err)
      counter++;
    });

    var m = hot.load(filename);
    hot.unload(filename);
    counter.should.equal(1);
  });

});