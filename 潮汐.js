#!/usr/bin/env node
"use strict";

// 不带参数报当天有几次高低潮：两次高潮、两次低潮。
// 带港口和日期时，再报两次高潮、两次低潮的大致时刻。

var 港口晚到分钟 = { "上海": 0, "青岛": 73, "厦门": 148 };

function 是闰年(年) {
  return 年 % 4 === 0 && (年 % 100 !== 0 || 年 % 400 === 0);
}

function 月内天数(年, 月) {
  var 各月天数 = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (月 === 2 && 是闰年(年)) {
    return 29;
  }
  return 各月天数[月 - 1];
}

// 按历法日期计算从 1970-01-01 起的天数（Howard Hinnant 算法）。
function 距纪元天数(年, 月, 日) {
  var 移位后的年 = 年 - Math.floor((14 - 月) / 12);
  var 纪年 = 移位后的年 + 4800;
  var 移位后的月 = 月 + 12 * Math.floor((14 - 月) / 12) - 3;
  return 日 + Math.floor((153 * 移位后的月 + 2) / 5) + 365 * 纪年
    + Math.floor(纪年 / 4) - Math.floor(纪年 / 100) + Math.floor(纪年 / 400)
    - 32045 - 719468;
}

// 解析四位年、两位月、两位日，非法日期返回 null。
function 解析日期(文本) {
  var 匹配 = /^(\d{4})-(\d{2})-(\d{2})$/.exec(文本);
  if (匹配 === null) {
    return null;
  }
  var 年 = Number(匹配[1]);
  var 月 = Number(匹配[2]);
  var 日 = Number(匹配[3]);
  if (月 < 1 || 月 > 12 || 日 < 1 || 日 > 月内天数(年, 月)) {
    return null;
  }
  return 距纪元天数(年, 月, 日) - 距纪元天数(2000, 1, 1);
}

function 扣回当天(分钟) {
  return ((分钟 % 1440) + 1440) % 1440;
}

function 格式化时刻(分钟) {
  var 时 = Math.floor(分钟 / 60);
  var 分 = 分钟 % 60;
  function 两位(数) {
    return (数 < 10 ? "0" : "") + 数;
  }
  return 两位(时) + "时" + 两位(分) + "分";
}

function 主程序(参数) {
  if (参数.length === 0) {
    process.stdout.write("高潮2次\n低潮2次\n");
    return 0;
  }

  if (参数.length !== 2
    || !Object.prototype.hasOwnProperty.call(港口晚到分钟, 参数[0])) {
    process.stderr.write("没法报潮：只认上海、青岛、厦门，日期要写成四位年、两位月、两位日\n");
    return 2;
  }

  var 天数 = 解析日期(参数[1]);
  if (天数 === null) {
    process.stderr.write("没法报潮：只认上海、青岛、厦门，日期要写成四位年、两位月、两位日\n");
    return 2;
  }

  var 第一次高潮 = 扣回当天(360 + 50 * 天数 + 港口晚到分钟[参数[0]]);
  var 高潮 = [第一次高潮, 扣回当天(第一次高潮 + 745)]
    .sort(function (前, 后) { return 前 - 后; });
  var 低潮 = [扣回当天(第一次高潮 + 372), 扣回当天(第一次高潮 + 1117)]
    .sort(function (前, 后) { return 前 - 后; });

  process.stdout.write("高潮2次\n低潮2次\n");
  process.stdout.write("高潮时刻 " + 高潮.map(格式化时刻).join(" ") + "\n");
  process.stdout.write("低潮时刻 " + 低潮.map(格式化时刻).join(" ") + "\n");
  return 0;
}

if (require.main === module) {
  process.exit(主程序(process.argv.slice(2)));
}

module.exports = { 主程序: 主程序 };
