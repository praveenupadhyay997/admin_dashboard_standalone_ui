import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxPrintModule } from 'ngx-print';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { AuthGuard } from './guards/auth.guard';

import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './components/pages/page-not-found/page-not-found.component';
import { ForgotPassComponent } from './components/authentication/forgot-pass/forgot-pass.component';
import { NavbarComponent } from './components/layout/navbar/navbar.component';
import { FooterComponent } from './components/layout/footer/footer.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { IndexComponent } from './components/pages/index/index.component';
import { OverviewComponent } from './components/users/overview/overview.component';
import { ExamCellComponent } from './components/users/exam-cell/exam-cell.component';
import { ReceptionComponent } from './components/users/reception/reception.component';
import { AdmissionComponent } from './components/users/admission/admission.component';
import { AccountantComponent } from './components/users/accountant/accountant.component';
import { StudentComponent } from './components/users/student/student.component';
import { StudentLoginComponent } from './components/authentication/student-login/student-login.component';
import { StaffLoginComponent } from './components/authentication/staff-login/staff-login.component';
import { SelectUserComponent } from './components/pages/select-user/select-user.component';
import { ChartsModule } from 'ng2-charts';
import { NgxPaginationModule } from 'ngx-pagination';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { FormsModule } from '@angular/forms';
import { OrderModule } from 'ngx-order-pipe';
import { DatePipe } from '@angular/common';
import { RestoreComponent } from './components/users/restore/restore.component';
import { RefreshButtonComponent } from './components/layout/refresh-button/refresh-button.component';
import { TimeLoggerComponent } from './components/users/time-logger/time-logger.component';

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    ForgotPassComponent,
    NavbarComponent,
    FooterComponent,
    DashboardComponent,
    IndexComponent,
    OverviewComponent,
    ExamCellComponent,
    ReceptionComponent,
    AdmissionComponent,
    AccountantComponent,
    StudentComponent,
    StudentLoginComponent,
    StaffLoginComponent,
    SelectUserComponent,
    RestoreComponent,
    RefreshButtonComponent,
    TimeLoggerComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    NgxPrintModule,
    HttpClientModule,
    ChartsModule,
    NgxPaginationModule,
    Ng2SearchPipeModule,
    FormsModule,
    OrderModule,
  ],
  providers: [AuthGuard, DatePipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
