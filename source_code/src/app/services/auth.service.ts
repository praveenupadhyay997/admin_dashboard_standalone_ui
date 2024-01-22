import { FormGroup } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
const httpOptions = {
  headers: new HttpHeaders({
    Accept: 'application/json',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  authToken: any;
  user: any;

  studentLoginUrl: string = 'http://localhost:3000/studentLogin';
  // Admission Page tab-1
  admitStudentUrl: string = 'http://localhost:3000/admission';
  getStudentUrl: string = 'http://localhost:3000/admission/getstudent';
  changePassUrl: string = 'http://localhost:3000/changepass';
  forgotPassUrl: string = 'http://localhost:3000/forgotPass';
  constructor(private http: HttpClient) {}

  admitStudent(formData: FormData): Observable<any> {
    return this.http.post(this.admitStudentUrl, formData);
  }

  authenticateStudent(studentLoginForm: FormGroup): Observable<any> {
    return this.http.post(this.studentLoginUrl, studentLoginForm, httpOptions);
  }

  getStudent(idCardForm: FormGroup): Observable<any> {
    return this.http.post(this.getStudentUrl, idCardForm, httpOptions);
  }

  changePass(user: any): Observable<any> {
    return this.http.post(this.changePassUrl, user, httpOptions);
  }

  forgotPass(forgotPassForm: FormGroup): Observable<any> {
    return this.http.post(this.forgotPassUrl, forgotPassForm, httpOptions);
  }

  storeUserData(token: string, user: any) {
    localStorage.setItem('id_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.authToken = token;
    this.user = user;
  }

  loadToken() {
    const token = localStorage.getItem('id_token');
    this.authToken = token;
  }

  // Returns true when user is looged in and email is verified
  get isLoggedIn(): boolean {
    const user = localStorage.getItem('user');
    return user !== null ? true : false;
  }

  logout() {
    this.authToken = null;
    this.user = null;
    localStorage.clear();
  }
}
