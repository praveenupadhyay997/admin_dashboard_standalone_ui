import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountantLogs } from '../Models/AccountantLogs';
import { StudentLogs } from '../Models/StudentLogs';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  fetchAllLogsUrl: string = 'http://localhost:3000/logger/getAll';
  postLogUrl: string = 'http://localhost:3000/logger/saveLog';
  fetchStudentLogsUrl: string = 'http://localhost:3000/studentLogger/getAll';
  postStudentLogUrl: string = 'http://localhost:3000/studentLogger/saveLog';

  constructor(private http: HttpClient) { }

  logStatus(message: string) {
    let currentDateTime = new Date();
    let currentDateTimeString = currentDateTime.toDateString();
    console.log(`${currentDateTimeString} : `, message);
  }

  // GetAllLogs
  fetchAccountantLogs(): Observable<any> {
    return this.http.get(this.fetchAllLogsUrl, httpOptions);
  }

  // Post he logs to the backend
  postTheLogs(logs: AccountantLogs): Observable<any> {
    let body = JSON.stringify(logs);
    return this.http.post(this.postLogUrl, body, httpOptions);
  }

  // GetAllLogs
  fetchStudentLogs(): Observable<any> {
    return this.http.get(this.fetchStudentLogsUrl, httpOptions);
  }

  // Post he logs to the backend
  postTheStudentLogs(logs: StudentLogs): Observable<any> {
    let body = JSON.stringify(logs);
    return this.http.post(this.postStudentLogUrl, body, httpOptions);
  }
}
