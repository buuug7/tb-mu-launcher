type UpdateItem = {
  link: string;
  needUpdate: boolean;
  filename?: string;
};

type UpdatePayload = {
  version: number;
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
