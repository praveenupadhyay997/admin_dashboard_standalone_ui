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
export class StudentService {
  getStudentUrl: string = 'http://localhost:3000/student';
  getExamsByBatchUrl: string = 'http://localhost:3000/student/exam';
  getBatchByClassUrl: string = 'http://localhost:3000/student/batch';
  getAverageMarksUrl: string = 'http://localhost:3000/student/average';
  updateStudentUrl: string = 'http://localhost:3000/student/update';
  constructor(private http: HttpClient) {}

  getStudent(id: any): Observable<any> {
    const url = `${this.getStudentUrl}/${id}`;
    return this.http.get(url, httpOptions);
  }
  getExams(batch: any): Observable<any> {
    const url = `${this.getExamsByBatchUrl}/${batch}`;
    return this.http.get(url, httpOptions);
  }
  getExamResult(id: any, rollNo: any): Observable<any> {
    const url = `${this.getExamsByBatchUrl}/${id}/${rollNo}`;
    return this.http.get(url, httpOptions);
  }
  getDistinctBatch(cls: any): Observable<any> {
    const url = `${this.getBatchByClassUrl}/${cls}`;
    return this.http.get(url, httpOptions);
  }
  getAverageMarks(batch: any): Observable<any> {
    const url = `${this.getAverageMarksUrl}/${batch}`;
    return this.http.get(url, httpOptions);
  }

  updateStudent(formData: FormData): Observable<any> {
    return this.http.post(this.updateStudentUrl, formData);
  }
}
