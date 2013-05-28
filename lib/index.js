/**
 * Hot Reload
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var util = require('util');
var events = require('events');
var path = require('path');
var fs = require('fs');
var debug = require('debug')('lei-hot');


/**
 * HotReload
 */
function HotReload () {
  this.cache = {};
}

util.inherits(HotReload, events.EventEmitter);

/**
 * 注册并载入热更新文件
 *
 * @param {String} name
 * @param {String} filename
 * @return {Mixed}
 */
HotReload.prototype.load = function (name, filename) {
  if (!filename) {
    // 如果没有指定第二个参数，则第一个参数为文件名
    filename = path.resolve(name);
    name = filename;
  } else {
    filename = path.resolve(filename);
  }

  //　已加载过
  if (this.cache[name]) {
    if (this.cache[name].filename === filename) {
      debug('%s has already loaded before.', name);
      return this.require(name);
    } else {
      // 如果文件名不一样，先卸载在重新加载
      this.unload(name);
      return this.load(name, filename);
    }
  }

  // 尝试载入文件
  try {
    this.cache[name] = {
      name:     name,
      filename: filename
    }
    this._load(name);
  } catch (err) {
    delete this.cache[name];
    throw err;
  }

  // 首次加载，监视文件更改
  this._watch(name);

  // 返回文件输出
  return this.require(name);
};

/**
 * 卸载文件
 *
 * @param {String} name
 */
HotReload.prototype.unload = function (name) {
  var m = this.cache[name];
  if (m) {
    debug('Unload %s', name);

    // 卸载文件
    this._unload(name);

    // 删除cache
    delete this.cache[name];

    // 关闭文件监控
    m.watch.close();
  }
};

/**
 * 重载文件
 *
 * @param {String} name
 */
HotReload.prototype.reload = function (name) {
  var m = this.cache[name];
  if (m) {
    debug('Unload %s', name);

    // 卸载文件
    this._unload(name);

    // 触发unload事件
    this.emit('reload', name);

    this._load(name);

    return this.require(name);
  }
};

/**
 * 处理载入的文件
 *
 * @param {String} name
 */
HotReload.prototype._load = function (name) {
  // 载入文件
  var filename = this.cache[name].filename;
  var m = require(filename);
  delete require.cache[filename];

  if (!(m && m.load && typeof m.load === 'function')) {
    throw new Error('This file must exports the "load" function.');
  }

  // 调用文件中的load()函数，并设置输出
  var exports = {};
  exports = m.load(exports) || exports;
  this.cache[name].exports = exports;
  if (typeof m.unload === 'function') {
    this.cache[name].unload = m.unload;
  }

  // 触发load事件
  this.emit('load', name);
};

/**
 * 卸载文件处理
 *
 * @param {String} name
 */
HotReload.prototype._unload = function (name) {
  var m = this.cache[name];

  if (!m) return debug('Cannot find %s.', name);

  // 如果有unload函数，则先执行
  if (typeof m.unload === 'function') {
    try {
      m.unload(m.exports);
    } catch (err) {
      debug('Unload %s %s', name, err.stack);
      this.emit('error', err, name);
      return;
    }
  }

  // 触发unload事件
  this.emit('unload', name);

  // 删除exports
  delete m.exports;
};

/**
 * 监听文件
 *
 * @param {String} name
 */
HotReload.prototype._watch = function (name) {
  debug('Watch %s', name);
  var m = this.cache[name];
  m.watch = fs.watch(m.filename, this._bindWatchHandle(name));
};

HotReload.prototype._bindWatchHandle = function (name) {
  var fn = function (event, filename) {
    var me = this;
    // 检查如果文件不存在，则卸载文件，否则重载文件
    fs.exists(filename, function (exists) {
      if (exists) {
        debug('%s has been modified.', name);
        me.reload(name);
      } else {
        me.unload(name);
        debug('%s has been deleted.', name);
      }
    });
  };
  return fn.bind(this);
};

/**
 * 引用文件
 *
 * @param {String} name
 * @return {Function}
 */
HotReload.prototype.require = function (name) {
  debug('Require %s', name);

  if (typeof this.cache[name].handle !== 'function') {
    this.cache[name].handle = this._bindRequireHandle(name);
  }

  return this.cache[name].handle;
};

HotReload.prototype._bindRequireHandle = function (name) {
  var fn = function () {
    if (this.cache[name]) {
      return this.cache[name].exports; 
    } else {
      throw new Error('HotReload module "' + name + '" is not exists!');
    }
  };
  return fn.bind(this);
};


exports = module.exports = new HotReload();
exports.HotReload = HotReload;
