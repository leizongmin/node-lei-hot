lei-hot [![Build Status](https://secure.travis-ci.org/leizongmin/node-lei-hot.png?branch=master)](http://travis-ci.org/leizongmin/node-lei-hot) [![Dependencies Status](https://david-dm.org/leizongmin/node-lei-hot.png)](http://david-dm.org/leizongmin/node-lei-hot)
=======

[![Greenkeeper badge](https://badges.greenkeeper.io/leizongmin/node-lei-hot.svg)](https://greenkeeper.io/)


初始化

```
var hot = require('lei-hot');

// 注册全局的事件处理
hot.on('load', function (file, exports) {
  debug('成功载入模块%s', file);
});
// 其他事件：
// load         文件成功载入时触发(重载时也会触发此事件)
// reload       文件重新成功载入时触发
// unload       文件卸载后触发
// error        载入文件出错时触发

// 预载入文件
hot.load('name', 'path');   // 文件名为绝对路径（不是绝对路径会以当前工作目录开始）

// 卸载文件
hot.unload('name');

// 使用
var utils = hot.require('utils'); // 此时utils是该文件的一个引用，需要用utils()来获取最新代码
utils().doSomething();
```

热更新文件格式

```
exports.load = function (exports) {
  exports.xxx = yyy;
  // 返回exports来输出
  return exports;
};

exports.unload = function (exports) {
  // 文件被卸载前执行
  // exports是当前文件输出的对象
}
```

说明：

* 不要在其他代码中引用热更新文件所输出的对象
* 所有对热更新代码中的数据/函数操作，必须是即时获取的
* 尽量少使用 `.unload()` 来卸载代码（可能会引发内存泄漏），如果要强制重载，使用 `.reload()`


License
========

```
Copyright (c) 2013 Zongmin Lei(雷宗民) <leizongmin@gmail.com>
http://ucdok.com

The MIT License

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```