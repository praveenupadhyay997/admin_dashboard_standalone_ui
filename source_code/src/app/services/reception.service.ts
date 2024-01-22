import { FormGroup } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class ReceptionService {
  demoStudentUrl: string = 'http://localhost:3000/reception';
  getDemoStudentUrl: string = 'http://localhost:3000/reception/getdemostudent';

  constructor(private http: HttpClient) {}
  demoStudent(studentForm: FormGroup): Observable<any> {
    return this.http.post(this.demoStudentUrl, studentForm, httpOptions);
  }

  getDemoStudent(demoCardForm: FormGroup): Observable<any> {
    return this.http.post(this.getDemoStudentUrl, demoCardForm, httpOptions);
  }
}
