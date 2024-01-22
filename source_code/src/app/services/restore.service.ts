import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'multipart/form-data',
    Accept: 'application/json',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class RestoreService {
  fetchAllStudentsUrl: string = 'http://localhost:3000/restore/allStudents';
  fetchAllDemoStudentsUrl: string = 'http://localhost:3000/restore/allDemoStudents';
  fetchAllExamDataUrl: string = 'http://localhost:3000/restore/allExamData';
  fetchAllBatchUrl: string = 'http://localhost:3000/restore/allRestorePointBatches';
  restoreStudentsUrl: string = 'http://localhost:3000/restore/restoreStudent';
  restoreDemoStudentsUrl: string = 'http://localhost:3000/restore/restoreDemoStudent';
  restoreExamDataUrl: string = 'http://localhost:3000/restore/restoreExamData';
  constructor(private http: HttpClient) {}

  fetchAllStudents(): Observable<any> {
    return this.http.get(this.fetchAllStudentsUrl, httpOptions);
  }
  fetchAllDemoStudents(): Observable<any> {
    return this.http.get(this.fetchAllDemoStudentsUrl, httpOptions);
  }
  fetchAllExamData(): Observable<any> {
    return this.http.get(this.fetchAllExamDataUrl, httpOptions);
  }
  fetchAllRestorePointBatches(): Observable<any> {
    return this.http.get(this.fetchAllBatchUrl, httpOptions);
  }
  restoreStudent(id: any): Observable<any> {
    const url = `${this.restoreStudentsUrl}/${id}`;
    return this.http.post(url, httpOptions);
  }
  restoreDemoStudent(id: any): Observable<any> {
    const url = `${this.restoreDemoStudentsUrl}/${id}`;
    return this.http.post(url, httpOptions);
  }
  restoreExamData(id: any): Observable<any> {
    const url = `${this.restoreExamDataUrl}/${id}`;
    return this.http.post(url, httpOptions);
  }
}
