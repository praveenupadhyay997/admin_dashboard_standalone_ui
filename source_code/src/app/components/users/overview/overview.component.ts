import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderPipe } from 'ngx-order-pipe';
import { Student } from 'src/app/Models/Student';
import { DemoStudent } from 'src/app/Models/DemoStudent';
import { DashboardService } from 'src/app/services/dashboard.service';
import * as XLSX from 'xlsx';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

type AOA = any[][];

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css'],
})
export class OverviewComponent implements OnInit {
  display = 'none';
  // Delete Alerts
  deleteSuccessAlert!: String;
  deleteErrorAlert!: String;
  // Update Alerts
  updateAlert!: string;
  updateSuccessAlert!: string;
  /*------------- Tabs JS ---------------*/
  activeTab = 'admitted';
  // Form Declarations
  updateDemoStudentForm: FormGroup = new FormGroup({});
  // Getter Method
  get name() {
    return this.updateDemoStudentForm.get('name');
  }
  get fname() {
    return this.updateDemoStudentForm.get('fname');
  }
  get category() {
    return this.updateDemoStudentForm.get('category');
  }
  get contact() {
    return this.updateDemoStudentForm.get('contact');
  }
  // Educational
  get class() {
    return this.updateDemoStudentForm.get('class');
  }
  get medium() {
    return this.updateDemoStudentForm.get('medium');
  }
  get state() {
    return this.updateDemoStudentForm.get('state');
  }
  get district() {
    return this.updateDemoStudentForm.get('district');
  }
  // Address
  get address() {
    return this.updateDemoStudentForm.get('address');
  }
  get reference_from() {
    return this.updateDemoStudentForm.get('reference_from');
  }

  // Couseller
  get cname() {
    return this.updateDemoStudentForm.get('cname');
  }
  get cabin() {
    return this.updateDemoStudentForm.get('cabin');
  }
  // Categories Array
  categories: any = [
    { id: 'General', name: 'General' },
    { id: 'SC', name: 'SC' },
    { id: 'ST', name: 'ST' },
    { id: 'OBC', name: 'OBC' },
    { id: 'EWS', name: 'EWS' },
  ];
  classes: any = [
    { id: '11', name: '11' },
    { id: '12', name: '12' },
    { id: 'Target', name: 'Target' },
  ];
  mediums: any = [
    { id: 'Hindi', name: 'Hindi' },
    { id: 'English', name: 'English' },
  ];
  cabins: any = [
    { id: 'A', name: 'A' },
    { id: 'B', name: 'B' },
    { id: 'C', name: 'C' },
    { id: 'D', name: 'D' },
    { id: 'E', name: 'E' },
    { id: 'F', name: 'F' },
  ];
  /*------------------------------------- */

