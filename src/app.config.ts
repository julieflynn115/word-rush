export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/wrong/index',
    'pages/mine/index',
    'pages/levels/index',
    'pages/game/index',
    'pages/result/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#f4f5fb',
    navigationBarTitleText: '单词闯关',
    navigationBarTextStyle: 'black',
    backgroundColor: '#f4f5fb'
  },
  tabBar: {
    color: '#9296ad',
    selectedColor: '#5b57f5',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '闯关',
        iconPath: 'assets/tabbar/home.svg',
        selectedIconPath: 'assets/tabbar/home-selected.svg'
      },
      {
        pagePath: 'pages/wrong/index',
        text: '错词本',
        iconPath: 'assets/tabbar/book.svg',
        selectedIconPath: 'assets/tabbar/book-selected.svg'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的',
        iconPath: 'assets/tabbar/mine.svg',
        selectedIconPath: 'assets/tabbar/mine-selected.svg'
      }
    ]
  }
})
