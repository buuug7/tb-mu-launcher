import {
  EVENT_CHECK_CLIENT_UPDATE,
  EVENT_RUN_MU,
  EVENT_UPDATE_FINISHED,
  EVENT_UPDATE_PROGRESS,
  USER_DATA_KEY,
  newsUrl,
  servers,
  webBaseUrl,
} from 'config';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import meta from '../../release/app/package.json';

const { electron } = window;

export default function Home() {
  const [news, setNews] = useState([]);
  const [currentBg, setCurrentBg] = useState('bg4');
  const [updateInfo, setUpdateInfo] = useState({
    msg: '检测更新...',
    finished: true,
  });
  const [defaultServer, setDefaultServer] = useState(servers[0]);

  const updateClient = () => {
    setUpdateInfo((pre) => ({
      ...pre,
      finished: false,
    }));

    electron.ipcRenderer.on(EVENT_UPDATE_PROGRESS, (payload) => {
      console.log(`payload`, payload);
      setUpdateInfo(payload as any);
    });

    electron.ipcRenderer.once(EVENT_UPDATE_FINISHED, () => {
      console.log(`EVENT_UPDATE_FINISHED`);
      setUpdateInfo((pre) => ({
        ...pre,
        finished: true,
      }));

      electron.ipcRenderer.sendMessage(EVENT_RUN_MU, []);
    });

    electron.ipcRenderer.sendMessage(EVENT_CHECK_CLIENT_UPDATE, []);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((pre) => {
        const index = Number(pre.replace('bg', ''));
        const nextIndex = index + 1 > 4 ? 1 : index + 1;
        return `bg${nextIndex}`;
      });
    }, 5000);

    return () => {
      console.log(`clearInterval`, timer);
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    axios
      .get(newsUrl)
      .then(({ data }) => {
        setNews(data.data);
      })
      .catch((err) => {
        console.log(`err`, err);
      });
  }, []);

  useEffect(() => {
    const userData = window.electron.store.get(USER_DATA_KEY) || {};
    const server = userData.server || servers[0];

    setDefaultServer(server);
    window.electron.store.set(USER_DATA_KEY, {
      ...userData,
      server
    });

  }, []);

  return (
    <div className="index-page">
      <div className={`header ${currentBg}`}>
        <h2 className="text-center">{meta.productionName}</h2>
      </div>

      <div className="flex-center actions mt-2">
        <Link to="/setting" className="btn btn-outline-primary btn-sm me-1">
          <div className="d-flex align-items-center">
            <span>设置 | {defaultServer.name} </span>
          </div>
        </Link>
        <button
          disabled={!updateInfo.finished}
          type="button"
          className="btn btn-primary btn-sm "
          onClick={updateClient}
        >
          启动游戏
        </button>
      </div>

      {!updateInfo.finished && (
        <div className="my-2 p-2 text-center text-break">{updateInfo.msg}</div>
      )}

      {updateInfo.finished && (
        <div className="features">
          <ul>
            {news.map((item: any) => (
              <li key={item.id}>{item.text}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="footer text-muted text-center">
        <a href={webBaseUrl} className="mx-2" target="_blank" rel="noreferrer">
          土鳖奇迹官网
        </a>
        <span>v{meta.version}</span>
      </div>
    </div>
  );
}
