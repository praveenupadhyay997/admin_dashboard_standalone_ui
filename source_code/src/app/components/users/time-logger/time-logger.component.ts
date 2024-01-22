import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderPipe } from 'ngx-order-pipe';
import { Student } from 'src/app/Models/Student';
import { StudentLogs } from 'src/app/Models/StudentLogs';
import { DashboardService } from 'src/app/services/dashboard.service';
import { LoggerService } from 'src/app/services/logger.service';

@Component({
  selector: 'app-time-logger',
  templateUrl: './time-logger.component.html',
  styleUrls: ['./time-logger.component.css']
})
export class TimeLoggerComponent implements OnInit {
 
  display = 'none';
  // Delete Alerts
  deleteSuccessAlert!: String;
  deleteErrorAlert!: String;
  studentLogs : StudentLogs[] = [];
  // Update Alerts
  updateAlert!: string;
  updateSuccessAlert!: string;
  /*------------- Tabs JS ---------------*/
  activeTab = 'attendance';
  /*------------------------------------- */

  attendance(activeTab: string) {
    this.activeTab = activeTab;
  }
  studentLogger(activeTab: string) {
    this.activeTab = activeTab;
    this.getStudentLogsFromLogger();
  }
  //Pagination
  collectionSize: Array<any> = [];
  totalRecords: number = 0;
  page: number = 1;
  pageSize = 4;

  //Pagination_A
  totalRecords_A: number = 0;
  page_A: number = 1;

  //Filter Search
  filterTerm: string = '';

  //Filter Search_A
  filterTerm_A: string = '';

  //Sorting
  order: string = 'rollNo'; //check here
  order_A: string = 'rollNo_A';
  reverse: boolean = false;
  reverse_A: boolean = false;
  //sortedCollection: any[];

  // Rotate Icon Toggles
  // referenceId: boolean = false;
  rollNo: boolean = false;
  stuName: boolean = false;
  // ------------------
  rotate: string = 'noRotate';
  user: any;

  constructor(
    private route: Router,
    private orderPipe: OrderPipe,
    private logger: LoggerService,
  ) {
    //this.sortedCollection = orderPipe.transform(this.students, 'examName'); //sorting
  }

  ngOnInit(): void {
    // -------------------
    this.user = localStorage.getItem('user');
    this.user = JSON.parse(this.user);
  }

  //sorting
  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }
  setOrder_A(value: string) {
    if (this.order_A === value) {
      this.reverse_A = !this.reverse_A;
    }
    this.order_A = value;
  }
  sortRollNo() {
    this.rollNo = !this.rollNo;
  }
  sortStuName() {
    this.stuName = !this.stuName;
  }
  getStudentLogsFromLogger() : void{
    this.logger.fetchStudentLogs().subscribe((response) => {
      if (response.success) {
        console.log(response.message);
        this.studentLogs = response.logs;
      } else
      { 
        console.log(response.message);
      }
    })
  }
}
