/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/label-has-associated-control */

import {
  EVENT_GET_REGEDIT,
  EVENT_GET_USER_DATA,
  EVENT_KILL_MAIN,
  EVENT_SELECT_FOLDER,
  EVENT_SET_REGEDIT,
  EVENT_SET_USER_DATA,
  showIpAndPortOption,
} from 'config';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const { electron } = window;

export default function SettingPage() {
  const history = useNavigate();
  const [ID, setID] = useState('');
  const [Resolution, setResolution] = useState(1);
  const [MusicOnOff, setMusicOnOff] = useState(1);
  const [SoundOnOff, setSoundOnOff] = useState(1);
  const [WindowMode, setWindowMode] = useState(1);
  const [ColorDepth, setColorDepth] = useState(1);
  const [muFolder, setMuFolder] = useState('');
  const [ipAndPort, setIpAndPort] = useState('');
  const [Message, setMessage] = useState('');

  const onResolutionChange = (e: any) => {
    setResolution(Number(e.target.value));
  };

  const onColorDepthChange = (e: any) => {
    setColorDepth(Number(e.target.value));
  };

  useEffect(() => {
    electron.ipcRenderer.once(EVENT_GET_REGEDIT, (data: any) => {
      console.log(`EVENT_GET_REGEDIT`, data);
      setID(data.ID.value);
      setResolution(data.Resolution.value);
      setMusicOnOff(data.MusicOnOff.value);
      setSoundOnOff(data.SoundOnOff.value);
      setWindowMode(data.WindowMode.value);
      setColorDepth(data.ColorDepth.value);
    });

    electron.ipcRenderer.sendMessage(EVENT_GET_REGEDIT, []);

    electron.ipcRenderer.once(EVENT_GET_USER_DATA, (data: any) => {
      console.log(`EVENT_GET_USER_DATA`, data);
      if (data.muFolder) {
        setMuFolder(data.muFolder);
      }

      if (data.ipAndPort) {
        setIpAndPort(data.ipAndPort);
      }
    });

    electron.ipcRenderer.sendMessage(EVENT_GET_USER_DATA, []);
  }, []);

  return (
    <div className="setting-page container">
      <h4 className="text-left">应用设置</h4>
      <hr className="border1" />
      <div className="">
        <h5>进程</h5>
        <div>
          <a
            role="button"
            href="#"
            onClick={() => {
              const isConfirm = window.confirm('确定要杀死所有 MAIN 进程吗？');
              if (isConfirm) {
                console.log(`begin kill all main.exe process`);
                electron.ipcRenderer.sendMessage(EVENT_KILL_MAIN, []);
              }
            }}
          >
            杀死所有 MAIN.EXE 进程
          </a>
        </div>
        <hr className="border1" />

        <div className="d-flex justify-content-center align-items-center">
          <span className="flex-shrink-0 me-2">账号</span>
          <input
            type="text"
            className="form-control"
            value={ID}
            onChange={(e) => {
              setID(e.target.value);
            }}
          />
        </div>
        <hr className="border1" />

        <h5>分辨率</h5>
        <div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="Resolution"
              value={1}
              checked={Resolution === 1}
              onChange={onResolutionChange}
            />
            <label className="form-check-label">800x600</label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="Resolution"
              value={2}
              checked={Resolution === 2}
              onChange={onResolutionChange}
            />
            <label className="form-check-label">1024x768</label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="Resolution"
              value={4}
              checked={Resolution === 4}
              onChange={onResolutionChange}
            />
            <label className="form-check-label" htmlFor="Resolution3">
              1366x768
            </label>
          </div>
        </div>
        <hr className="border1" />

        <h5>图像质量</h5>
        <div>
          <div className="form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="ColorDepth"
              value={0}
              checked={ColorDepth === 0}
              onChange={onColorDepthChange}
            />
            <label className="form-check-label">16bit</label>
          </div>
          <div className="form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="ColorDepth"
              value={1}
              checked={ColorDepth === 1}
              onChange={onColorDepthChange}
            />
            <label className="form-check-label">32bit</label>
          </div>
        </div>
        <hr className="border1" />

        <h5>其他</h5>
        <div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              checked={WindowMode === 1}
              onChange={(e) => {
                console.log(e.target.checked);
                setWindowMode(e.target.checked ? 1 : 0);
              }}
            />
            <label className="form-check-label">窗口模式</label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              checked={MusicOnOff === 1}
              onChange={(e) => {
                console.log(e.target.checked);
                setMusicOnOff(e.target.checked ? 1 : 0);
              }}
            />
            <label className="form-check-label">音效</label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              checked={SoundOnOff === 1}
              onChange={(e) => {
                console.log(e.target.checked);
                setSoundOnOff(e.target.checked ? 1 : 0);
              }}
            />
            <label className="form-check-label">声音</label>
          </div>
        </div>
        <hr className="border1" />

        <h5>客户端路径</h5>
        <div>
          <div
            tabIndex={0}
            role="button"
            className="mt-2 py-2 bg-light d-flex flex-column px-2 text-secondary"
            onClick={() => {
              electron.ipcRenderer.once(EVENT_SELECT_FOLDER, (data: any) => {
                const folder = data.filePaths[0];
                console.log(`floder`, folder);

                if (!folder.endsWith('main.exe')) {
                  alert(`注意: 请选择客户端文件夹中的 main.exe`);
                  return;
                }
                setMuFolder(folder);
              });

              electron.ipcRenderer.sendMessage(EVENT_SELECT_FOLDER, []);
            }}
          >
            <div className="mb-2 text-primary">
              请选择客户端文件夹中的 main.exe
            </div>
            <div className="mb-2 text-break">
              {muFolder || '未设置客户端路径'}
            </div>
          </div>
        </div>

        {showIpAndPortOption && (
          <div>
            <h5>IP和端口</h5>
            <div className="mb-3">
              <label className="form-label">格式 192.168.1.21:44405</label>
              <input
                type="text"
                className="form-control"
                value={ipAndPort}
                onChange={(e) => {
                  setIpAndPort(e.target.value);
                }}
              />
            </div>
          </div>
        )}

        <hr className="border1" />

        {Message && <div className="alert alert-success">{Message}</div>}

        <div>
          <button
            type="submit"
            className="btn btn-primary me-2"
            onClick={(e) => {
              e.preventDefault();
              const data = {
                ID,
                Resolution,
                MusicOnOff,
                SoundOnOff,
                WindowMode,
                ColorDepth,
              };
              electron.ipcRenderer.sendMessage(EVENT_SET_REGEDIT, [data]);

              if (muFolder.toLowerCase().endsWith('.exe')) {
                electron.ipcRenderer.sendMessage(EVENT_SET_USER_DATA, [
                  {
                    muFolder: muFolder.slice(0, -9),
                    ipAndPort,
                  },
                ]);
              }
              setMessage('保存成功');
              setTimeout(() => {
                history(-1);
              }, 1000);
            }}
          >
            保存
          </button>
          <button
            type="submit"
            className="btn btn-outline-primary me-2"
            onClick={() => {
              history(-1);
            }}
          >
            返回
          </button>
        </div>
      </div>
    </div>
  );
}
