import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};
@Injectable({
  providedIn: 'root',
})
export class BatchService {
  generatebatchUrl: string = 'http://localhost:3000/batch';
  fetchBatchesUrl: string = 'http://localhost:3000/batch/allBatches';
  delBatchesUrl: string = 'http://localhost:3000/batch/delBatch';
  deactivateBatchUrl: string = 'http://localhost:3000/batch/deactivateBatch';
  countBatchStrengthUrl: string = 'http://localhost:3000/batch/count';
  fetchBatchStudentsUrl: string = 'http://localhost:3000/batch/fetch';
  fetchBatchByIdUrl: string = '`http://localhost:3000/batch/getbatch`';
  constructor(private http: HttpClient) {}

  registerBatch(genBatchForm: FormGroup): Observable<any> {
    return this.http.post(this.generatebatchUrl, genBatchForm, httpOptions);
  }
  fetchAllBatch(): Observable<any> {
    return this.http.get(this.fetchBatchesUrl, httpOptions);
  }
  delBatch(id: any): Observable<any> {
    const url = `${this.delBatchesUrl}/${id}`;
    return this.http.delete(url, httpOptions);
  }
  deactivateBatch(id: any): Observable<any> {
    const url = `${this.deactivateBatchUrl}/${id}`;
    console.log('In Batch Service File', url);
    return this.http.post(url, httpOptions);
  }
  CountBatchStrength(id: any): Observable<any> {
    const url = `${this.countBatchStrengthUrl}/${id}`;
    return this.http.get(url, httpOptions);
  }
  FetchBatchStudents(batch: any): Observable<any> {
    const url = `${this.fetchBatchStudentsUrl}/${batch}`;
    return this.http.get(url, httpOptions);
  }
  FindBatchById(id: any): Observable<any> {
    const url = `${this.fetchBatchByIdUrl}/${id}`;
    return this.http.get(url, httpOptions);
  }
}
