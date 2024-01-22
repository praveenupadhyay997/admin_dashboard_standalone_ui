import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ReceptionService } from '../../../services/reception.service';
import { DemoStudent } from 'src/app/Models/DemoStudent';
import { Student } from 'src/app/Models/Student';
import { BatchService } from 'src/app/services/batch.service';
import { Batch } from 'src/app/Models/Batch';
import { OrderPipe } from 'ngx-order-pipe';
import { AccountService } from 'src/app/services/account.service';
import { Account } from 'src/app/Models/Account';
import * as XLSX from 'xlsx';
import { StudentLogs } from 'src/app/Models/StudentLogs';
import { LoggerService } from 'src/app/services/logger.service';

type AOA = any[][];

@Component({
  selector: 'app-admission',
  templateUrl: './admission.component.html',
  styleUrls: ['./admission.component.css'],
})
export class AdmissionComponent implements OnInit {
  /*----------------Demo Card Section--------------------- */
  // Flip Reference Card
  printButton_democard: string = 'disabled';
  printButton_feescard: string = 'disabled';
  refId: String = '';
  // Valid Upto Date Format
  days = 3;
  validUpto = new Date(Date.now() + this.days * 24 * 60 * 60 * 1000);

  // Reference Form
  demoCardForm: FormGroup = new FormGroup({});
  // Error Message
  allAlert!: String;
  successDemoAlert!: String;
  referenceDemoAlert!: String;
  /*------------------Fees Card Section------------------- */
  // Flip Fees Card
  // flipped = false;
  rollNo: number = 0;

  todayDate: Date = new Date();
  // Using demoStudent Model for Declaration
  accounts: Account[] = [];
  pendingAccounts: Account[] = [];
  account: Account = new Account();
  feeDueDate: Date = new Date();
  arrayOfInstallments: Array<any> = new Array();

  // ID Card Reference Form
  feesCardForm: FormGroup = new FormGroup({});

  // Error Message
  referenceFeesCardAlert!: String;
  successFeesCardAlert!: String;

  // Image Upload
  url: any = '';
  idUrl: any = '';
  // Flip Demo Card
  flipped_demo = false;
  // Flip Fees Card
  flipped_feescard = false;
  // Using demoStudent Model for Declaration
  demoStudent: DemoStudent = new DemoStudent();
  student: Student = new Student();
  studentLog: StudentLogs = new StudentLogs();
  batches: Batch[] = [];
  batchStrength: any = [];
  batchesJson: any[] = [];
  //Export Excel
  headers: String[] = ['Class', 'Medium', 'Batch Name', 'Total Students'];

  //Pagination
  collectionSize: Array<any> = [];
  totalRecords: number = 0;
  page: number = 1;
  pageSize = 4;

  //Filter Search
  filterTerm: string = '';

  //Sorting
  order: string = 'class'; //check here
  reverse: boolean = false;
  sortedCollection: any[];

  /*------------- Tabs JS ---------------*/
  activeTab = 'demo';
  user: any;

