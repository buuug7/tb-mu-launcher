type UpdateItem = {
  link: string;
  needUpdate: boolean;
  filename?: string;
};

type UpdatePayload = {
  version: number;
  forceUpdate: boolean;
  baseUrl: string;
  items: UpdateItem[];
  apiVersion?: number;
};

type UserData = {
  muFolder?: string;
  ipAndPort?: string;
  version?: number;
  regedit?: object;
};
