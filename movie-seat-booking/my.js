/**
 * @author 赵科磊 2024-5-31 10:15
 * @description 电影选座系统，主要依靠init函数和事件监听器来完成所有功能。
 * 具体流程为页面加载后，调用init函数初始化页面，如果是首次点开该电影，则会随机生成该电影已预定的座位，并保存在本地。
 * 如果已经随机生成过，则从本地读取。然后判断当前电影用户是否点击选择过座位，如果有则读取已选择座位，渲染在页面上。
 * 最终通过“选好了”按钮来模拟买票过程。
 */

"use strict";

const seats = document.querySelectorAll(".row .seat");
const rows = document.querySelectorAll(".row");
const seatNum = document.querySelector(".seat_num");
const totalPrice = document.querySelector(".total_price");
const movie = document.getElementById("movie-set");
const button = document.querySelector(".button");
const coord = document.querySelector(".selected-coord");
const overlay = document.querySelector(".overlay");
const progress = document.querySelector(".progress");
const progressText = document.querySelector(".progress-text");
const path = document.querySelector(".path");
const ticketInfo = document.querySelector(".ticket-info");
const ticketSeats = document.querySelector(
  ".ticket-info .ticket .ticket-container .left"
);
const confirmButton = document.querySelector(".button-confirm");
const ticketMovieName = document.querySelector(
  ".ticket-info .ticket .ticket-head span"
);
const buyDate = document.querySelector(".buy-date");
const buyTime = document.querySelector(".buy-time");
const watchDate = document.querySelector(".cinema-date");
const watchTime = document.querySelector(".cinema-time");

// 未预定的座位
// 在初始化函数里重新通过DOM选择
// 因为每次页面可能未选中的座位会变化
let seatNotOccupied = [];

// 已经初始化过的电影的列表
let initializedMovie = [];

// 预定义电影的票价
let ticketPrice;

// 预定义所选座位个数和花费总数
let seatCount;
let priceCount;

// 定义当前电影所以
let movieIndex;

// 定义选中座位的坐标列表
let coordSelectedList = [];

// 临时保存用户的选择位置
let seatSelectedTemp = []; // [[movieIndex, seatCount, priceCount, coordSelectedList],[movieIndex, seatCount, priceCount, coordSelectedList]]

// 每个电影的已预定的座位
let rowList = [];
let columnList = [];

/**
 * @function 根据座位总数和排数随机生成已预定的座位排数和列数产生随机订票座位
 * @param {Number} seatsLength 总座位数
 * @param {Object} rows 所有行节点
 * @returns 返回二维数组，其中第一个数组是随机生成的座位排数，第二个数组是对应排数的随机座位列数返回随机座位的排和列的数组
 */
const getRandomSeats = function (seatsLength, rows) {
  // 随机产生已被购买的座位数
  // seats是所有的座位，即“container”里的所有座位数
  // seats.length是所有座位数
  // 这个座位数不能包括展示样例，即“showcase”里的座位
  const randomSeatsNum = Math.ceil(Math.random() * seatsLength);

  // 根据随机生成的座位数量，来生成随机的座位
  // 先 生成排数，即第几排，排数可以重复
  // 因为随机座位数量可能会大于排数
  const randomRowsList = [];
  const randomColumnList = [];

  // 因为ceil是向上取整，随机数是0<x<1
  // 所以随机数×rows的长度，生成的随机数是 0<x<rows.length
  for (let i = 0; i < randomSeatsNum; i++) {
    const randomRow = Math.ceil(Math.random() * rows.length);
    randomRowsList.push(randomRow);
  }

  // 根据排数生成随机列数，生成座位
  // 通过获取一排有几个位置，确定生成随机数的位置
  for (let randomRow of randomRowsList) {
    //初始化列数
    let column = 0;

    // 捕获第row排元素
    rows.forEach((row, index) => {
      if (index === randomRow - 1) {
        // 获取第row排列数
        column = row.children.length;
      }
    });

    // 生成随机列数
    const randomColumn = Math.ceil(Math.random() * column);

    randomColumnList.push(randomColumn);
  }

  // 返回排列数组
  return [randomRowsList, randomColumnList];
};

