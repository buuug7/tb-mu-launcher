import child from 'child_process';
import { dialog } from 'electron';
import { defaultIp, defaultPort } from '../config';
import { getUserData } from './user-data';
import { muDefaultFolder } from './util';

export default async function run() {
  const userData = getUserData();
  const { ipAndPort, muFolder = muDefaultFolder } = userData;
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