  demo(activeTab: string) {
    this.activeTab = activeTab;
  }
  card(activeTab: string) {
    this.activeTab = activeTab;
  }
  genDemoCard(activeTab: string) {
    this.activeTab = activeTab;
    this.ngOnInit();
  }
  feeCard(activeTab: string) {
    this.activeTab = activeTab;
    this.ngOnInit();
    activeTab = 'feecard';
  }
  genBatch(activeTab: string) {
    this.activeTab = activeTab;
    this.ngOnInit();
  }
  // Generate Card Toggle
  genCardToggle: boolean = false;
  // Fetch Admission Details
  fetchReferenceForm: FormGroup = new FormGroup({});
  // Admission Form
  studentForm: FormGroup = new FormGroup({});
  // ID Card Reference Form
  idCardForm: FormGroup = new FormGroup({});
  // Generate Batch
  genBatchForm: FormGroup = new FormGroup({});
  // Error + Succcess Messages for fetching details
  fetchSuccessAlert!: String;
  fetchErrorAlert!: String;
  // Error + Succcess Messages for admission form
  registerErrorAlert!: String;
  registerSuccessAlert!: String;
  // Error + Succcess Messages Card Genearation Messages
  successAlert!: String;
  referenceAlert!: String;
  // Error + Succcess (  Generate Messages)
  genBatchErrorAlert!: String;
  genBatchsuccessAlert!: String;
  // Getter Method
  // Fetch Referenced id Details
  get reference_no() {
    return this.fetchReferenceForm.get('reference_no');
  }
  // ----------------Student Form Details-----------
  get referenceid() {
    return this.studentForm.get('referenceid');
  }
  get rollno() {
    return this.studentForm.get('rollno'); //
  }
  get file() {
    return this.studentForm.get('file');
  }
  get name() {
    return this.studentForm.get('name'); //students full name
  }
  get fname() {
    return this.studentForm.get('fname'); //
  }
  get mname() {
    return this.studentForm.get('mname'); //
  }
  get email() {
    return this.studentForm.get('email'); //
  }
  get focc() {
    return this.studentForm.get('focc'); //father's occupation
  }
  get mocc() {
    return this.studentForm.get('mocc'); //mothers's occupation
  }
  get contact() {
    return this.studentForm.get('contact'); //student contact
  }
  get fmno() {
    return this.studentForm.get('fmno'); //fathers mob no
  }
  get mmno() {
    return this.studentForm.get('mmno'); //mothers mob no
  }
  get lgmno() {
    return this.studentForm.get('lgmno'); //local guardian mob no
  }
  get dob() {
    return this.studentForm.get('dob'); //strudent dob
  }
  get aadhaarno() {
    return this.studentForm.get('aadhaarno'); //student's adhaar
  }
  get category() {
    return this.studentForm.get('category'); //
  }
  get pwd() {
    return this.studentForm.get('pwd');
  }
  // Address
  get state() {
    return this.studentForm.get('state'); //
  }
  get district() {
    return this.studentForm.get('district'); //
  }
  get address() {
    return this.studentForm.get('address'); //
  }
  get localaddress() {
    return this.studentForm.get('localaddress'); //
  }
  get lgaddress() {
    return this.studentForm.get('lgaddress'); //
  }
  get reference_from() {
    return this.studentForm.get('reference_from'); //
  }
  get class() {
    return this.studentForm.get('class'); //
  }
  get medium() {
    return this.studentForm.get('medium'); //
  }
  // Couseller
  get cname() {
    return this.studentForm.get('cname'); //
  }
  get cabin() {
    return this.studentForm.get('cabin'); //
  }
  get poyoX() {
    return this.studentForm.get('poyoX'); //pass year 10
  }
  get poyoXI() {
    return this.studentForm.get('poyoXI'); //pass year 11
  }
  get poyoXII() {
    return this.studentForm.get('poyoXII'); //pass year 12
  }
  get pastneetmarks() {
    return this.studentForm.get('pastneetmarks');
  }
  get gradeX() {
    return this.studentForm.get('gradeX'); //grades in 10 class
  }
  get gradeXI() {
    return this.studentForm.get('gradeXI'); //grades in 11 class
  }
  get gradeXII() {
    return this.studentForm.get('gradeXII'); //grades in 12 class
  }
  get pastneetair() {
    return this.studentForm.get('pastneetair'); //past neet AIR
  }
  get schoolnameX() {
    return this.studentForm.get('schoolnameX'); //School Name 10
  }
  get schoolnameXI() {
    return this.studentForm.get('schoolnameXI'); //School Name 11
  }
  get schoolnameXII() {
    return this.studentForm.get('schoolnameXII'); ///School Name 12
  }
  get pastneetattemptsno() {
    return this.studentForm.get('pastneetattemptsno'); ///No of attempts in neet
  }
  get schooladdX() {
    return this.studentForm.get('schooladdX'); //School Address of 10
  }
  get schooladdXI() {
    return this.studentForm.get('schooladdXI'); //School Address of 11
  }
  get schooladdXII() {
    return this.studentForm.get('schooladdXII'); //School Address of 12
  }
  get pastneetremarks() {
    return this.studentForm.get('pastneetremarks');
  }
  //Coaching Ref Details
  get acadyear() {
    return this.studentForm.get('acadyear');
  }
  get batch() {
    return this.studentForm.get('batch');
  }
  get bag() {
    return this.studentForm.get('bag');
  }
  get modulecard() {
    return this.studentForm.get('modulecard');
  }
  //--------------------------- Real ID Card----------------
  get roll_no() {
    return this.idCardForm.get('roll_no');
  }