/**
 * @description 根据随机生成已占的座位初始化页面
 * @param {Array} rowList 已预订座位的排数 数组
 * @param {Array} columnList 已预订座位的列数 数组
 * @param {Element} rows 所有排节点
 */
const seatRender = function (rowList, columnList, rows) {
  for (const index in rowList) {
    const row = rowList[index];
    const column = columnList[index];

    if (rows[row - 1].children[column - 1].classList.contains(".selected"))
      rows[row - 1].children[column - 1].classList.remove(".selected");

    rows[row - 1].children[column - 1].classList.add("occupied");
  }
};

/**
 * @function 更新选中座位并且渲染页面
 * @description 调用该函数，会根据保存的已选择座位数组来渲染“提示所选择座位在几排几座”
 */
const coordRender = function () {
  let html = "您选了";
  for (const c of coordSelectedList) {
    html += `<span class="coord">${c[0]}排${c[1]}座</span>`;
  }

  // 如果没有选中座位，则不显示
  // 否则会在页面留下“您选了”三个字
  // 也可以当没有选择时输出“未选择座位”等话。。。
  if (coordSelectedList.length === 0) html = "";

  coord.innerHTML = html;
};

/**
 * @function 渲染已选座位数，花费和已选择座位
 * @param {Boolean} change 是否是由电影切换所引起的调用
 */
const seatCostSelectedRender = function (change = false) {
  coordRender(); // 这是渲染“已选择XX排XX列”的字样
  seatNum.innerText = `${seatCount}`;
  totalPrice.innerText = `${priceCount}`;

  // 如果传入参数为true，则需要渲染页面已选择的座位
  // 并且确认切换的电影是已经有“已选择”座位的才渲染
  // 这是渲染页面中的座位样式为“已选择”
  if (change && coordSelectedList.length > 0) {
    for (const c of coordSelectedList) {
      rows[c[0] - 1].children[c[1] - 1].classList.add("selected");
    }
  }
};

/**
 * @function 保存已预定座位
 * @param {String} movieLabel 电影名称
 * @description 通过传入电影名，将对应的电影的已预定座位的排、列数组保存到浏览器本地
 */
const saveToLocal = function (movieLabel) {
  localStorage.setItem(`${movieLabel}-row`, JSON.stringify(rowList));
  localStorage.setItem(`${movieLabel}-column`, JSON.stringify(columnList));
};

/**
 * @function 初始化函数
 * @param {Boolean} change 是否由电影切换引起的函数调用
 * @description 由页面初次加载，或者电影切换是调用。会重置页面所有数据，再根据当前电影的数据渲染页面
 */