  admitted(activeTab: string) {
    this.activeTab = activeTab;
  }
  demoStudents(activeTab: string) {
    this.activeTab = activeTab;
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
  headers: String[] = [
    'Reference No',
    'Roll No',
    'Student Name',
    "Father's Name",
    'Batch',
    'Counsellor Name',
  ];

  constructor(
    private fb: FormBuilder,
    private dashboardService: DashboardService,
    private route: Router,
    private orderPipe: OrderPipe
  ) {
    this.sortedCollection = orderPipe.transform(this.students, 'examName'); //sorting
  }

  ngOnInit(): void {
    // Demo Student Edit Form
    this.createUpdateDemoStudentForm();
    // -*------------------
    this.user = localStorage.getItem('user');
    this.user = JSON.parse(this.user);
    if (this.user.role == 'Student') {
      this.route.navigate(['/dashboard/student']);
    }
    this.fetchAllStudents();
    this.dashboardService.fetchAllDemoStudents().subscribe((response) => {
      if (response.success) {
        this.demoStu = response.demoStudent;
        this.demoStu.forEach((student) => {
          //For Excel
          var demoRow: any[] = [];
          demoRow.push(student.referenceId);
          demoRow.push(student.fullName);
          demoRow.push(student.fatherName);
          demoRow.push(student.studentContact);
          demoRow.push(student.class);
          demoRow.push(student.counsellorName);
          this.demoData.push(demoRow);
        });
      }
    });
  }
  // Autofill For Updating Student
  autoFillForm(student: DemoStudent) {
    this.updateDemoStudentForm.patchValue({
      demoStudentId: student._id,
      name: student.fullName,
      fname: student.fatherName,
      category: student.category,
      contact: student.studentContact,
      class: student.class,
      medium: student.medium,
      state: student.state,
      district: student.district,
      address: student.address,
      reference_from: student.referenceMedium,
      cname: student.counsellorName,
      cabin: student.counsellorCabin,
    });
  }
  // Edit Demo Student Form Validation
  createUpdateDemoStudentForm(): void {
    this.updateDemoStudentForm = this.fb.group({
      demoStudentId: [''],
      name: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[a-zA-z]+([\s][a-zA-Z]+)*$/),
        ]),
      ],
      fname: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-z]+([\s][a-zA-Z]+)*$/),
        ],
      ],
      category: ['', Validators.required],
      contact: [
        '',
        [Validators.required, Validators.pattern('^((\\+91-?)|0)?[0-9]{10}$')],
      ],
      class: ['', Validators.required],
      medium: ['', Validators.required],
      state: [
        '',
        [
          Validators.required,
          Validators.pattern('[A-Z][a-z]+(?: +[A-Z][a-z]+)*'),
        ],
      ],
      district: [
        '',
        [
          Validators.required,
          Validators.pattern('[A-Z][a-z]+(?: +[A-Z][a-z]+)*'),
        ],
      ],
      address: ['', [Validators.required, Validators.minLength(10)]],
      reference_from: ['', [Validators.required, Validators.minLength(10)]],
      cname: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-z]+([\s][a-zA-Z]+)*$/),
        ],
      ],
      cabin: ['', Validators.required],
    });
  }
  onUpdateDemoStudent(): void {
    if (this.updateDemoStudentForm.valid) {
      this.dashboardService
        .updateDemoStudent(this.updateDemoStudentForm.value)
        .subscribe((response) => {
          if (response.success) {
            this.ngOnInit();
            this.onCloseHandled();
            this.updateSuccessAlert = response.msg;
          } else {
            this.updateAlert = response.msg;
          }
        });
    } else {
      this.updateAlert = 'Please fill all valid detials';
    }
  }
  //get list of all students
  fetchAllStudents() {
    this.dashboardService.fetchAllStudents().subscribe((response) => {
      if (response.success) {
        //pagination starts
        //this.datas = response.results;
        //this.totalRecords = response.results.length;
        //pagination ends
        this.students = response.students;
        this.totalRecords = response.students.length; //pagination
        this.students.forEach((student) => {
          if (student.class === '11') this.studentxi++;
          if (student.class === '12') this.studentxii++;
          if (student.class === 'Target') this.studenttarget++;
          //For Excel
          var row: any[] = [];
          row.push(student.referenceId);
          row.push(student.rollNo);
          row.push(student.fullName);
          row.push(student.fatherName);
          row.push(student.batch.batch);
          row.push(student.counsellorName);
          this.data.push(row);
        });
      } else {
        //this.allAlert = response.msg;
      }
    });
  }
  onProfileView(rollNo: any): void {
    this.route.navigate(['/dashboard/student'], { state: { rollNo: rollNo } });
  }

  // Converting Admitted Student Table to Excel File
  data: AOA = [this.headers];
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
  fileName: string =
    new Date().toLocaleString().toString() + '_TotalAdmittedStud.xlsx';

  // Converting Demo Student Table to Excel File
  demoData: AOA = [this.headers];
  demowopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
  demofileName: string =
    new Date().toLocaleString().toString() + '_TotalDemoStud.xlsx';

  export(): void {
    /* generate worksheet */
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.data);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, this.fileName);
  }

  exportDemo(): void {
    /* generate worksheet */
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.demoData);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, this.demofileName);
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
  // Deactivate Admitted Student
  deactivateStudent(student: Student): void {
    let confirm = window.confirm(
      'Are you sure you want to delete this admitted student?'
    );
    let confirm_again = window.confirm(
      'ARE YOU COMPLETELY SURE WITH YOUR ACTION. CONTINUE?'
    );
    if (confirm) {
      if (confirm_again) {
    // Removing From the UI
    this.students = this.students.filter((s: Student) => s._id !== student._id);
    this.dashboardService
      .deactivateStudent(student._id)
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

  // Deactivate Demo Student
  deactivateDemoStudent(student: DemoStudent): void {
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
        .deactivateDemoStudent(student._id)
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
  // -------------------- Modal ------------------------
  openModal(student: DemoStudent) {
    this.display = 'block';
    this.autoFillForm(student);
  }
  onCloseHandled() {
    this.display = 'none';
  }
  refreshAdmittedStudent() {
    window.location.reload();
    this.activeTab = 'admitted';
    console.log('Refresh Tab 1');
  }

  refreshDemoStudent() {
    window.location.reload();
    this.activeTab = 'demoStudents';
    console.log('Refresh Tab 2');
  }
}
