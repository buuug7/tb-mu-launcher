// default IP
export const defaultIp = '101.132.124.204';

// default port
export const defaultPort = '44405';

// 每次启动登录器都去更新客户端文件
export const updateEveryLaunch = true;

// 显示配置IP跟端口选项
export const showIpAndPortOption = false;

// 网站 base URL
// export const webBaseUrl = 'http://localhost:3000';
export const webBaseUrl = 'http://mu.yoursoups.com';

// 更新客户端 URL
export const clientUpdateUrl = `${webBaseUrl}/client-updates/v1/update.json`;

// 新闻
export const newsUrl = `${webBaseUrl}/json/news.json`;

// 服务器,分区
export const servers = [
  {
    name: '二区',
    key: '2',
  },
  {
    name: '一区',
    key: '1',
  },
];

export const EVENT_RUN_MU = 'EVENT_RUN_MU';
export const EVENT_SELECT_FOLDER = 'EVENT_SELECT_FOLDER';
export const EVENT_KILL_MAIN = 'EVENT_KILL_MAIN';

export const EVENT_CHECK_CLIENT_UPDATE = 'EVENT_CHECK_CLIENT_UPDATE';
export const EVENT_UPDATE_PROGRESS = 'EVENT_UPDATE_PROGRESS';
export const EVENT_UPDATE_FINISHED = 'EVENT_UPDATE_FINISHED';

export const EVENT_GET_REGEDIT = 'EVENT_GET_REGEDIT';
export const EVENT_SET_REGEDIT = 'EVENT_SET_REGEDIT';

export const USER_DATA_KEY = 'userData';
