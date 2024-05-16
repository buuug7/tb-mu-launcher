/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';
import findProcess from 'find-process';
import { rootPath } from '../../release/app/node_modules/electron-root-path';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

// export const muDefaultFolder = path.resolve(process.execPath, '..', '..');
export const muDefaultFolder = path.resolve(rootPath, '..', '..');
// eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle
export const _rootPath = rootPath;

export function killMainProcess() {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line promise/catch-or-return
    findProcess('name', 'main.exe').then(
      // eslint-disable-next-line promise/always-return
      (list) => {
        console.log(`list`, list);
        list.forEach((it) => {
          process.kill(it.pid);
        });
        resolve(true);
      },
      (err) => {
        console.log(`err`, err);
        reject();
      }
    );
  });
}
