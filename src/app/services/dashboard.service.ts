import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
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
export class DashboardService {
  fetchAllStudentsUrl: string = 'http://localhost:3000/dashboard/allStudents';
  deleteStudentUrl: string = 'http://localhost:3000/dashboard/deleteStudent';
  deactivateStudentUrl: string = 'http://localhost:3000/dashboard/deactivate';
  deactivateDemoStudentUrl: string = 'http://localhost:3000/dashboard/deactivateDemoStudent';
  fetchAllDemoStudentsUrl: string =
    'http://localhost:3000/dashboard/demoStudents';
  deleteDemoStudentUrl: string =
    'http://localhost:3000/dashboard/deleteDemoStudent';
  updateDemoStudentUrl: string =
    'http://localhost:3000/dashboard/updateDemoStudent';

  constructor(private http: HttpClient) {}

  fetchAllStudents(): Observable<any> {
    return this.http.get(this.fetchAllStudentsUrl, httpOptions);
  }
  deleteStudent(id: any): Observable<any> {
    const url = `${this.deleteStudentUrl}/${id}`;
    return this.http.delete(url, httpOptions);
  }
  deactivateStudent(id: any): Observable<any> {
    const url = `${this.deactivateStudentUrl}/${id}`;
    return this.http.post(url, httpOptions);
  }
  deactivateDemoStudent(id: any): Observable<any> {
    const url = `${this.deactivateDemoStudentUrl}/${id}`;
    return this.http.post(url, httpOptions);
  }
  fetchAllDemoStudents(): Observable<any> {
    return this.http.get(this.fetchAllDemoStudentsUrl, httpOptions);
  }
  deleteDemoStudent(id: any): Observable<any> {
    const url = `${this.deleteDemoStudentUrl}/${id}`;
    return this.http.delete(url, httpOptions);
  }
  updateDemoStudent(updateDemoStudentForm: FormGroup): Observable<any> {
    return this.http.post(this.updateDemoStudentUrl, updateDemoStudentForm);
  }
}
