// import {Field InputType} from 'type-graphql';

// export class MulterFile {
//   @Field()
//   key?: string;

//   @Field()
//   path?: string;

//   @Field()
//   mimetype?: string;

//   @Field()
//   originalname?: string;

//   @Field(() => String)
//   buffer?: any;

//   @Field()
//   size?: number;
// }

export interface MulterFile {
  key: string;
  path: string;
  mimetype: string;
  originalname: string;
  size: number;
  buffer: any;
}
