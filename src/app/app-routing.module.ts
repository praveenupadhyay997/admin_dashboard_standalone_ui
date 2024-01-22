import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { IndexComponent } from './components/pages/index/index.component';
import { PageNotFoundComponent } from './components/pages/page-not-found/page-not-found.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { OverviewComponent } from './components/users/overview/overview.component';
import { ExamCellComponent } from './components/users/exam-cell/exam-cell.component';
import { ReceptionComponent } from './components/users/reception/reception.component';
import { AdmissionComponent } from './components/users/admission/admission.component';
import { AccountantComponent } from './components/users/accountant/accountant.component';
import { StudentComponent } from './components/users/student/student.component';
import { SelectUserComponent } from './components/pages/select-user/select-user.component';
import { StudentLoginComponent } from './components/authentication/student-login/student-login.component';
import { StaffLoginComponent } from './components/authentication/staff-login/staff-login.component';
import { AuthGuard } from './guards/auth.guard';
import { ForgotPassComponent } from './components/authentication/forgot-pass/forgot-pass.component';
import { RestoreComponent } from './components/users/restore/restore.component';
import { TimeLoggerComponent } from './components/users/time-logger/time-logger.component';

const routes: Routes = [
  { path: '', redirectTo: '/index', pathMatch: 'full' }, // redirect to `index component`
  { path: 'index', component: IndexComponent },
  { path: 'selectUser', component: SelectUserComponent },
  { path: 'studentSignin', component: StudentLoginComponent },
  { path: 'staffSignin', component: StaffLoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      {
        path: 'overview',
        component: OverviewComponent,
        data: {
          roles: ['Admin', 'Receptionist', 'Accountant', 'Exam Cell', 'IT Cell'],
        },
      },
      {
        path: 'reception',
        component: ReceptionComponent,
        data: {
          roles: ['Admin', 'Receptionist'],
        },
      },
      {
        path: 'exam_cell',
        component: ExamCellComponent,
        data: {
          roles: ['Admin', 'Exam Cell'],
        },
      },
      {
        path: 'admission',
        component: AdmissionComponent,
        data: {
          roles: ['Admin', 'IT Cell'],
        },
      },
      {
        path: 'accountant',
        component: AccountantComponent,
        data: {
          roles: ['Admin', 'Accountant'],
        },
      },
      {
        path: 'student',
        component: StudentComponent,
        data: {
          roles: ['Admin', 'Student'],
        },
      },
      {
        path: 'restore',
        component: RestoreComponent,
        data: {
          roles: ['Admin'],
        },
      },
      {
        path: 'time-logger',
        component: TimeLoggerComponent,
        data: {
          roles: ['Admin'],
        },
      },
    ],
  },
  { path: 'forgotPass', component: ForgotPassComponent },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
