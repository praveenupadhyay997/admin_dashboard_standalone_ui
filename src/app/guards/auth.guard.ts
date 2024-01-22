import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { StaffService } from '../services/staff.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  public user: any;
  constructor(
    private authService: AuthService,
    private staffService: StaffService,
    private router: Router
  ) {}
  canActivate(route: ActivatedRouteSnapshot) {
    if (this.authService.isLoggedIn || this.staffService.isLoggedIn) {
      this.user = localStorage.getItem('user');
      this.user = JSON.parse(this.user);
      var role = this.user.role;

      if (route.data.roles && route.data.roles.indexOf(role) === -1) {
        // role not authorised so redirect to home page
        this.router.navigate(['/dashboard']);
        return false;
      }
      return true;
    } else {
      this.router.navigate(['/selectUser']);
      return false;
    }
  }
}
