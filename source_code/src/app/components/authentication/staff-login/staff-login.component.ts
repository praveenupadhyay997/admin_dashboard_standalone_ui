import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { StaffService } from 'src/app/services/staff.service';

@Component({
  selector: 'app-staff-login',
  templateUrl: './staff-login.component.html',
  styleUrls: ['./staff-login.component.css'],
})
export class StaffLoginComponent implements OnInit {
  roles: any = [
    { id: 'Accountant', name: 'Accountant' },
    { id: 'Admin', name: 'Admin' },
    { id: 'Receptionist', name: 'Receptionist' },
    { id: 'Exam Cell', name: 'Exam Cell' },
    { id: 'IT Cell', name: 'IT Cell' },
  ];
  staffSigninForm: FormGroup = new FormGroup({
    role: new FormControl(),
    email: new FormControl(),
    password: new FormControl(),
  });
  allAlert!: String;
  // Getter Method
  get role() {
    return this.staffSigninForm.get('role');
  }
  get email() {
    return this.staffSigninForm.get('email');
  }
  get password() {
    return this.staffSigninForm.get('password');
  }
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private staffService: StaffService
  ) {}

  ngOnInit(): void {
    this.createStaffSigninForm();
  }
  createStaffSigninForm(): void {
    this.staffSigninForm = this.fb.group({
      role: [''],
      email: ['', Validators.compose([Validators.required, Validators.email])],
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
    if (this.staffSigninForm.valid) {
      this.signin();
    } else {
      this.allAlert = 'All fields are required to Signin.';
    }
  }
  signin() {
    this.staffService
      .authenticateStaff(this.staffSigninForm.value)
      .subscribe((response) => {
        if (response.success) {
          this.staffService.storeUserData(response.token, response.staff);
          this.router.navigate(['/dashboard']);
        } else {
          this.allAlert = response.msg;
          this.router.navigate(['/staffSignin']);
        }
      });
  }
  goback() {
    this.router.navigate(['/selectUser']);
  }
}
