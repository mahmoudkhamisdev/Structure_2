export type FileNode = {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  content?: string;
};

export type Project = {
  id: string;
  name: string;
  plan: string;
  files: FileNode[];
};