const init = function (change = false) {
  // 保存当前电影数据
  // 如果是监听电影切换调用的init函数，则保存该电影数据
  // 防止页面一展示就保存空数据
  if (change) {
    // 更新该电影的数据

    // 将之前的删掉，放入新的数据
    for (const i in seatSelectedTemp) {
      // 如果找到了，说明之前存过
      if (seatSelectedTemp[i][0] === movieIndex) {
        // 更新
        // 删除之前的
        seatSelectedTemp.splice(i, 1);
      }
    }

    const temp = [movieIndex, seatCount, priceCount, coordSelectedList];
    // temp.push(seatCount)
    // temp.push(priceCount)
    // temp.push(coordSelectedList)
    seatSelectedTemp.push(temp);
  }

  // 如果已经通过DOM选择过未被选中的座位
  // 清除其上面的监听器
  if (seatNotOccupied.length > 0) {
    seatNotOccupied.forEach((s) => s.removeEventListener("click", seatClick));
  }

  // 重新获取当前电影序号
  movieIndex = movie.selectedIndex;

  // 获取电影的票价
  ticketPrice = +movie.value;

  // 初始化所选座位个数和花费总数
  seatCount = 0;
  priceCount = 0;

  // 初始化已选择座位列表
  coordSelectedList = [];

  // 重新渲染页面
  seatCostSelectedRender();

  // 读取已初始化的电影名单
  // 已初始化电影名单列表是为了方便后面判断一个电影是否已经初始化过了
  initializedMovie =
    JSON.parse(localStorage.getItem("initializedMovie")) !== null
      ? JSON.parse(localStorage.getItem("initializedMovie"))
      : [];

  // 初始化已预订座位
  // 切换电影的时候，将所有座位恢复为未预定，根据随机结果初始化已预定座位
  // 切换电影时，将已选择座位恢复为未选择，根据当前电影的选择来渲染已选择座位
  rows.forEach((row) => {
    for (const seat of row.children) {
      // 将所有座位恢复为未预定
      if (seat.classList.contains("occupied")) {
        seat.classList.remove("occupied");
      }

      // 将已选择座位恢复为未选择
      if (seat.classList.contains("selected")) {
        seat.classList.remove("selected");
      }
    }
  });

  // 获取当前电影名称
  const movieLabel = movie[movie.selectedIndex].innerText;

  // 读取保存的该电影的已选择座位
  for (const t of seatSelectedTemp) {
    // 如果该电影保存过，即可以在保存记录里找到
    if (t[0] === movie.selectedIndex) {
      console.log(t[0]);
      // 读取信息
      seatCount = t[1];
      priceCount = t[2];

      // 深拷贝数组，和直接赋值不一样
      // 把一个对象赋值给一个新的变量时，赋的其实是该对象在栈中的地址，而不是堆中的数据。
      // 见 demo.js 的 arr3 示例
      [...coordSelectedList] = t[3];

      // 渲染页面
      // 传入参数True，表示是切换页面导致的已选择座位的渲染，需要渲染已选择座位
      seatCostSelectedRender(true);
    }
  }

  // 判断该电影座位是否初始化过
  // 如果没有则初始化，并且保存数据
  // 如果有，则读取之前初始化的数据
  if (!initializedMovie.includes(movieLabel)) {
    // 如果不存在
    //生成随机已预订座位
    [rowList, columnList] = getRandomSeats(seats.length, rows);

    // 深拷贝
    [...rowList] = rowList;
    [...columnList] = columnList;

    // 渲染到页面上
    seatRender(rowList, columnList, rows);

    // 保存到“已初始化座位的电影”的列表里
    initializedMovie.push(movieLabel);

    //保存生成的随机数据，使用local storage
    saveToLocal(movieLabel);

    // 保存已初始化的电影
    localStorage.setItem("initializedMovie", JSON.stringify(initializedMovie));
  } else {
    // 如果存在
    // 读取保存的数据
    // 深拷贝
    [...rowList] = JSON.parse(localStorage.getItem(`${movieLabel}-row`));
    [...columnList] = JSON.parse(localStorage.getItem(`${movieLabel}-column`));

    // 渲染页面
    seatRender(rowList, columnList, rows);
  }

  // 在渲染完所有座位后，再选择未预定的座位
  seatNotOccupied = document.querySelectorAll(".row .seat:not(.occupied)");

  // 实现点击选中
  seatNotOccupied.forEach((e) => {
    e.addEventListener("click", seatClick);
  });
};

/**
 * @function 未预定座位点击事件回调函数
 * @param {Object} e 点击事件传入的参数
 * @description 所有未选择座位的点击回调函数
 */
const seatClick = function (e) {
  // toggle返回true或者false，true为添加，false为删除，可以用来判断总个数增加或者减少
  let judge = e.currentTarget.classList.toggle("selected");

  // 获取坐标
  const coord = [];
  rows.forEach((row, index) => {
    for (let i = 0; i < row.children.length; i++) {
      if (e.currentTarget === row.children[i]) {
        // 找到了坐标
        coord.push(index + 1);
        coord.push(i + 1);
      }
    }
  });

  // 更新所选信息
  updateSelectedCount(judge, coord);
};

/**
 * @function 更新页面数据
 * @param {Boolean} flag 点击事件是增加类名了还是删除类名了，增加为true，删除为false
 * @param {Array} coord 单个点击的座位的坐标数组
 */
