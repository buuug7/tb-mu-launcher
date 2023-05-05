type UpdateItem = {
  link: string;
  filename: string;
  update?: boolean;
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
  server?: {
    name: string;
    key: string;
  };
};
