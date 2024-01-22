import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-student-login',
  templateUrl: './student-login.component.html',
  styleUrls: ['./student-login.component.css'],
})
export class StudentLoginComponent implements OnInit {
  studentLoginForm: FormGroup = new FormGroup({});
  allAlert!: String;

  // Getter Method
  get rollNo() {
    return this.studentLoginForm.get('rollNo');
  }
  get password() {
    return this.studentLoginForm.get('password');
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.createStudentSigninForm();
  }
  createStudentSigninForm(): void {
    this.studentLoginForm = this.fb.group({
      rollNo: [''],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(
            '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$'
          ),
        ],
      ],
    });
  }
  onSignin(): void {
    if (this.studentLoginForm.valid) {
      this.signin();
    } else {
      this.allAlert = 'All fields are required to Signin.';
    }
  }
  signin() {
    this.authService
      .authenticateStudent(this.studentLoginForm.value)
      .subscribe((response) => {
        if (response.success) {
          this.authService.storeUserData(response.token, response.student);
          this.router.navigate(['/dashboard/student']);
        } else {
          this.allAlert = response.msg;
          this.router.navigate(['/studentSignin']);
        }
      });
  }
  goback() {
    this.router.navigate(['/selectUser']);
  }
}
