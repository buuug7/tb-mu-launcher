import path from 'path';
import axios from 'axios';

import fs from 'fs';
import { killMainProcess, muDefaultFolder } from './util';
import {getUserData, setUserData} from './store';
import {
  clientUpdateUrl,
  EVENT_CHECK_CLIENT_UPDATE,
  EVENT_UPDATE_FINISHED,
  EVENT_UPDATE_PROGRESS,
} from '../config';

export async function downloadByUrl(url: string, filename: string) {
  try {
    const response = await axios({
      url: encodeURI(url),
      method: 'get',
      responseType: 'stream',
    });

    const chunks: any[] = [];
    console.log(`Status: ${response.status}`);

    return await new Promise((resolve, reject) => {
      response.data.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      response.data.on('error', (err: any) => {
        reject(err);
      });

      response.data.on('end', () => {
        const buf = Buffer.concat(chunks);
        console.log(`filename`, filename);

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

export async function downloadUpdatedFiles(event: Electron.IpcMainEvent) {
  const userData = getUserData();
  const { muFolder = muDefaultFolder, version = 0 } = userData;

  // get updated items from server
  try {
    const { data } = await axios.get(clientUpdateUrl);
    console.log(`data`, data);
    console.log(`local version: ${version}`);
    console.log(`latest version: ${data.version}`);

    if (data.version <= version) {
      const msg = `当前版本是最新的，无需更新!`;
      event.reply(EVENT_UPDATE_FINISHED, {
        msg,
        finished: true,
      });

      return;
    }

    let updateItems = data.items.map((item: UpdateItem) => {
      let { link } = item;
      if (data.apiVersion > 1) {
        link = (data.baseUrl || '') + item.link;
      }
      const filename = link.split('/').pop()?.split('__').join('/') || '';

      return {
        ...item,
        link,
        filename: path.join(muFolder, filename),
      };
    });

    if (data.apiVersion > 1) {
      updateItems = updateItems.filter((it: UpdateItem) => it.needUpdate);
    }

    if (updateItems.length > 0) {
      // 更新前杀死正在运行的 main.exe
      killMainProcess();
    }

    console.log(`begin update client`);
    let updateCount = 0;
    let errorCount = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (const item of updateItems) {
      console.log(item.link);
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
      setUserData({ ...userData, version: data.version })
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

export async function run(event: Electron.IpcMainEvent) {
  const userData = getUserData();
  console.log(`userData1`, userData);
  const { muFolder = muDefaultFolder } = userData;

  if (!muFolder) {
    event.reply(EVENT_CHECK_CLIENT_UPDATE, '请将该程序放置在Mu客户端目录');
    return;
  }

  downloadUpdatedFiles(event);
}
