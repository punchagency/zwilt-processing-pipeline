export namespace ApolloServerFileUploads {
  export type File = {
    filename: string;
    mimetype: string;
    encoding: string;
    createReadStream: Function;
  };

  export type UploadedFileResponse = {
    filename: string;
    mimetype: string;
    encoding: string;
    url: string;
  };

  export type UploadFileResponse = {
    url: string;
  };

  export interface IUploader {
    singleFileUpload: ({
      file,
      directory,
      tags,
    }: {
      file: File;
      tags: any;
      directory?: string;
    }) => Promise<UploadedFileResponse>;
    multipleUploads: ({
      files,
    }: {
      files: File[];
    }) => Promise<UploadedFileResponse[]>;
  }
}
