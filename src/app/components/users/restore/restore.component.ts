import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderPipe } from 'ngx-order-pipe';
import { Student } from 'src/app/Models/Student';
import { DemoStudent } from 'src/app/Models/DemoStudent';
import { DashboardService } from 'src/app/services/dashboard.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Upload } from 'src/app/Models/Upload';
import { ExamService } from '../../../services/exam.service';
import { BatchService } from 'src/app/services/batch.service';
import { Batch } from 'src/app/Models/Batch';
import { AccountService } from 'src/app/services/account.service';
import { Account } from 'src/app/Models/Account';
import { RestoreService } from 'src/app/services/restore.service';

@Component({
  selector: 'app-restore',
  templateUrl: './restore.component.html',
  styleUrls: ['./restore.component.css'],
})
export class RestoreComponent implements OnInit {
  display = 'none';
  // Delete Alerts
  deleteSuccessAlert!: String;
  deleteErrorAlert!: String;
  // Update Alerts
  updateAlert!: string;
  updateSuccessAlert!: string;
  genBatchsuccessAlert!: String;
  genBatchErrorAlert!: String;
  /*------------- Tabs JS ---------------*/
  activeTab = 'admitted';
  // Form Declarations
  updateDemoStudentForm: FormGroup = new FormGroup({});

