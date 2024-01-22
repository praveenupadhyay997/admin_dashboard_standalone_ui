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
export class AccountService {
  createAccountUrl: string = 'http://localhost:3000/account';
  fetchAllAccountsUrl: string = 'http://localhost:3000/account/fetchAll';
  deleteAccountUrl: string = 'http://localhost:3000/account/delete';
  updateAccountUrl: string = 'http://localhost:3000/account/update';
  sendSmsUrl: string = 'http://localhost:3000/account/sms';
  saveChequeDetail: string = 'http://localhost:3000/chequeSystem/saveChequeDetails';
  updateChequeDetail: string = 'http://localhost:3000/chequeSystem/update';
  getChequeDetail: string = 'http://localhost:3000/chequeSystem/getAll';

  constructor(private http: HttpClient) {}

  createAccount(formData: FormData): Observable<any> {
    return this.http.post(this.createAccountUrl, formData);
  }
  fetchAccounts(): Observable<any> {
    return this.http.get(this.fetchAllAccountsUrl, httpOptions);
  }
  deleteAccount(id: any): Observable<any> {
    const url = `${this.deleteAccountUrl}/${id}`;
    return this.http.delete(url, httpOptions);
  }
  updateAccount(formData: any): Observable<any> {
    return this.http.post(this.updateAccountUrl, formData);
  }

  sendSms(account: any): Observable<any> {
    return this.http.post(this.sendSmsUrl, account, httpOptions);
  }
  getChequeDetailByRollNo(rollNo: any): Observable<any> {
    const url = `${this.getChequeDetail}/${rollNo}`;
    return this.http.get(url, httpOptions);
  }
  saveNewChequeDetail(details: any): Observable<any> {
    return this.http.post(this.saveChequeDetail, JSON.stringify(details), httpOptions);
  }
  updateOldChequeDetail(newDetails: any): Observable<any> {
    let body = JSON.stringify(newDetails);
    return this.http.post(this.updateChequeDetail, body, httpOptions);
  }
}
