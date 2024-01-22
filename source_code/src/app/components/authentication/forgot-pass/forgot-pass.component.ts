import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-forgot-pass',
  templateUrl: './forgot-pass.component.html',
  styleUrls: ['./forgot-pass.component.css'],
})
export class ForgotPassComponent implements OnInit {
  forgotPassForm: FormGroup = new FormGroup({});
  allAlert!: String;

  // Getter Method
  get role() {
    return this.forgotPassForm.get('role');
  }
  get rollNo() {
    return this.forgotPassForm.get('rollNo');
  }
  get email() {
    return this.forgotPassForm.get('email');
  }
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.createForgotPassForm();
  }
  createForgotPassForm(): void {
    this.forgotPassForm = this.fb.group({
      role: ['', [Validators.required]],
      rollNo: [''],
      email: ['', [Validators.email]],
    });
  }
  onForgot(): void {
    let role = this.forgotPassForm.value.role;
    if (role == 'student') {
      this.forgotPassForm.get('rollNo')?.setValidators(Validators.required);
      if (this.forgotPassForm.valid) {
        this.authService
          .forgotPass(this.forgotPassForm.value)
          .subscribe((response) => {
            if (response.success) {
              this.router.navigate(['/studentSignin']);
            }
          });
      }
    } else if (role == 'staff') {
      this.forgotPassForm.get('email')?.setValidators(Validators.required);
      if (this.forgotPassForm.valid) {
        this.authService
          .forgotPass(this.forgotPassForm.value)
          .subscribe((response) => {
            if (response.success) {
              this.router.navigate(['/staffSignin']);
            }
          });
      }
    }
  }
  goback() {
    this.router.navigate(['/selectUser']);
  }
}
