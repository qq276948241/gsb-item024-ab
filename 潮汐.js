#!/usr/bin/env node
"use strict";

// 不带参数只报当天有几次高低潮：高潮2次、低潮2次。
// 带上港口和日期时，前面仍是这两行，后面再写高潮时刻和低潮时刻。

var 港口晚到分钟 = { 上海: 0, 青岛: 73, 厦门: 148 };
var 错误话 = "没法报潮：只认上海、青岛、厦门，日期要写成四位年、两位月、两位日\n";
var 每月天数 = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function 是闰年(年) {
  return 年 % 400 === 0 || (年 % 4 === 0 && 年 % 100 !== 0);
}

// 从2000-01-01起算天数，当天是第0天，更早的日子是负天数。
function 算天数(年, 月, 日) {
  var 纪元;
  if (年 === 0) {
    纪元 = -366;
  } else {
    纪元 = (年 - 1) * 365 + Math.floor((年 - 1) / 4) -
      Math.floor((年 - 1) / 100) + Math.floor((年 - 1) / 400);
  }
  var 当年已过天数 = 0;
  for (var i = 1; i < 月; i++) {
    当年已过天数 += 每月天数[i - 1];
  }
  if (月 > 2 && 是闰年(年)) {
    当年已过天数 += 1;
  }
  var 序号 = 纪元 + 当年已过天数 + 日;
  return 序号 - 730120;
}

function 落到当天(分钟) {
  分钟 = 分钟 % 1440;
  while (分钟 < 0) {
    分钟 += 1440;
  }
  while (分钟 >= 1440) {
    分钟 -= 1440;
  }
  return 分钟;
}

function 写成时刻(分钟) {
  var 时 = Math.floor(分钟 / 60);
  var 分 = 分钟 % 60;
  function 两位(数) {
    return 数 < 10 ? "0" + 数 : String(数);
  }
  return 两位(时) + "时" + 两位(分) + "分";
}

function 主程序(参数) {
  var 次数行 = "高潮2次\n低潮2次\n";
  if (参数.length === 0) {
    process.stdout.write(次数行);
    return 0;
  }
  if (参数.length !== 2) {
    process.stderr.write(错误话);
    return 2;
  }
  var 港口 = 参数[0];
  var 日期 = 参数[1];
  var 日期匹配 = /^(\d{4})-(\d{2})-(\d{2})$/.exec(日期);
  if (!日期匹配 || !Object.prototype.hasOwnProperty.call(港口晚到分钟, 港口)) {
    process.stderr.write(错误话);
    return 2;
  }
  var 年 = parseInt(日期匹配[1], 10);
  var 月 = parseInt(日期匹配[2], 10);
  var 日 = parseInt(日期匹配[3], 10);
  var 当月天数 = 每月天数[月 - 1] + (月 === 2 && 是闰年(年) ? 1 : 0);
  if (月 < 1 || 月 > 12 || 日 < 1 || 日 > 当月天数) {
    process.stderr.write(错误话);
    return 2;
  }
  var 天数 = 算天数(年, 月, 日);
  var 基准 = 360 + 天数 * 50 + 港口晚到分钟[港口];
  var 高潮 = [落到当天(基准), 落到当天(基准 + 745)].sort(function (a, b) {
    return a - b;
  });
  var 低潮 = [落到当天(基准 + 372), 落到当天(基准 + 1117)].sort(function (a, b) {
    return a - b;
  });
  process.stdout.write(
    次数行 +
    "高潮时刻 " + 写成时刻(高潮[0]) + " " + 写成时刻(高潮[1]) + "\n" +
    "低潮时刻 " + 写成时刻(低潮[0]) + " " + 写成时刻(低潮[1]) + "\n"
  );
  return 0;
}

if (require.main === module) {
  process.exit(主程序(process.argv.slice(2)));
}

module.exports = { 主程序: 主程序 };