const updateSelectedCount = function (flag, coord) {
  if (flag) {
    seatCount++;
    priceCount += ticketPrice;
    coordSelectedList.push(coord);

    //重新渲染页面
    seatCostSelectedRender();
  } else {
    seatCount--;
    priceCount -= ticketPrice;
    /*
     * 当用户点击取消所选的座位时，在已选择数组里删除这个座位的坐标信息
     */
    for (const i in coordSelectedList) {
      if (coordSelectedList[i][0] === coord[0]) {
        if (coordSelectedList[i][1] === coord[1]) {
          coordSelectedList.splice(i, 1);
        }
      }
    }

    // 重新渲染页面
    seatCostSelectedRender();
  }
};

// 监听电影选择修改
movie.addEventListener("change", function () {
  init(true);
});

/**
 * @function 定时器
 * @param {Number} ms 要暂停的毫秒数
 * @returns Promise
 */
const delay = function (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// 监听确认信息按钮
confirmButton.addEventListener("click", function (e) {
  overlay.classList.add("hidden");
  ticketInfo.classList.add("hidden");

  // 清空电影票信息
  ticketSeats.innerHTML = "<small>座位：</small>";
});

// button按钮监听事件
button.addEventListener("click", async function () {
  // 如果没有选择预定座位
  if (coordSelectedList.length === 0) return;

  //显示锁票订票
  overlay.classList.remove("hidden");
  progress.classList.remove("hidden");

  // 获取买票时间
  let now = new Date();

  // 定义字符串
  const stringSeat = "正在锁座...";
  const stringTicket = "正在买票...";
  const stringSuccess = "购票成功";
  let stringSeats = "";
  const stringMovieName = movie[movie.selectedIndex].innerText;

  // 将已选择位置变为已预订 并且 生成电影票字样
  for (const c of coordSelectedList) {
    // console.log(c[0], c[1]);
    rowList.push(c[0]);
    columnList.push(c[1]);

    //电影票字样
    stringSeats += `<span>${c[0]}排${c[1]}座</span>`;
  }

  // 添加电影票信息
  // 添加座位信息
  ticketSeats.insertAdjacentHTML("beforeend", stringSeats);
  // 添加电影名称
  ticketMovieName.innerText = stringMovieName;
  // 添加时间信息
  buyDate.innerText = `${now.getFullYear()}-${
    now.getMonth() + 1
  }-${now.getDate()}`;
  buyTime.innerText = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
  // 设置观影时间和购买时间不同
  now.setDate(now.getDate() + 1);
  now.setHours(now.getHours() + 2);
  now.setMinutes(now.getMinutes() - 40);
  watchDate.innerText = `${now.getFullYear()}-${
    now.getMonth() + 1
  }-${now.getDate()}`;
  watchTime.innerText = `${now.getHours()}:${now.getMinutes()}`;

  // 保存到本地
  saveToLocal(movie[movie.selectedIndex].innerText);

  // 由于已选择座位被预定，在已选择座位列表中删除该电影
  for (const i in seatSelectedTemp) {
    if (seatSelectedTemp[i][0] === movie.selectedIndex) {
      seatSelectedTemp.splice(i, 1);

      // 找到退出循环，提升效率
      break;
    }
  }

  // 设置定时器，顺序执行
  const buyTicket = async function () {
    // 画对号，先隐藏对号
    const l = path.getTotalLength();
    path.style.setProperty("--l", l);

    // 画圈
    progressText.innerText = stringSeat;
    await delay(2000);
    progressText.innerText = stringTicket;
    await delay(2500);
    progressText.innerText = stringSuccess;
    await delay(2500);

    // 重新渲染页面
    seatRender(rowList, columnList, rows);

    // overlay.classList.add("hidden");
    progress.classList.add("hidden");

    // 显示出票动画
    ticketInfo.classList.remove("hidden");
  };

  // 等待保存完成
  await buyTicket();

  // 执行页面刷新
  init();
});

init();
