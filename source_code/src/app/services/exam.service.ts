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
export class ExamService {
  uploadResultUrl: string = 'http://localhost:3000/examCell/';
  fetchAllUploadsUrl: string = 'http://localhost:3000/examCell/msgsection';
  deleteUploadUrl: string = 'http://localhost:3000/examCell/delete';
  updateExamUrl: string = 'http://localhost:3000/examCell/update';
  sendSmsUrl: string = 'http://localhost:3000/examCell/sms';
  sendListOfStudentUrl: string = 'http://localhost:3000/examCell/sendListOfStudent';
  detailedSingleSmsUrl: string = 'http://localhost:3000/examCell/detailedSingleSms';
  deactivateExamDataUrl: string = 'http://localhost:3000/examCell/deactivateExamData';

  constructor(private http: HttpClient) {}

  uploadResult(formData: FormData): Observable<any> {
    return this.http.post(this.uploadResultUrl, formData);
  }

  fetchAllUploads(): Observable<any> {
    return this.http.get(this.fetchAllUploadsUrl, httpOptions);
  }

  deleteUpload(id: any): Observable<any> {
    const url = `${this.deleteUploadUrl}/${id}`;
    return this.http.delete(url, httpOptions);
  }

  updateExamUpload(updateUploadForm: any): Observable<any> {
    return this.http.post(this.updateExamUrl, updateUploadForm, httpOptions);
  }

  sendSms(details: any): Observable<any> {
    return this.http.post(this.sendSmsUrl, details, httpOptions);
  }

  sendListOfStudent(details: any): Observable<any> {
    return this.http.post(this.sendListOfStudentUrl, details, httpOptions);
  }

  detailedSingleSms(details: any): Observable<any> {
    return this.http.post(this.detailedSingleSmsUrl, details, httpOptions);
  }

  deactivateExamData(id: any): Observable<any> {
    const url = `${this.deactivateExamDataUrl}/${id}`;
    return this.http.post(url, httpOptions);
  }
}
