import fs from 'fs';
import path from 'path';
import { app } from 'electron';

export function saveUserData(data: any) {
  const userDataPath = app.getPath('userData');
  const dataPath = path.join(userDataPath, 'mu-login-app.json');
  fs.writeFileSync(dataPath, JSON.stringify(data));
}

export function getUserData() {
  const userDataPath = app.getPath('userData');
  const dataPath = path.join(userDataPath, 'mu-login-app.json');
  let data;
  try {
    data = JSON.parse(fs.readFileSync(dataPath).toString());
  } catch (error) {
    console.log(error);
    data = {};
  }
  return data;
}
