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
export class StaffService {
  authToken: any;
  user: any;

  staffLoginUrl: string = 'http://localhost:3000/staff/login';

  constructor(private http: HttpClient) {}

  authenticateStaff(staffSigninForm: FormGroup): Observable<any> {
    return this.http.post(this.staffLoginUrl, staffSigninForm, httpOptions);
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
