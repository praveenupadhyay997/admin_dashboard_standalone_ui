import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { PasswordValidator } from 'src/app/shared/password.validator';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  // Image Upload
  url: any = '';
  display = 'none';
  public dashboard: any;
  todayDate: Date = new Date();
  public section: string = '';
  public user: any;

  // Change Pass Form
  changePassForm: FormGroup = new FormGroup({});
  allAlert!: String;
  successAlert!: String;

  // Getter Method
  get currentPass() {
    return this.changePassForm.get('currentPass');
  }
  get newPass() {
    return this.changePassForm.get('newPass');
  }
  get confirmPass() {
    return this.changePassForm.get('confirmPass');
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public router: Router
  ) {
    setInterval(() => {
      this.todayDate = new Date();
    }, 1);
  }

  ngOnInit(): void {
    // this.setSection();

    this.user = localStorage.getItem('user');
    this.user = JSON.parse(this.user);
    // Image Display
    const picName = this.user.profile;
    if (picName != undefined || picName != null) {
      this.url = 'http://localhost:3000/' + picName;
    } else {
      this.url = '';
    }
    this.createPassForm();
  }

  // Change Password Validation
  createPassForm(): void {
    this.changePassForm = this.fb.group(
      {
        currentPass: [
          '',
          [
            Validators.required,
            Validators.pattern(
              '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$'
            ),
          ],
        ],
        newPass: [
          '',
          [
            Validators.required,
            Validators.pattern(
              '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$'
            ),
          ],
        ],
        confirmPass: [''],
      },
      { validator: PasswordValidator }
    );
  }
  onChange(): void {
    if (this.changePassForm.valid) {
      this.changePass();
    } else {
      this.allAlert = 'All fields are mandatory to change the password.';
    }
  }
  changePass() {
    let user = {
      id: this.user._id,
      role: this.user.role,
      cpform: this.changePassForm.value,
    };
    this.authService.changePass(user).subscribe((response) => {
      if (response.success) {
        this.successAlert = response.msg;
        this.onLogoutClick();
      } else {
        this.allAlert = response.msg;
      }
    });
  }
  // -------------------- Modal ------------------------
  openModal() {
    this.display = 'block';
  }
  onCloseHandled() {
    this.display = 'none';
  }
  onLogoutClick() {
    this.authService.logout();
    this.router.navigate(['/selectUser']);
    return false;
  }
}