  // Generate Batch Getter Method
  get genBatchClass() {
    return this.genBatchForm.get('genBatchClass');
  }
  get genBatchMedium() {
    return this.genBatchForm.get('genBatchMedium');
  }
  get genBatchText() {
    return this.genBatchForm.get('genBatchText');
  }
  // ----------------------------
  classes: any = [
    { id: '11', name: '11' },
    { id: '12', name: '12' },
    { id: 'Target', name: 'Target' },
  ];
  mediums: any = [
    { id: 'Hindi', name: 'Hindi' },
    { id: 'English', name: 'English' },
  ];
  pwds: any = [
    { id: 'Yes', name: 'Yes' },
    { id: 'No', name: 'No' },
  ];
  bags: any = [
    { id: 'Yes', name: 'Yes' },
    { id: 'No', name: 'No' },
  ];
  modulecards: any = [
    { id: 'Yes', name: 'Yes' },
    { id: 'No', name: 'No' },
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
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private receptionService: ReceptionService,
    private batchService: BatchService,
    private router: Router,
    private orderPipe: OrderPipe,
    private accountService: AccountService,
    private logger: LoggerService
  ) {
    this.sortedCollection = orderPipe.transform(this.batches, 'examName'); //sorting
  }

  ngOnInit(): void {
    this.user = localStorage.getItem('user');
    this.user = JSON.parse(this.user);
    if (this.user.role != 'IT Cell' && this.user.role != 'Admin') {
      this.router.navigate(['/dashboard']);
    }
    this.batchService.fetchAllBatch().subscribe((response) => {
      if (response.success) {
        this.batches = response.batches;
        this.countBatchStrength(this.batches);
      }
    });
    this.accountService.fetchAccounts().subscribe((response) => {
      if (response.success) {
        this.accounts = response.accounts;
      }
    });
    this.createFetchReferenceForm(); //Fetch Reference Form
    this.createStudentForm(); //Fill Referenced Details
    this.createIdCardForm(); //Id Card Form
    // Generate Batch
    this.createNewBatchForm();
    this.createReferenceForm(); //Demo Card Form
    this.createFeesCardForm(); //Fees Card Form
  }

  // Converting Table to Excel File
  data: AOA = [this.headers];
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
  fileName: string = new Date().toLocaleString().toString() + '_SheetJS.xlsx';

