export interface Config {
  last_open: string;
}

export interface File {
  name: string;
  path: string;
  content: string[];
  saved: boolean;
}
