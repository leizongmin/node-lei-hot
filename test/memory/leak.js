/**
 * Memory Leak Tests
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var path = require('path');
var fs = require('fs');
var hot = require('../../');
var filename = path.resolve(__dirname, '../files/right_normal.js');


function memRss () {
  return process.memoryUsage().rss;
}

function printInfo (title, times, rss, spent) {
  console.log('"%s" %d times', title, times);
  console.log('\tincreased %dMB memory, spent %dms', (rss / 1024 / 1024).toFixed(2), spent);
  console.log('');
}

function test (title, times, fn) {
  var rss1 = memRss();
  var t1 = Date.now();
  for (var i = 0; i < times; i++) {
    fn();
  }
  var t2 = Date.now();
  var rss2 = memRss();
  printInfo(title, times, rss2 - rss1, t2 - t1);
}



var count = 1000;

test('require() & delete require.cache[f]', count, function () {
  require(filename);
  delete require.cache[filename];
});
test('fs.watch() & w.close()', count, function () {
  var w = fs.watch(filename, function (event, filename) { });
  w.close();
});
test('hot.load() & hot.unload()', count, function () {
  var m = hot.load(filename);
  hot.unload(filename);
});
test('hot.load() & hot.reload()', count, function () {
  var m = hot.load(filename);
  hot.reload(filename);
});
hot.unload(filename);
