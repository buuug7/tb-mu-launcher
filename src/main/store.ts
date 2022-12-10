import Store from 'electron-store';
const store = new Store();
import { USER_DATA_KEY } from '../config';

export const getUserData = () => {
  return store.get(USER_DATA_KEY) as UserData;
};

export const setUserData = (value: any) => {
  store.set(USER_DATA_KEY, value);
};

export default store;
