import child from 'child_process';
import { dialog } from 'electron';
import log from 'electron-log';
import { defaultIp, defaultPort } from '../config';
import { muDefaultFolder, _rootPath } from './util';
import { getUserData } from './store';

export default async function run() {
  const userData = getUserData();
  const { ipAndPort, muFolder = muDefaultFolder } = userData;

  log.info(`muDefaultFolder: ${muDefaultFolder}`);
  log.info(`_rootPath: ${_rootPath}`);

  let ipAndPortArr = [defaultIp, defaultPort];
  if (ipAndPort) {
    ipAndPortArr = ipAndPort.split(':');
  }

  if (!muFolder) {
    await dialog.showMessageBox({
      message: '请在设置中选择Mu客户端目录',
    });
    return;
  }

  const executablePath = `${muFolder}\\main.exe`;
  const param = ['connect', `/u${ipAndPortArr[0]}`, `/p${ipAndPortArr[1]}`];

  child.execFile(
    executablePath,
    param,
    {
      cwd: muFolder,
    },
    (err, stdout, stderr) => {
      if (err) {
        console.error(err);
      }
    }
  );
}
