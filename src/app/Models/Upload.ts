import { Batch } from './Batch';
export class Upload {
  _id: string = '';
  examName: string = '';
  batch: Batch = new Batch();
  examDate: Date = new Date();
  examFile: string = '';
  originalName: string = '';
  createdAt: Date = new Date();
}
