#!/usr/bin/env node
"use strict";

// 现在只能报当天有几次高低潮。次数固定是两次高潮、两次低潮。

function 主程序(参数) {
  if (参数.length !== 0) {
    process.stderr.write("没法报潮：现在只能报当天有几次高低潮\n");
    return 2;
  }
  process.stdout.write("高潮2次\n低潮2次\n");
  return 0;
}

if (require.main === module) {
  process.exit(主程序(process.argv.slice(2)));
}

module.exports = { 主程序: 主程序 };
