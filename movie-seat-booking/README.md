## Movie Seat Booking

Display movie choices and seats in a theater to select from in order to purchase tickets

## Project Specifications

- Display UI with movie select, screen, seats, legend & seat info
- User can select a movie/price
- User can select/deselect seats
- User can not select occupied seats
- Number of seats and price will update
- Save seats, movie and price to local storage so that UI is still populated on refresh

Design inspiration from [Dribbble](https://dribbble.com/shots/3628370-Movie-Seat-Booking)

## My Note

- 除了实现以上功能以外，我还实现了一下功能
  - 每个电影都是独立的，随机生成他们已预定的座位
  - 每个电影都可以独立选择座位，而且会短暂保存，电影切换时已选择电影不会消失，页面刷新时会重置。
  - 模拟了选择好座位后买票的过程，将当前电影的已选择座位变为已预订座位
- 目前存在的问题
  - 购买过多的座位以后，电影票界面显示不下。
