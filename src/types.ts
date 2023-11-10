export type Channel = {
  id: string;
  secret: string;
  user: User;
};

export type User = {
  username: string;
  password: string;
};

export type FileInfo = {
  id: string;
  name: string;
  totalSize: number;
  data?: any[];
};