  admitted(activeTab: string) {
    this.activeTab = activeTab;
  }
  demoStudents(activeTab: string) {
    this.activeTab = activeTab;
  }
  genBatch(activeTab: string) {
    this.activeTab = activeTab;
    this.ngOnInit();
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
  order: string = 'referenceId'; //check here
  order_A: string = 'referenceId_A';
  reverse: boolean = false;
  reverse_A: boolean = false;
  sortedCollection: any[];

  batches: Batch[] = [];
  batchStrength: any = [];
  batchesJson: any[] = [];
  // Rotate Icon Toggles
  // referenceId: boolean = false;
  rollNo: boolean = false;
  stuName: boolean = false;
  // ------------------
  rotate: string = 'noRotate';
  user: any;
  public students: Student[] = [];
  public demoStu: DemoStudent[] = [];
  public studentxi: number = 0;
  public studentxii: number = 0;
  public studenttarget: number = 0;

  constructor(
    private fb: FormBuilder,
    private dashboardService: DashboardService,
    private restoreService: RestoreService,
    private route: Router,
    private orderPipe: OrderPipe,
    private router: Router,
    private examService: ExamService,
    private batchService: BatchService,
    private accountService: AccountService
  ) {
    this.sortedCollection = orderPipe.transform(this.students, 'examName'); //sorting
    this.sortedCollection = orderPipe.transform(this.accounts, 'rollNo_A'); //sorting
    this.sortedCollection = orderPipe.transform(this.pendingAccounts, 'rollNo'); //sorting
  }

  ngOnInit(): void {
    // -*------------------
    this.user = localStorage.getItem('user');
    this.user = JSON.parse(this.user);
    if (this.user.role == 'Student') {
      this.route.navigate(['/dashboard/student']);
    }
    this.fetchAllStudents();
    // this.dashboardService.fetchAllDemoStudents().subscribe((response) => {
    //   if (response.success) {
    //     this.demoStu = response.demoStudent;
    //   }
    // });
    this.fetchAllDemoStudents();
    /************Batch****************/
    this.restoreService.fetchAllRestorePointBatches().subscribe((response) => {
      if (response.success) {
        this.batches = response.batches;
        this.countBatchStrength(this.batches);
      }
    });

    /**********Exam Cell***********/
    // Fetch Batches
    this.batchService.fetchAllBatch().subscribe((response) => {
      if (response.success) {
        this.batches = response.batches;
      }
    });
    this.user = localStorage.getItem('user');
    this.user = JSON.parse(this.user);
    if (this.user.role != 'Exam Cell' && this.user.role != 'Admin') {
      this.router.navigate(['/dashboard']);
    }
    
    this.fetchAllExamData();
    // this.examService.fetchAllUploads().subscribe((uploads) => {
    //   if (uploads.success) {
    //     this.uploadList = uploads.uploads;
    //     this.totalRecords = uploads.uploads.length; //pagination
    //   } else {
    //     this.allAlert = uploads.msg;
    //   }
    // });
    /************Accountant**************/
    this.user = localStorage.getItem('user');
    this.user = JSON.parse(this.user);
    if (this.user.role != 'Accountant' && this.user.role != 'Admin') {
      this.router.navigate(['/dashboard']);
    }
    this.accountService.fetchAccounts().subscribe((response) => {
      if (response.success) {
        this.accounts = response.accounts;
        this.accounts.forEach((account) => {
          if (this.pendingInstallments(account) > 0) {
            var flag = 0;
            this.pendingAccounts.forEach((element) => {
              //CHECKING FOR DUPLICATE ACCOUNT
              if (element.rollNo == account.rollNo) {
                flag = 1;
              }
            });
            if (flag == 0) {
              this.pendingAccounts.push(account);
            }
          }
        });
      }
    });
  }

  //Count Batch Strength
  countBatchStrength(batches: any) {
    this.batches.forEach((batch: Batch) => {
      this.batchService.CountBatchStrength(batch._id).subscribe((response) => {
        if (response.success) {
          this.batchStrength.push({
            id: response.batch,
            count: response.count,
          });
        }
      });
    });
    this.generateBatchJson(batches);
  }

  //generate batch json
  generateBatchJson(batches: any) {
    if (batches.length == this.batchStrength.length) {
      for (let i = 0; i < batches.length; i++) {
        const element = batches[i];
        this.batchesJson.push({
          id: element._id,
          class: element.class,
          medium: element.medium,
          batch: element.batch,
          strength: this.batchStrength.filter(
            (b: any) => b.id === element._id
          )[0].count,
        });
      }
    }
  }

  pendingInstallments(account: any): number {
    var count = 0;
    if (account.statusOne) {
      count++;
      if (account.statusTwo) {
        count++;
        if (account.statusThree) {
          count++;
          if (account.statusFour) {
            count++;
          }
        }
      }
    }
    return account.noOfInstallment - count;
  }

  //get list of all students
  fetchAllStudents() {
    this.restoreService.fetchAllStudents().subscribe((response) => {
      if (response.success) {
        this.students = response.students;
        this.totalRecords = response.students.length; //pagination
        this.students.forEach((student) => {
          if (student.class === '11') this.studentxi++;
          if (student.class === '12') this.studentxii++;
          if (student.class === 'Target') this.studenttarget++;
        });
      } else {
        //this.allAlert = response.msg;
      }
    });
  }

  //get list of all Demo students
  fetchAllDemoStudents() {
    this.restoreService.fetchAllDemoStudents().subscribe((response) => {
      if (response.success) {
        this.demoStu = response.demostudents;
        //this.totalRecords = response.demostudents.length; //pagination
      } else {
        //this.allAlert = response.msg;
      }
    });
  }

  //get list of all Demo students
  fetchAllExamData() {
    this.restoreService.fetchAllExamData().subscribe((uploads) => {
      if (uploads.success) {
        this.uploadList = uploads.uploads;
        this.totalRecords = uploads.uploads.length; //pagination
      } else {
        this.allAlert = uploads.msg;
      }
    });
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
  // Delete Admitted Student
  deleteStudent(student: Student): void {
    let confirm = window.confirm(
      'Are you sure you wan to delete this admitted student?'
    );
    let confirm_again = window.confirm(
      'ARE YOU COMPLETELY SURE WITH YOUR ACTION. CONTINUE?'
    );
    if (confirm) {
      if (confirm_again) {
      // Removing From the UI
      this.students = this.students.filter(
        (s: Student) => s._id !== student._id
      );
      this.dashboardService.deleteStudent(student._id).subscribe((response) => {
        if (response.success) {
          this.deleteSuccessAlert = response.msg;
        } else {
          this.deleteErrorAlert = response.msg;
        }
      });
    }
   }
  }

  deleteDemoStudent(student: DemoStudent): void {
    let confirm = window.confirm(
      'Are you sure you want to delete this demo student?'
    );
    let confirm_again = window.confirm(
      'ARE YOU COMPLETELY SURE WITH YOUR ACTION. CONTINUE?'
    );
    if (confirm) {
      if (confirm_again) {
      // Removing From the UI
      this.demoStu = this.demoStu.filter(
        (u: DemoStudent) => u._id !== student._id
      );
      this.dashboardService
        .deleteDemoStudent(student._id)
        .subscribe((response) => {
          if (response.success) {
            this.deleteSuccessAlert = response.msg;
          } else {
            this.deleteErrorAlert = response.msg;
          }
        });
      }
    }
  }

  restoreAdmittedStudent(student: Student): void {
    let confirm = window.confirm(
      'Are you sure you want to restore this admitted student?'
    );
    if (confirm) {
    // Removing From the UI
    this.students = this.students.filter((s: Student) => s._id !== student._id);
    this.restoreService
      .restoreStudent(student._id)
      .subscribe((response) => {
        if (response.success) {
          this.deleteSuccessAlert = response.msg;
        } else {
          this.deleteErrorAlert = response.msg;
        }
      });
    }
  }

  restoreDemoStudent(student: DemoStudent): void {
    let confirm = window.confirm(
      'Are you sure you want to restore this demo student?'
    );
    if (confirm) {
    // Removing From the UI
    this.demoStu = this.demoStu.filter((u: DemoStudent) => u._id !== student._id);
    this.restoreService
      .restoreDemoStudent(student._id)
      .subscribe((response) => {
        if (response.success) {
          this.deleteSuccessAlert = response.msg;
        } else {
          this.deleteErrorAlert = response.msg;
        }
      });
    }
  }

  restoreExamCell(upload : Upload): void {
    let confirm = window.confirm(
      'Are you sure you want to restore this Exam Data?'
    );
    if (confirm) {
    // Removing From the UI
    this.uploadList = this.uploadList.filter(
      (u: Upload) => u._id !== upload._id
    );
    this.restoreService
      .restoreExamData(upload._id)
      .subscribe((response) => {
        if (response.success) {
          this.deleteSuccessAlert = response.msg;
        } else {
          this.deleteErrorAlert = response.msg;
        }
      });
    }
  }

  restoreAccountant() {}

  restoreBatch() {}

  //Batch Delete
  onDeleteBatch(batch: any) {
    let confirm = window.confirm(
      'Data of students associated with this batch will also be deleted. Continue?'
    );
    let confirm_again = window.confirm(
      'ARE YOU COMPLETELY SURE WITH YOUR ACTION. CONTINUE?'
    );
    if (confirm) {
      if (confirm_again) {
        //Delete batch from UI
        this.batchesJson = this.batchesJson.filter(
          (b: any) => b.id !== batch.id
        );
        //Delete batch from backend
        this.batchService.delBatch(batch.id).subscribe((response) => {
          if (response.success) {
            this.genBatchsuccessAlert = response.msg;
          } else {
            this.genBatchErrorAlert = response.msg;
          }
        });
      }
    }
  }

  // todayDate: Date = new Date();
  /*------------- Tabs JS ---------------*/

  //Upload section tab
  demo(activeTab: string) {
    this.activeTab = activeTab;
  }

  //Msg Section tab
  card(activeTab: string) {
    this.activeTab = activeTab;
    this.ngOnInit();
  }
  // Form Declarations
  uploadForm: FormGroup = new FormGroup({});
  // Update Upload Form
  updateUploadForm: FormGroup = new FormGroup({});
  // Alerts
  allAlert!: String;
  successAlert!: String;
  uploadList: Upload[] = [];
  /*------------------------------------- */

  deleteUpload(upload: Upload): void {
    let confirm = window.confirm(
      'Are You Sure You Want To Delete The Uploaded Data. Continue?'
    );
    let confirm_again = window.confirm(
      'ARE YOU COMPLETELY SURE WITH YOUR ACTION. CONTINUE?'
    );
    if (confirm) {
      if (confirm_again) {
      // Removing From the UI
      this.uploadList = this.uploadList.filter(
        (u: Upload) => u._id !== upload._id
      );
      // Removing from the json server and go to contact.service.ts
      this.examService.deleteUpload(upload._id).subscribe((response) => {
        if (response.success) {
          this.deleteSuccessAlert = response.msg;
        } else {
          this.deleteErrorAlert = response.msg;
        }
      });
    }
   }
  }

  fetchStudents(batch: any) {
    this.batchService.FetchBatchStudents(batch).subscribe((response) => {
      if (response.success) {
        this.students = response.students;
      } else {
        this.updateAlert = response.msg;
      }
    });
  }

  /**********Accountant Portion**************/

  // Avataar Image on Card
  idUrl: any = '';

  // Using demoStudent Model for Declaration
  demoStudent: DemoStudent = new DemoStudent();
  student: Student = new Student();
  accounts: Account[] = [];
  pendingAccounts: Account[] = [];
  account: Account = new Account();
  paySlipAccount: Account = new Account();
  paySlipAmount: number = 0;
  receiptNo: number = 0;
  smsAccount: Account = new Account();
  feeDueDate: Date = new Date();
  arrayOfInstallments: Array<any> = new Array();

  // Pending Dues Toggle
  dueFeesToggle: boolean = false;
  displayInstallmentToggle: boolean = false;
  /*------------- Tabs JS ---------------*/

  dash(activeTab: string) {
    this.activeTab = activeTab;
  }
  payslip(activeTab: string) {
    this.activeTab = activeTab;
  }
  generatepayslip(activeTab: string) {
    this.activeTab = activeTab;
  }
  feescard(activeTab: string) {
    this.ngOnInit();
    activeTab = 'feescard';
    this.activeTab = activeTab;
  }
  // Pills in Payslip Tab
  activePill = 'new';

  new(activePill: string) {
    this.activePill = activePill;
  }
  update(activePill: string) {
    this.activePill = activePill;
  }

  // New PayslipForm Declarations
  payslipForm: FormGroup = new FormGroup({});
  // Fetch Payslip Form Declarations
  fetchPayslipForm: FormGroup = new FormGroup({});
  // Update Payslip Form Declarations
  updatePayslipForm: FormGroup = new FormGroup({});
  // ID Card Reference Form
  idCardForm: FormGroup = new FormGroup({});

  // Error Message
  referenceAlert!: String;
  //Delete Account alerts
  delAccSuccessAlert!: String;
  delAccErrorAlert!: String;

  dueFeesStudent() {
    this.dueFeesToggle = !this.dueFeesToggle;
  }

  nextDueDate(account: any): any {
    if (!account.statusOne) {
      return account.installDateOne;
    } else if (!account.statusTwo) {
      return account.installDateTwo;
    } else if (!account.statusThree) {
      return account.installDateThree;
    } else if (!account.statusFour) {
      return account.installDateFour;
    } else {
      return null;
    }
  }

  nextDueDateFees() {
    var account = this.account;

    if (!account.statusOne) {
      this.feeDueDate = account.installDateOne;
    } else if (!account.statusTwo) {
      this.feeDueDate = account.installDateTwo;
    } else if (!account.statusThree) {
      this.feeDueDate = account.installDateThree;
    } else if (!account.statusFour) {
      this.feeDueDate = account.installDateFour;
    } else {
      this.feeDueDate = account.installDateFour;
    }
  }

  onDelete(account: Account) {
    let confirm = window.confirm(
      'Account of this student will be permanently deleted. Continue?'
    );
    let confirm_again = window.confirm(
      'ARE YOU COMPLETELY SURE WITH YOUR ACTION. CONTINUE?'
    );
    if (confirm) {
      if (confirm_again) {
        // Removing From the UI
        this.accounts = this.accounts.filter(
          (acc: Account) => acc._id !== account._id
        );
        this.pendingAccounts = this.pendingAccounts.filter(
          (acc: Account) => acc._id !== account._id
        );
        // Removing from the json server and go to contact.service.ts
        this.accountService.deleteAccount(account._id).subscribe((response) => {
          if (response.success) {
            this.delAccSuccessAlert = response.msg;
          } else {
            this.delAccErrorAlert = response.msg;
          }
        });
      }
    }
  }
  refreshCurrentComponent() {
    console.log('Refresh Restore Component');
  }
}
