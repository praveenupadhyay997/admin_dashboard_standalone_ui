import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-select-user',
  templateUrl: './select-user.component.html',
  styleUrls: ['./select-user.component.css'],
})
export class SelectUserComponent implements OnInit {
  constructor(public router: Router) {}

  ngOnInit(): void {}
  student() {
    this.router.navigate(['/studentSignin']);
  }
  staff() {
    this.router.navigate(['/staffSignin']);
  }
  goback() {
    this.router.navigate(['/index']);
  }
}
