import path from 'path';
import axios from 'axios';
import log from 'electron-log';
import fs from 'fs';
import { killMainProcess, muDefaultFolder, _rootPath } from './util';
import { getUserData, setUserData } from './store';
import {
  EVENT_CHECK_CLIENT_UPDATE,
  EVENT_UPDATE_FINISHED,
  EVENT_UPDATE_PROGRESS,
  servers,
  webBaseUrl,
} from '../config';

export async function downloadByUrl(url: string, filename: string) {
  try {
    const response = await axios({
      url: encodeURI(url),
      method: 'get',
      responseType: 'stream',
    });

    const chunks: any[] = [];

    console.log(
      `download: status=${response.status},url=${url},filename=${filename}`
    );

    return await new Promise((resolve, reject) => {
      response.data.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      response.data.on('error', (err: any) => {
        reject(err);
      });

      response.data.on('end', () => {
        const buf = Buffer.concat(chunks);
        fs.writeFileSync(filename, buf);
        resolve('下载成功');
      });
    });
  } catch (err: any) {
    console.log(err.response.status);
    const message = err.response
      ? `status: ${err.response.status},statusText: ${err.response.statusText}`
      : 'Unknown Error';
    return Promise.reject(new Error(message));
  }
}

export async function downloadUpdatedFiles(
  event: Electron.IpcMainEvent,
  forceUpdate = false
) {
  const userData = getUserData();
  const defaultServer = userData.server || servers[0];
  const muFolder = userData.muFolder || muDefaultFolder;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const version = userData[`version-${defaultServer.key}`] || 0;
  const updateUrl = `${webBaseUrl}/api/check-client-update?server=${defaultServer.key}`;

  try {
    // get updated items from server
    const response = await axios.get(updateUrl, {
      maxContentLength: Infinity,
    });
    const { data } = response;

    log.info(`update res: `, data);

    const needUpdate =
      parseInt(data.version, 10) > parseInt(version, 10) || forceUpdate;

    const logUpdateInfo = {
      forceUpdate,
      latestVersion: data.version,
      currentVersion: version,
      needUpdate,
      status: response.status,
    };

    log.info(`update info: `, logUpdateInfo);

    if (!needUpdate) {
      const msg = `当前版本是最新的，无需更新!`;
      event.reply(EVENT_UPDATE_FINISHED, {
        msg,
        finished: true,
      });
      return;
    }

    let updateItems = data.items.map((item: UpdateItem) => {
      return {
        ...item,
        link: data.baseUrl + item.link,
        filename: path.join(
          muFolder,
          item.link.replace(`/updates/${defaultServer.key}/`, '')
        ),
      };
    });

    updateItems = updateItems.filter((it: UpdateItem) => it.update);

    if (updateItems.length > 0) {
      // 更新前杀死正在运行的 main.exe
      killMainProcess();
    }

    log.info(`update updateItems: `, updateItems);
    log.info(`begin download update files`);

    let updateCount = 0;
    let errorCount = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (const item of updateItems) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await downloadByUrl(item.link, item.filename);
        updateCount += 1;

        event.reply(EVENT_UPDATE_PROGRESS, {
          msg: `[${updateCount}/${updateItems.length}]${item.link}`,
          finished: false,
        });
      } catch (err: any) {
        console.log(err.message);
        errorCount += 1;
      }
    }

    if (errorCount === 0) {
      setUserData({
        ...userData,
        [`version-${defaultServer.key}`]: data.version,
      });
    }

    event.reply(
      EVENT_UPDATE_FINISHED,
      JSON.stringify({
        msg: `启动游戏`,
        finished: true,
      })
    );
  } catch (error: any) {
    console.log('error:', error.message);
    event.reply('UPDATED_FINISHED', {
      msg: `异常,请稍微再试`,
      finished: true,
    });
  }
}

export async function run(event: Electron.IpcMainEvent, args: any[]) {
  const userData = getUserData();
  let forceUpdate = false;

  if (args.length > 0) {
    forceUpdate = args[0].forceUpdate;
  }

  const muFolder = userData.muFolder || muDefaultFolder;

  log.info(`muDefaultFolder: ${muDefaultFolder}`);
  log.info(`_rootPath: ${_rootPath}`);

  if (!muFolder) {
    event.reply(EVENT_CHECK_CLIENT_UPDATE, '请设置 MU 客户端目录');
    return;
  }

  downloadUpdatedFiles(event, forceUpdate);
}
