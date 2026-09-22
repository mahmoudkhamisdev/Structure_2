export type FileType = "md" | "flow";

export type FileNode = {
  id: string;
  name: string;
  type: "file" | "folder";
  fileType?: FileType;
  children?: FileNode[];
  content?: string;
};

export type Project = {
  id: string;
  name: string;
  plan: string;
  files: FileNode[];
};
