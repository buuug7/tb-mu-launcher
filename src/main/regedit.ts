const regedit = require('../../release/app/node_modules/regedit');

const regeditPromised = regedit.promisified;

regedit.setExternalVBSLocation('resources/regedit/vbs');

/**
 * Resolution 分辨率 1=800x600, 2=1024x768, 3=1280x1024, 4=1366x768
 * MusicOnOff 音效 0=关闭, 1=打开
 * SoundOnOff 声音 0=关闭, 1=打开
 * VolumeLevel 声音大小 0 - 10
 * WindowMode 窗口模式  0=关闭, 1=打开
 * ColorDepth 图像质量  0=16bit, 1=32bit
 */
export function setRegedit(params: any) {
  const {
    ID,
    Resolution = 1,
    MusicOnOff = 1,
    SoundOnOff = 1,
    VolumeLevel = 5,
    WindowMode = 1,
    ColorDepth = 1,
  } = params;

  const values = {
    ID: {
      value: ID,
      type: 'REG_SZ',
    },
    Resolution: {
      value: Resolution,
      type: 'REG_DWORD',
    },
    MusicOnOff: {
      value: MusicOnOff,
      type: 'REG_DWORD',
    },
    SoundOnOff: {
      value: SoundOnOff,
      type: 'REG_DWORD',
    },
    VolumeLevel: {
      value: VolumeLevel,
      type: 'REG_DWORD',
    },
    WindowMode: {
      value: WindowMode,
      type: 'REG_DWORD',
    },
    ColorDepth: {
      value: ColorDepth,
      type: 'REG_DWORD',
    },
  };

  return regeditPromised.putValue({
    'HKCU\\Software\\Webzen\\Mu\\Config': values,
  });
}

export function getRegedit() {
  return regeditPromised.list('HKCU\\Software\\Webzen\\Mu\\Config');
}
