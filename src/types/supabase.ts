
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  [tableName: string]: {
    Row: any;
    Insert: any;
    Update: any;
  };
}