  export(): void {
    if (this.batchesJson.length > 0) {
      this.batchesJson.forEach((batch) => {
        //For Excel
        //For Excel
        var row: any[] = [];
        row.push(batch.class);
        row.push(batch.medium);
        row.push(batch.batch);
        row.push(batch.strength); //batch strength
        this.data.push(row);
      });
    }
    /* generate worksheet */
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.data);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, this.fileName);
  }

  //sorting
  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  //----------------------Fetch Reference Validation--------------------------------------------------------------
  createFetchReferenceForm(): void {
    this.fetchReferenceForm = this.fb.group({
      reference_no: ['', Validators.required],
    });
  }
  // onReference Fetch Details Form Method
  fetchReference(): void {
    if (this.fetchReferenceForm.valid) {
      this.receptionService
        .getDemoStudent(this.fetchReferenceForm.value)
        .subscribe((response) => {
          if (response.success) {
            this.demoStudent = response.demoStudent;
            this.fetchSuccessAlert = 'Details Fetched Successfully';
            this.autoFillForm();
          } else {
            this.fetchErrorAlert = 'Reference no. not found. Please try again.';
          }
        });
    } else {
      this.fetchErrorAlert = 'All fields are required to register.';
    }
  }
  //-------------------------Fill Referenced Details Validation Rules--------------------------------------------
  createStudentForm(): void {
    this.studentForm = this.fb.group({
      referenceid: [''], //Enter Pattern later on
      rollno: ['', [Validators.required]],
      file: [''],
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
      mname: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-z]+([\s][a-zA-Z]+)*$/),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      focc: [''],
      mocc: [''],
      contact: [
        '',
        [Validators.required, Validators.pattern('^((\\+91-?)|0)?[0-9]{10}$')],
      ],
      fmno: [''],
      mmno: [''],
      lgmno: [''],
      dob: ['', [Validators.required]],
      aadhaarno: ['', [Validators.required, Validators.pattern('[0-9]{12}$')]],
      category: ['', Validators.required],
      pwd: [''],
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
      localaddress: ['', [Validators.required, Validators.minLength(10)]],
      lgaddress: [''],
      reference_from: ['', [Validators.required, Validators.minLength(5)]],
      class: ['', Validators.required],
      medium: ['', Validators.required],
      cname: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-z]+([\s][a-zA-Z]+)*$/),
        ],
      ],
      cabin: ['', Validators.required],
      poyoX: [''],
      poyoXI: [''],
      poyoXII: [''],
      pastneetmarks: [''],
      gradeX: [''],
      gradeXI: [''],
      gradeXII: [''],
      pastneetair: [''],
      schoolnameX: [''],
      schoolnameXI: [''],
      schoolnameXII: [''],
      pastneetattemptsno: [''],
      schooladdX: [''],
      schooladdXI: [''],
      schooladdXII: [''],
      pastneetremarks: [''],
      acadyear: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(19[5-9]\d|20[0-4]\d|2999)$/),
        ],
      ],
      batch: ['', [Validators.required]],
      bag: [''],
      modulecard: [''],
    });
  }
  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.studentForm.get('file')?.setValue(file);
      // File Read and display
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      reader.onload = (event) => {
        // called once readAsDataURL is completed
        this.url = event.target?.result;
      };
    }
  }
  autoFillForm() {
    this.studentForm.patchValue({
      referenceid: this.demoStudent.referenceId,
      name: this.demoStudent.fullName,
      fname: this.demoStudent.fatherName,
      category: this.demoStudent.category,
      contact: this.demoStudent.studentContact,
      class: this.demoStudent.class,
      medium: this.demoStudent.medium,
      state: this.demoStudent.state,
      district: this.demoStudent.district,
      address: this.demoStudent.address,
      reference_from: this.demoStudent.referenceMedium,
      cname: this.demoStudent.counsellorName,
      cabin: this.demoStudent.counsellorCabin,
    });
  }
  // Fill Student Referenced Form Details Method
  onRegister(): void {
    if (this.studentForm.valid) {
      const formData = new FormData();
      formData.append(
        'referenceid',
        this.studentForm.get('referenceid')?.value
      );
      formData.append('rollno', this.studentForm.get('rollno')?.value);
      formData.append('name', this.studentForm.get('name')?.value);
      formData.append('fname', this.studentForm.get('fname')?.value);
      formData.append('mname', this.studentForm.get('mname')?.value);
      formData.append('email', this.studentForm.get('email')?.value);
      formData.append('focc', this.studentForm.get('focc')?.value);
      formData.append('mocc', this.studentForm.get('mocc')?.value);
      formData.append('contact', this.studentForm.get('contact')?.value);
      formData.append('fmno', this.studentForm.get('fmno')?.value);
      formData.append('mmno', this.studentForm.get('mmno')?.value);
      formData.append('lgmno', this.studentForm.get('lgmno')?.value);
      formData.append('dob', this.studentForm.get('dob')?.value);
      formData.append('aadhaarno', this.studentForm.get('aadhaarno')?.value);
      formData.append('category', this.studentForm.get('category')?.value);
      formData.append('pwd', this.studentForm.get('pwd')?.value);
      formData.append('state', this.studentForm.get('state')?.value);
      formData.append('district', this.studentForm.get('district')?.value);
      formData.append('address', this.studentForm.get('address')?.value);
      formData.append(
        'localaddress',
        this.studentForm.get('localaddress')?.value
      );
      formData.append('lgaddress', this.studentForm.get('lgaddress')?.value);
      formData.append(
        'reference_from',
        this.studentForm.get('reference_from')?.value
      );
      formData.append('class', this.studentForm.get('class')?.value);
      formData.append('medium', this.studentForm.get('medium')?.value);
      formData.append('cname', this.studentForm.get('cname')?.value);
      formData.append('cabin', this.studentForm.get('cabin')?.value);
      formData.append('poyoX', this.studentForm.get('poyoX')?.value);
      formData.append('poyoXI', this.studentForm.get('poyoXI')?.value);
      formData.append('poyoXII', this.studentForm.get('poyoXII')?.value);
      formData.append(
        'pastneetmarks',
        this.studentForm.get('pastneetmarks')?.value
      );
      formData.append('gradeX', this.studentForm.get('gradeX')?.value);
      formData.append('gradeXI', this.studentForm.get('gradeXI')?.value);
      formData.append('gradeXII', this.studentForm.get('gradeXII')?.value);
      formData.append(
        'pastneetair',
        this.studentForm.get('pastneetair')?.value
      );
      formData.append(
        'schoolnameX',
        this.studentForm.get('schoolnameX')?.value
      );
      formData.append(
        'schoolnameXI',
        this.studentForm.get('schoolnameXI')?.value
      );
      formData.append(
        'schoolnameXII',
        this.studentForm.get('schoolnameXII')?.value
      );
      formData.append(
        'pastneetattemptsno',
        this.studentForm.get('pastneetattemptsno')?.value
      );
      formData.append('schooladdX', this.studentForm.get('schooladdX')?.value);
      formData.append(
        'schooladdXI',
        this.studentForm.get('schooladdXI')?.value
      );
      formData.append(
        'schooladdXII',
        this.studentForm.get('schooladdXII')?.value
      );
      formData.append(
        'pastneetremarks',
        this.studentForm.get('pastneetremarks')?.value
      );
      formData.append('acadyear', this.studentForm.get('acadyear')?.value);
      formData.append('batch', this.studentForm.get('batch')?.value);
      formData.append('bag', this.studentForm.get('bag')?.value);
      formData.append('modulecard', this.studentForm.get('modulecard')?.value);
      formData.append('file', this.studentForm.value.file);
      this.authService.admitStudent(formData).subscribe((response) => {
        if (response.success) {
          this.studentForm.reset();
          this.activeTab = 'card';
          this.registerSuccessAlert = response.msg;
          this.logRegistrationToBatch(this.studentForm.value, 'batchregister');
        } else {
          this.registerErrorAlert = response.msg;
          this.router.navigate(['/dashboard/admission']);
        }
      });
    } else {
      this.registerErrorAlert =
        'All required fields are mandatory to register.';
    }
  }
  //-----------------------------IdCard Form Validation Rules-------------------------------------------
  createIdCardForm(): void {
    this.idCardForm = this.fb.group({
      roll_no: ['', Validators.required],
    });
  }
  // -Demo Card Method
  onGenerate(): void {
    if (this.idCardForm.valid) {
      this.authService
        .getStudent(this.idCardForm.value)
        .subscribe((response) => {
          if (response.success) {
            this.student = response.student[0];

            // Image Display
            const picName = this.student.profilePic;
            if (picName != undefined || picName != null) {
              this.idUrl = 'http://localhost:3000/' + picName;
            } else {
              this.idUrl = '';
            }

            this.successAlert = 'Card Generated Successfully !';
            this.genCardToggle = true;
          } else {
            this.referenceAlert = 'Roll No. not found.';
          }
        });
    } else {
      this.referenceAlert = 'Roll No. is required.';
    }
  }
  createCard() {
    this.successAlert = 'Card Generated Successfully !';
    this.genCardToggle = true;
  }
  // ------------------------ Generate New Batch -------------------------
  createNewBatchForm(): void {
    this.genBatchForm = this.fb.group({
      genBatchClass: ['', Validators.required],
      genBatchMedium: ['', Validators.required],
      genBatchText: ['', Validators.required],
    });
  }
  //New Batch Generation
  onGenBatch() {
    if (this.genBatchForm.valid) {
      this.batchService
        .registerBatch(this.genBatchForm.value)
        .subscribe((response) => {
          if (response.success) {
            this.genBatchsuccessAlert = response.msg;
            window.location.reload();
            //this.ngOnInit();
          } else {
            this.genBatchErrorAlert = response.msg;
          }
        });
    } else {
      this.genBatchErrorAlert = 'All Fields are required to generate batch';
    }
  }

  //Batch Delete
  onDeactivateBatch(batch: any) {
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
        this.batchService.deactivateBatch(batch.id).subscribe((response) => {
          if (response.success) {
            console.log(response.msg);
            this.genBatchsuccessAlert = response.msg;
          } else {
            console.log(response.msg);
            this.genBatchErrorAlert = response.msg;
          }
        });
      }
    }
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

  /*******************Demo Card From Reception*********************/

  createReferenceForm(): void {
    this.demoCardForm = this.fb.group({
      reference_no: ['', Validators.required],
    });
  }

  onReference(): void {
    if (this.demoCardForm.valid) {
      this.createDemoCard();
    } else {
      this.referenceDemoAlert = 'Reference No. is required.';
    }
  }

  createDemoCard() {
    this.receptionService
      .getDemoStudent(this.demoCardForm.value)
      .subscribe((response) => {
        if (response.success) {
          this.demoStudent = response.demoStudent;
          this.flipped_demo = !this.flipped_demo;
          this.successDemoAlert = 'Card Generated Successfully !';
          this.printButton_democard = 'active';
        } else {
          //this.flipped = !this.flipped;
          this.referenceDemoAlert =
            'Reference no. not found. Please try again.';
        }
      });

    // alert('Card Generated Successfull');
  }

  /*************************Fees Card From Accountant**********************/

  //--------------------------- Real Fees Card----------------
  get roll_no_feescard() {
    return this.feesCardForm.get('roll_no_feescard');
  }

  // --------------------Fees Card-----------------------
  // Validation
  createFeesCardForm(): void {
    this.feesCardForm = this.fb.group({
      roll_no_feescard: ['', Validators.required],
    });
  }
  onRollNo(): void {
    if (this.feesCardForm.valid) {
      var rollNo = this.feesCardForm.value.roll_no_feescard;
      this.createFeesCard(rollNo);
    } else {
      this.referenceFeesCardAlert = 'Roll No. is required.';
    }
  }

  createFeesCard(rollNo: any) {
    var bool = true;

    this.accounts.forEach((acc) => {
      if (acc.rollNo == rollNo) {
        this.account = acc;
        // Image Display
        const picName = this.account.student.profilePic;
        if (picName != undefined || picName != null) {
          this.idUrl = 'http://localhost:3000/' + picName;
        } else {
          this.idUrl = '';
        }
        this.nextDueDateFees();
        bool = false;
        this.flipped_feescard = !this.flipped_feescard;
        this.successFeesCardAlert = 'Card Generated Successfully !';
        this.printButton_feescard = 'active';
        return;
      }
    });
    if (bool) {
      this.referenceFeesCardAlert = 'Roll No. not found!';
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
  refreshCurrentComponent() {
    console.log('Refresh Admission Component');
  }

  logModuleRelease(agenda: string) {
    if (this.idCardForm.valid) {
      this.authService
        .getStudent(this.idCardForm.value)
        .subscribe((response) => {
          if (response.success) {
            this.student = response.student[0];
            this.logRegistrationToBatch(this.student, agenda);
          } else {
            this.referenceAlert = 'Roll No. not found.';
          }
        });
    }
  }

  logRegistrationToBatch(student: Student, agenda: string) {
    this.studentLog.timeStamp = new Date();
    this.studentLog.rollNo = this.student.rollNo.toString();
    switch (agenda) {
      case 'batchregister':
        this.studentLog.logText = `The student ${student.fullName} has been registered to ${student.batch.batch} batch. `;
        break;
      case 'modulecard':
        this.studentLog.logText = `The student ${student.fullName} has been provided module card. `;
        break;
      default:
        break;
    }

    this.logger.postTheStudentLogs(this.studentLog).subscribe((response) => {
      if (response.success) {
        console.log('Data Logged successfully');
      } else {
        var logErrorAlert = response.msg;
        console.log(logErrorAlert);
      }
    });
  }
}
