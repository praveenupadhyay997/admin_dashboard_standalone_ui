import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DemoStudent } from 'src/app/Models/DemoStudent';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Student } from 'src/app/Models/Student';
import { AccountService } from 'src/app/services/account.service';
import { Account } from 'src/app/Models/Account';
import * as XLSX from 'xlsx';
import { OrderPipe } from 'ngx-order-pipe';
import { LoggerService } from 'src/app/services/logger.service';
import { AccountantLogs } from 'src/app/Models/AccountantLogs';
import { ChequeDetails } from 'src/app/Models/ChequeDetails';
import { saveAs } from 'file-saver';
import * as FileSaver from 'file-saver';

type AOA = any[][];

@Component({
  selector: 'app-accountant',
  templateUrl: './accountant.component.html',
  styleUrls: ['./accountant.component.css'],
})
export class AccountantComponent implements OnInit {
  // Avataar Image on Card
  idUrl: any = '';
  confirmationFile: any = '';
  //Pagination
  collectionSize: Array<any> = [];
  totalRecords: number = 0;
  page: number = 1;
  pageSize = 4;

  //Table A Pagination
  totalRecords_A: number = 0;
  page_A: number = 1;

  //Table B Pagination
  totalRecords_B: number = 0;
  page_B: number = 1;

  //Filter Search
  filterTerm_A: string = '';
  filterTerm_B: string = '';
  filterTerm: string = '';

  //Sorting
  order: string = 'rollNo'; //check here
  order_A: string = 'rollNo_A';
  order_B: string = 'rollNo_B';
  reverse: boolean = false;
  reverse_A: boolean = false;
  reverse_B: boolean = false;
  sortedCollection: any[];

  // Flip Fees Card
  flipped = false;
  printButton: string = 'disabled';
  rollNo: number = 0;
  globalChequeDeposit: number = 0;
  // Valid Upto Date Format
  days = 3;
  validUpto = new Date(Date.now() + this.days * 24 * 60 * 60 * 1000);
  todayDate: Date = new Date();
  // Using demoStudent Model for Declaration
  demoStudent: DemoStudent = new DemoStudent();
  student: Student = new Student();
  accounts: Account[] = [];
  updatedAccounts: Account[] = [];
  pendingAccounts: Account[] = [];
  postAccountData: Account = new Account();
  account: Account = new Account();
  currentAccountData: Account = new Account();
  displayChequeStatusDetails: boolean = false;
  chequeDetails: ChequeDetails[] = [];
  updateChequeDetail: ChequeDetails = new ChequeDetails();
  postChequeDetail: ChequeDetails = new ChequeDetails();
  accountantLogs: AccountantLogs[] = [];
  accLogs: AccountantLogs = new AccountantLogs();
  paySlipAccount: Account = new Account();
  paySlipAmount: number = 0;
  receiptNo: number = 0;
  smsAccount: Account = new Account();
  feeDueDate: Date = new Date();
  arrayOfInstallments: Array<any> = new Array();
  headers: String[] = [
    'Roll No',
    'Student Name',
    'Batch',
    'Total Installments',
    'Pending Installments',
    'Next Due Date',
  ];
  headers_log: String[] = [
    'Payment Time',
    'Roll No',
    'Student Name',
    'Father Name',
    'Batch',
    'Payment Amount',
    'Mode Of Payment',
  ];

  // Installment Status Modal
  display = 'none';
  chequeStatusDisplay = 'none';
  // Pending Dues Toggle
  dueFeesToggle: boolean = false;
  displayInstallmentToggle: boolean = false;
  displayGenSysToggle: boolean = false;
  //displayChequeStatusToggle: boolean = false;
  /*------------- Tabs JS ---------------*/
  activeTab = 'payslip';
  payslipActive: boolean = false;
  user: any;

  dash(activeTab: string) {
    this.activeTab = activeTab;
    localStorage.setItem('currentTab', JSON.stringify(this.activeTab));
  }
  payslip(activeTab: string) {
    this.activeTab = activeTab;
    localStorage.setItem('currentTab', JSON.stringify(this.activeTab));
  }
  showLog(activeTab: string) {
    this.ngOnInit();
    activeTab = 'accountantLog';
    this.activeTab = activeTab;
    localStorage.setItem('currentTab', JSON.stringify(this.activeTab));
  }
  generatepayslip(activeTab: string) {
    this.activeTab = activeTab;
    localStorage.setItem('currentTab', JSON.stringify(this.activeTab));
  }
  feescard(activeTab: string) {
    this.ngOnInit();
    activeTab = 'feescard';
    this.activeTab = activeTab;
    localStorage.setItem('currentTab', JSON.stringify(this.activeTab));
  }
  feeslogger(activeTab: string) {
    this.activeTab = activeTab;
    localStorage.setItem('currentTab', JSON.stringify(this.activeTab));
    this.getAccountantLogs();
  }
  chequeStatus(activeTab: string) {
    this.activeTab = activeTab;
    localStorage.setItem('currentTab', JSON.stringify(this.activeTab));
  }
  // Pills in Payslip Tab
  activePill = 'update';

  new(activePill: string) {
    this.activePill = activePill;
  }
  feeGenSys(activePill: string) {
    this.activePill = activePill;
  }
  update(activePill: string) {
    this.activePill = activePill;
  }

  // New PayslipForm Declarations
  payslipForm: FormGroup = new FormGroup({});
  // Genearate Fee Payslip Form Declarations
  onGenFeePaySlipForm: FormGroup = new FormGroup({});
  // Cheque Status Form Declarations
  onChequeStatusForm: FormGroup = new FormGroup({});
  // Cheque Status Form Declarations
  onUpdateChequeStatusForm: FormGroup = new FormGroup({});
  // Fetch Payslip Form Declarations
  fetchPayslipForm: FormGroup = new FormGroup({});
  // Update Payslip Form Declarations
  genFeePaySlipSystemForm: FormGroup = new FormGroup({});
  // Update Payslip Form Declarations
  updatePayslipForm: FormGroup = new FormGroup({});
  // ID Card Reference Form
  idCardForm: FormGroup = new FormGroup({});

  // Error Message
  referenceAlert!: String;
  successAlert!: String;
  //Delete Account alerts
  delAccSuccessAlert!: String;
  delAccErrorAlert!: String;
  // Error + Succcess Messages for payslip
  paySlipError!: String;
  chequeStatusRollNoError!: String;
  paySlipSuccess!: String;
  updatePaySlipSuccess!: String;
  updatePaySlipError!: String;
  modalSmsSuccess!: String;
  modalSmsError!: String;

  // ----------------------Payslip Form ---------------------
  get rollno() {
    return this.payslipForm.get('rollno'); //
  }
  get totalAmount() {
    return this.payslipForm.get('totalAmount'); //
  }
  get file() {
    return this.payslipForm.get('file');
  }
  get board() {
    return this.payslipForm.get('board'); //
  }
  get noOfInstallments() {
    return this.payslipForm.get('noOfInstallments'); //
  }
  get remarks() {
    return this.payslipForm.get('remarks'); //
  }
  get installOne() {
    return this.payslipForm.get('installOne'); //
  }
  get installTwo() {
    return this.payslipForm.get('installTwo'); //
  }
  get installThree() {
    return this.payslipForm.get('installThree'); //
  }
  get installFour() {
    return this.payslipForm.get('installFour'); //
  }
  get dateInstallOne() {
    return this.payslipForm.get('dateInstallOne'); //
  }
  get dateInstallTwo() {
    return this.payslipForm.get('dateInstallTwo'); //
  }
  get dateInstallThree() {
    return this.payslipForm.get('dateInstallThree'); //
  }
  get dateInstallFour() {
    return this.payslipForm.get('dateInstallFour'); //
  }
  get statusOne() {
    return this.payslipForm.get('statusOne'); //
  }
  get statusTwo() {
    return this.payslipForm.get('statusTwo'); //
  }
  get statusThree() {
    return this.payslipForm.get('statusThree'); //
  }
  get statusFour() {
    return this.payslipForm.get('statusFour'); //
  }
  // ------------ Generate Payslip Payslip Form ---------------------
  get genPayslipRollNo() {
    return this.onGenFeePaySlipForm.get('genPayslipRollNo'); //
  }
  // ------------ Cheque Status Entry Form ---------------------
  get chequeStatusRollNo() {
    return this.onChequeStatusForm.get('chequeStatusRollNo'); //
  }
  // ------------ On Generate Payslip Payslip System Form ---------------------
  get receivedAmount() {
    return this.genFeePaySlipSystemForm.get('receivedAmount'); //
  }
  get modeOfPayment() {
    return this.genFeePaySlipSystemForm.get('modeOfPayment'); //
  }
  // ------------ On Update Cheque Status Form ---------------------
  get chequeApprovedDate() {
    return this.onUpdateChequeStatusForm.get('chequeApprovedDate'); //
  }
  get changeChequeStatusDropDown() {
    return this.onUpdateChequeStatusForm.get('changeChequeStatusDropDown'); //
  }
  // ------------ Update Payslip Form ---------------------
  get roll__no() {
    return this.fetchPayslipForm.get('roll__no'); //
  }
  // ------------ Update Payslip Form ---------------------
  get roll_No() {
    return this.updatePayslipForm.get('roll_No'); //
  }
  get total_Amount() {
    return this.updatePayslipForm.get('total_Amount'); //
  }
  get edu_board() {
    return this.updatePayslipForm.get('edu_board'); //
  }
  get totalInstallments() {
    return this.updatePayslipForm.get('totalInstallments'); //
  }
  get updateFile() {
    return this.updatePayslipForm.get('updateFile');
  }
  get remark() {
    return this.updatePayslipForm.get('remark'); //
  }
  get install_One() {
    return this.updatePayslipForm.get('install_One'); //
  }
  get install_Two() {
    return this.updatePayslipForm.get('install_Two'); //
  }
  get install_Three() {
    return this.updatePayslipForm.get('install_Three'); //
  }
  get install_Four() {
    return this.updatePayslipForm.get('install_Four'); //
  }
  get dateInstall_One() {
    return this.updatePayslipForm.get('dateInstall_One'); //
  }
  get dateInstall_Two() {
    return this.updatePayslipForm.get('dateInstall_Two'); //
  }
  get dateInstall_Three() {
    return this.updatePayslipForm.get('dateInstall_Three'); //
  }
  get dateInstall_Four() {
    return this.updatePayslipForm.get('dateInstall_Four'); //
  }
  get status_One() {
    return this.updatePayslipForm.get('status_One'); //
  }
  get status_Two() {
    return this.updatePayslipForm.get('status_Two'); //
  }
  get status_Three() {
    return this.updatePayslipForm.get('status_Three'); //
  }
  get status_Four() {
    return this.updatePayslipForm.get('status_Four'); //
  }
  //--------------------------- Real Fees Card----------------
  get roll_no() {
    return this.idCardForm.get('roll_no');
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private accountService: AccountService,
    private orderPipe: OrderPipe,
    private logger: LoggerService
  ) {
    this.sortedCollection = orderPipe.transform(this.accounts, 'rollNo_A'); //sorting
    this.sortedCollection = orderPipe.transform(this.accounts, 'rollNo_B'); //sorting
    this.sortedCollection = orderPipe.transform(this.pendingAccounts, 'rollNo'); //sorting
  }

  ngOnInit(): void {
    this.user = localStorage.getItem('user');

    this.activeTab = JSON.parse(localStorage.getItem('currentTab') || '');

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
            //For Pending Excel
            var duerow: any[] = [];
            duerow.push(account.rollNo);
            duerow.push(account.student.fullName);
            duerow.push(account.student.batch.batch);
            duerow.push(account.noOfInstallment);
            duerow.push(this.pendingInstallments(account));
            duerow.push(this.nextDueDate(account));
            // duerow.push(account.nextDueDate); //Check
            this.duedata.push(duerow);
          }
          //For Excel
          var row: any[] = [];
          row.push(account.rollNo);
          row.push(account.student.fullName);
          row.push(account.student.batch.batch);
          row.push(account.noOfInstallment);
          row.push(this.pendingInstallments(account));
          row.push(this.nextDueDate(account));
          // row.push(account.nextDueDate); //Check
          this.data.push(row);

          //Confirmation File Image
          const conFile = this.account.confirmationFile;
          if (conFile != undefined || conFile != null) {
            this.confirmationFile =
              'http://localhost:3000/44ee3569767ef5464ac7154a434de52b';
          } else {
            this.confirmationFile = '';
          }
        });
      }
    });
    this.createpaySlipForm(); //New payslip Form
    this.createFetchpayslipForm(); //New payslip Form
    this.createFeePaySlipForm(); //New payslip Form
    this.createChequeStatusForm(); //Cheque Status Form
    this.createUpdateChequeStatusForm(); //Cheque Status Form
    this.updatepaySlipForm(); //Update payslip Form
    this.createIdCardForm(); //FeesCard Form
    this.createPayslipFormSystem();
  }

  // Converting All accounts Table to Excel File
  data: AOA = [this.headers];
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
  fileName: string =
    new Date().toLocaleString().toString() + '_AllAccounts.xlsx';

  // Converting All Pending accounts Table to Excel File
  duedata: AOA = [this.headers];
  duewopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
  duefileName: string =
    new Date().toLocaleString().toString() + '_PendingAccounts.xlsx';

  // Converting All Log accounts Table to Excel File
  logdata: AOA = [this.headers_log];
  logwopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
  logfileName: string =
    new Date().toLocaleString().toString() + '_LogAccounts.xlsx';

  passwd_allAccounts() {
    var password = prompt('Enter the password to download the file:');
    if (password == 'teacher') {
      this.export();
    } else {
      alert('Incorrect password! Please try again.');
    }
  }
  passwd_pendingAccounts() {
    var password = prompt('Enter the password to download the file:');
    if (password == 'teacher') {
      this.exportPending();
    } else {
      alert('Incorrect password! Please try again.');
    }
  }
  passwd_allLogAccounts() {
    var password = prompt('Enter the password to download the file:');
    if (password == 'teacher') {
      this.exportfeeslogger();
    } else {
      alert('Incorrect password! Please try again.');
    }
  }

  export(): void {
    /* generate worksheet */
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.data);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, this.fileName);
  }
  exportPending(): void {
    /* generate worksheet */
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.duedata);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, this.duefileName);
  }

  exportfeeslogger() {
    /* generate worksheet */
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.logdata);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, this.logfileName);
  }

  //sorting
  setOrder_A(value: string) {
    if (this.order_A === value) {
      this.reverse_A = !this.reverse_A;
    }
    this.order_A = value;
  }

  setOrder_B(value: string) {
    if (this.order_B === value) {
      this.reverse_B = !this.reverse_B;
    }
    this.order_B = value;
  }

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  // -------------------------Payslip Form-----------------
  // Validaition
  createpaySlipForm(): void {
    this.payslipForm = this.fb.group({
      rollno: ['', Validators.required],
      totalAmount: ['', Validators.required],
      file: ['', Validators.required],
      board: ['', Validators.required],
      noOfInstallments: ['', Validators.required],
      remarks: ['', Validators.required],
      installOne: ['', Validators.required],
      installTwo: [''],
      installThree: [''],
      installFour: [''],
      dateInstallOne: ['', Validators.required],
      dateInstallTwo: [''],
      dateInstallThree: [''],
      dateInstallFour: [''],
      statusOne: [''],
      statusTwo: [''],
      statusThree: [''],
      statusFour: [''],
    });
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.payslipForm.get('file')?.setValue(file);
    }
  }

  onSubmitPaylip(): void {
    let one = this.installOne != null ? this.installOne.value : 0;
    let two = this.installTwo != null ? this.installTwo.value : 0;
    let three = this.installThree != null ? this.installThree.value : 0;
    let four = this.installFour != null ? this.installFour.value : 0;
    if (this.payslipForm.valid) {
      if (one + two + three + four == this.totalAmount?.value)
        this.createPaySlip();
      else {
        this.paySlipError =
          'All Installments do not add up to total amount. Please Check.';
      }
    } else {
      this.paySlipError = 'All fields are required';
    }
  }
  createPaySlip() {
    const formData = new FormData();
    formData.append('rollno', this.payslipForm.get('rollno')?.value);
    formData.append('totalAmount', this.payslipForm.get('totalAmount')?.value);
    formData.append('board', this.payslipForm.get('board')?.value);
    formData.append(
      'noOfInstallments',
      this.payslipForm.get('noOfInstallments')?.value
    );
    formData.append('file', this.payslipForm.value.file);
    formData.append('remarks', this.payslipForm.get('remarks')?.value);
    formData.append('installOne', this.payslipForm.get('installOne')?.value);
    formData.append('installTwo', this.payslipForm.get('installTwo')?.value);
    formData.append(
      'installThree',
      this.payslipForm.get('installThree')?.value
    );
    formData.append('installFour', this.payslipForm.get('installFour')?.value);
    formData.append(
      'dateInstallOne',
      this.payslipForm.get('dateInstallOne')?.value
    );
    formData.append(
      'dateInstallTwo',
      this.payslipForm.get('dateInstallTwo')?.value
    );
    formData.append(
      'dateInstallThree',
      this.payslipForm.get('dateInstallThree')?.value
    );
    formData.append(
      'dateInstallFour',
      this.payslipForm.get('dateInstallFour')?.value
    );
    console.log(formData);
    this.accountService.createAccount(formData).subscribe((response) => {
      if (response.success) {
        console.log("Account created successfully");
        window.location.reload();
        // this.paySlipAccount = response.account;
        // this.receiptNo = response.count;
        // this.paySlipAmount = this.paySlipAccount.installOne;
        // this.payslipActive = true;
        // this.activeTab = 'generatepayslip';
        // this.paySlipSuccess = response.msg;
      } else {
        console.log(response.msg);
        // this.paySlipError = response.msg;
      }
    });
  }
  // Generate Payslip Form System
  createPayslipFormSystem(): void {
    this.genFeePaySlipSystemForm = this.fb.group({
      receivedAmount: ['', Validators.required],
      modeOfPayment: ['', Validators.required],
    });
  }
  onGenFeePaySlipSystem(): void {
    if (this.genFeePaySlipSystemForm.valid) {
      console.log('Valid Form Details');
      const modeOfPayment =
        this.genFeePaySlipSystemForm.get('modeOfPayment')?.value;

      if (modeOfPayment === 'cheque') {
        const paymentAmount =
          this.genFeePaySlipSystemForm.get('receivedAmount')?.value;
        this.postChequeDetail.rollNo = this.currentAccountData.rollNo;
        this.postChequeDetail.submissionDate = new Date();
        this.postChequeDetail.paymentAmount = paymentAmount;
        this.postChequeDetail.status = 'due';

        this.accountService
          .saveNewChequeDetail(this.postChequeDetail)
          .subscribe((response) => {
            if (response.success) {
              console.log(response.success);
              this.updatePaySlip('generateChequePaySlip');
            } else {
              var postErrorAlert = response.msg;
              console.log(postErrorAlert);
            }
          });
      }
      else {
        this.updatePaySlip('generatePaySlip');
      }
    }
    else {
      console.log('Go to hell');
    }
  }
  // ------------------------- Fetch Payslip Form-----------------
  // Validaition
  createFetchpayslipForm(): void {
    this.fetchPayslipForm = this.fb.group({
      roll__no: ['', Validators.required],
    });
  }
  createFeePaySlipForm(): void {
    this.onGenFeePaySlipForm = this.fb.group({
      genPayslipRollNo: ['', Validators.required],
    });
  }
  createChequeStatusForm(): void {
    this.onChequeStatusForm = this.fb.group({
      chequeStatusRollNo: ['', Validators.required],
    });
  }
  onFetchPaySlip(): void {
    if (this.fetchPayslipForm.valid) {
      this.accounts.forEach((account) => {
        if (this.fetchPayslipForm.value.roll__no == account.rollNo) {
          this.autoFillForm(account);
        }
      });
    } else {
      this.paySlipError = 'All fields are required';
    }
  }
  // Generate Fee Payslip Form
  onGenFeePaySlip(): void {
    if (this.onGenFeePaySlipForm.valid) {
      console.log('Gen Payslip');
      const rollNo = this.onGenFeePaySlipForm.value.genPayslipRollNo;
      this.ngOnInit();
      this.accounts.forEach((account) => {
        if (rollNo == account.rollNo) {
          this.autoFillFeePayslipForm(account);
        }
      });
    } else {
      this.paySlipError = 'All fields are required';
    }
  }

  // Cheque Status Form
  onChequeStatus(): void {
    if (this.onChequeStatusForm.valid) {
      console.log('Cheque Status');
      this.findTheChequeDetails();
      this.accounts.forEach((account) => {
        // if (this.onGenFeePaySlipForm.value.genPayslipRollNo == account.rollNo) {
        //   this.autoFillFeePayslipForm(account);
        // }
      });
    } else {
      this.chequeStatusRollNoError =
        'Please Enter Roll No to Fetch Cheque Details!';
    }
  }

  createUpdateChequeStatusForm() {
    this.onUpdateChequeStatusForm = this.fb.group({
      chequeApprovedDate: ['', Validators.required],
      changeChequeStatusDropDown: ['', Validators.required],
    });
  }

  // Updating Cheque Status Form
  onUpdateChequeStatus(): void {
    if (this.onUpdateChequeStatusForm.valid) {
      console.log('Updated Cheque Status');
      console.log(this.chequeDetails);
      var filterResult = this.chequeDetails.filter((_) => _.status === 'due');
      var approvedDate =
        this.onUpdateChequeStatusForm.get('chequeApprovedDate')?.value;
      var status = this.onUpdateChequeStatusForm.get(
        'changeChequeStatusDropDown'
      )?.value;
      console.log(filterResult);
      this.updateChequeDetail.rollNo = filterResult[0].rollNo;
      this.updateChequeDetail.paymentAmount = filterResult[0].paymentAmount;
      this.updateChequeDetail.submissionDate = filterResult[0].submissionDate;
      this.updateChequeDetail.approvedDate = approvedDate;
      this.updateChequeDetail.status = status;
      this.accountService
        .updateOldChequeDetail(this.updateChequeDetail)
        .subscribe((response) => {
          if (response.success) {
            console.log('Data Logged successfully');
            this.accountService.fetchAccounts().subscribe((response) => {
              if (response.success) {
                this.updatedAccounts = response.accounts;
                this.currentAccountData = this.updatedAccounts.filter(account => account.rollNo === this.updateChequeDetail.rollNo)[0];
                this.globalChequeDeposit = this.currentAccountData.totalFeeAmountReceived + this.updateChequeDetail.paymentAmount;
                this.updatePaySlip('updateChequeDeposit');
              }
            });
            // window.location.reload();
          } else {
            var errorAlert = response.msg;
            console.log(errorAlert);
          }
        });
    } else {
      this.paySlipError = 'All fields are required';
    }
  }

  // Validaition
  autoFillFeePayslipForm(account: Account) {
    this.arrayOfInstallments = this.installmentDetail(account);
    this.displayGenSysToggle = true;
    this.currentAccountData = account;
    // this.updatePayslipForm.patchValue({
    //   roll_No: account.rollNo,
    //   total_Amount: account.totalFeeAmount,
    //   edu_board: account.board,
    //   totalInstallments: account.noOfInstallment,
    //   remark: account.remarks,
    //   install_One: account.installOne,
    //   install_Two: account.installTwo,
    //   install_Three: account.installThree,
    //   install_Four: account.installFour,
    //   dateInstall_One: account.installDateOne,
    //   dateInstall_Two: account.installDateTwo,
    //   dateInstall_Three: account.installDateThree,
    //   dateInstall_Four: account.installDateFour,
    //   status_One: account.statusOne != true ? 'due' : 'paid',
    //   status_Two: account.statusTwo != true ? 'due' : 'paid',
    //   status_Three: account.statusThree != true ? 'due' : 'paid',
    //   status_Four: account.statusFour != true ? 'due' : 'paid',
    // });
  }

  calculateStuff() {
    return (
      this.currentAccountData.totalFeeAmount -
      this.currentAccountData.totalFeeAmountReceived
    );
  }
  // -------------------------Payslip Form-----------------
  // Validaition
  autoFillForm(account: Account) {
    this.arrayOfInstallments = this.installmentDetail(account);
    this.displayInstallmentToggle = true;
    this.updatePayslipForm.patchValue({
      roll_No: account.rollNo,
      total_Amount: account.totalFeeAmount,
      edu_board: account.board,
      totalInstallments: account.noOfInstallment,
      remark: account.remarks,
      install_One: account.installOne,
      install_Two: account.installTwo,
      install_Three: account.installThree,
      install_Four: account.installFour,
      dateInstall_One: account.installDateOne,
      dateInstall_Two: account.installDateTwo,
      dateInstall_Three: account.installDateThree,
      dateInstall_Four: account.installDateFour,
      status_One: account.statusOne != true ? 'due' : 'paid',
      status_Two: account.statusTwo != true ? 'due' : 'paid',
      status_Three: account.statusThree != true ? 'due' : 'paid',
      status_Four: account.statusFour != true ? 'due' : 'paid',
    });
  }

  updatepaySlipForm(): void {
    this.updatePayslipForm = this.fb.group({
      roll_No: ['', Validators.required],
      total_Amount: ['', Validators.required],
      edu_board: ['', Validators.required],
      totalInstallments: ['', Validators.required],
      updateFile: [''],
      remark: ['', Validators.required],
      install_One: [''],
      install_Two: [''],
      install_Three: [''],
      install_Four: [''],
      dateInstall_One: [''],
      dateInstall_Two: [''],
      dateInstall_Three: [''],
      dateInstall_Four: [''],
      status_One: [''],
      status_Two: [''],
      status_Three: [''],
      status_Four: [''],
    });
  }

  onUpdatedFileChange(event: any) {
    if (event.target.files.length > 0) {
      const updated_file = event.target.files[0];
      this.updatePayslipForm.get('updateFile')?.setValue(updated_file);
    }
  }

  onUpdatePaylip(): void {
    let firstInstAmount = this.updatePayslipForm.get('install_One')?.value;
    let secondInstAmount = this.updatePayslipForm.get('install_Two')?.value;
    let thirdInstAmount = this.updatePayslipForm.get('install_Three')?.value;
    let fourthInstAmount = this.updatePayslipForm.get('install_Four')?.value;
    let one = (firstInstAmount === "" || undefined || null) ? 0 : firstInstAmount;
    console.log('One', one);
    let two = (secondInstAmount === "" || undefined || null) ? 0 : secondInstAmount;
    console.log('Two', two);
    let three = (thirdInstAmount === "" || undefined || null) ? 0 : thirdInstAmount;
    console.log('Three', three);
    let four = (fourthInstAmount === "" || undefined || null) ? 0 : fourthInstAmount;
    console.log('Four', four);
    if (this.updatePayslipForm.valid) {
      if ((parseInt(one) + parseInt(two) + parseInt(three) + parseInt(four)) == this.total_Amount?.value)
        this.updatePaySlip('updateinstallment');
      else {
        this.updatePaySlipError =
          'All Installments do not add up to total amount. Please Check.';
      }
    } else {
      this.updatePaySlipError = 'All fields are required';
    }
  }
  updatePaySlip(purpose : string) {
    const formData = new FormData();
    if(purpose == 'updateinstallment') {
      formData.append('_id', this.currentAccountData._id);
      formData.append('roll_No', this.updatePayslipForm.get('roll_No')?.value);
      formData.append(
        'total_Amount',
        this.updatePayslipForm.get('total_Amount')?.value
      );
      formData.append(
        'totalDeposit',
        this.currentAccountData.totalFeeAmountReceived.toString()
      );
      formData.append(
        'edu_board',
        this.updatePayslipForm.get('edu_board')?.value
      );
      formData.append(
        'totalInstallments',
        this.updatePayslipForm.get('totalInstallments')?.value
      );
      formData.append('updateFile', this.updatePayslipForm.value.updateFile);
      formData.append('remark', this.updatePayslipForm.get('remark')?.value);
      formData.append(
        'install_One',
        this.updatePayslipForm.get('install_One')?.value
      );
      formData.append(
        'install_Two',
        this.updatePayslipForm.get('install_Two')?.value
      );
      formData.append(
        'install_Three',
        this.updatePayslipForm.get('install_Three')?.value
      );
      formData.append(
        'install_Four',
        this.updatePayslipForm.get('install_Four')?.value
      );
      formData.append(
        'dateInstall_One',
        this.updatePayslipForm.get('dateInstall_One')?.value
      );
      formData.append(
        'dateInstall_Two',
        this.updatePayslipForm.get('dateInstall_Two')?.value
      );
      formData.append(
        'dateInstall_Three',
        this.updatePayslipForm.get('dateInstall_Three')?.value
      );
      formData.append(
        'dateInstall_Four',
        this.updatePayslipForm.get('dateInstall_Four')?.value
      );
      formData.append(
        'status_One',
        this.updatePayslipForm.get('status_One')?.value
      );
      formData.append(
        'status_Two',
        this.updatePayslipForm.get('status_Two')?.value
      );
      formData.append(
        'status_Three',
        this.updatePayslipForm.get('status_Three')?.value
      );
      formData.append(
        'status_Four',
        this.updatePayslipForm.get('status_Four')?.value
      );

      this.accountService.updateAccount(formData).subscribe((response) => {
        if (response.success) {
          console.log(response.account);
          this.receiptNo = response.count;
        } else {
          this.updatePaySlipError = response.msg;
        }
      });
    }
    else {
      var deposit =0;
      if(purpose === 'generateChequePaySlip')
        deposit = this.currentAccountData.totalFeeAmountReceived;
      else if(purpose === 'updateChequeDeposit')
        deposit = this.globalChequeDeposit; 
      else
        deposit = this.currentAccountData.totalFeeAmountReceived + parseInt(this.genFeePaySlipSystemForm.get('receivedAmount')?.value);

      var postAccountData = {
        _id : this.currentAccountData._id,
        roll_No : this.currentAccountData.student.rollNo,
        total_Amount : this.currentAccountData.totalFeeAmount,
        edu_board : this.currentAccountData.board,
        totalInstallments : this.currentAccountData.noOfInstallment,
        updateFile : this.currentAccountData.originalName,
        totalDeposit : deposit,
        remark : this.currentAccountData.remarks,
        install_One : this.currentAccountData.installOne,
        install_Two : this.currentAccountData.installTwo,
        install_Three : this.currentAccountData.installThree,
        install_Four : this.currentAccountData.installFour,
        dateInstall_One : this.currentAccountData.installDateOne,
        dateInstall_Two : this.currentAccountData.installDateTwo,
        dateInstall_Three : this.currentAccountData.installDateThree,
        dateInstall_Four : this.currentAccountData.installDateFour,
        status_One : this.currentAccountData.statusOne,
        status_Two : this.currentAccountData.statusTwo,
        status_Three : this.currentAccountData.statusThree,
        status_Four : this.currentAccountData.statusFour
      };

      this.accountService.updateAccount(postAccountData).subscribe((response) => {
        if (response.success) {
          this.paySlipAccount = response.account;
          this.receiptNo = response.count;
          this.accounts.forEach((account) => {
            if (account.rollNo == this.paySlipAccount.rollNo) {
              this.paySlipAmount = parseInt(this.genFeePaySlipSystemForm.get('receivedAmount')?.value);
            }
          });
          this.payslipActive = true;
          this.activeTab = 'generatepayslip';
          this.updatePaySlipSuccess = response.msg;
        } else {
          this.updatePaySlipError = response.msg;
        }
      });

    }
  }
  // --------------------Fees Card-----------------------
  // Validation
  createIdCardForm(): void {
    this.idCardForm = this.fb.group({
      roll_no: ['', Validators.required],
    });
  }
  onRollNo(): void {
    if (this.idCardForm.valid) {
      var rollNo = this.idCardForm.value.roll_no;
      this.createCard(rollNo);
    } else {
      this.referenceAlert = 'Roll No. is required.';
    }
  }

  createCard(rollNo: any) {
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
        this.flipped = !this.flipped;
        this.successAlert = 'Card Generated Successfully !';
        this.printButton = 'active';
        return;
      }
    });
    if (bool) {
      this.referenceAlert = 'Roll No. not found';
    }
  }
  // -----------Fees Card Section Ends here------------------
  dueFeesStudent() {
    this.dueFeesToggle = !this.dueFeesToggle;
  }
  // Modal
  openModal(account: Account) {
    this.account = account;
    this.arrayOfInstallments = this.installmentDetail(account);
    this.display = 'block';
  }
  onCloseHandled() {
    this.arrayOfInstallments = [];
    this.display = 'none';
  }
  openChequeStatusModal() {
    console.log('modal cheque');
    this.chequeStatusDisplay = 'block';
  }
  onCloseChequeStatus() {
    this.chequeStatusDisplay = 'none';
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

  installmentDetail(account: Account): any {
    var installArray = [];
    this.smsAccount = account;
    if (account.installOne != null && account.statusOne) {
      installArray.push({ date: account.installDateOne, amount: account.installOne, status: 'Paid' });
    } else if (account.installOne != null) {
      installArray.push({ date: account.installDateOne, amount: account.installOne, status: 'Due' });
    }
    if (account.installTwo != null && account.statusTwo) {
      installArray.push({ date: account.installDateTwo, amount: account.installTwo, status: 'Paid' });
    } else if (account.installTwo != null) {
      installArray.push({ date: account.installDateTwo,  amount: account.installTwo, status: 'Due' });
    }
    if (account.installThree != null && account.statusThree) {
      installArray.push({ date: account.installDateThree, amount: account.installThree, status: 'Paid' });
    } else if (account.installThree != null) {
      installArray.push({ date: account.installDateThree, amount: account.installThree, status: 'Due' });
    }
    if (account.installFour != null && account.statusFour) {
      installArray.push({ date: account.installDateFour, amount: account.installFour, status: 'Paid' });
    } else if (account.installFour != null) {
      installArray.push({ date: account.installDateFour, amount: account.installFour, status: 'Due' });
    }

    return installArray;
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

  //Send SMS on click
  sendSms(num: any, account?: Account) {
    var amount = 0;
    var instNo;
    var accountInfo;
    if (num != -1) {
      if (num == 0) {
        amount = this.smsAccount.installOne;
        instNo = 1;
      }
      if (num == 1) {
        amount = this.smsAccount.installTwo;
        instNo = 2;
      }
      if (num == 2) {
        amount = this.smsAccount.installThree;
        instNo = 3;
      }
      if (num == 3) {
        amount = this.smsAccount.installFour;
        instNo = 4;
      }
      accountInfo = {
        name: this.smsAccount.student.fullName,
        contact: this.smsAccount.student.studentContact,
        dueDate: `${new Date(this.arrayOfInstallments[num].date).getDate()}-${
          new Date(this.arrayOfInstallments[num].date).getMonth().valueOf() + 1
        }-${new Date(this.arrayOfInstallments[num].date).getFullYear()}`,
        status: this.arrayOfInstallments[num].status,
        instNo: instNo,
        amount: amount,
      };
      this.accountService.sendSms(accountInfo).subscribe((response) => {
        if (response.success) {
          this.modalSmsSuccess = response.msg;
        } else {
          this.modalSmsError = response.msg;
        }
      });
    } else if (account) {
      var pi = this.pendingInstallments(account);
      var ti = account.noOfInstallment;
      var cpi = ti - pi;
      if (cpi == 0) {
        amount = account.installOne;
        instNo = 1;
      }
      if (cpi == 1) {
        amount = account.installTwo;
        instNo = 2;
      }
      if (cpi == 2) {
        amount = account.installThree;
        instNo = 3;
      }
      if (cpi == 3) {
        amount = account.installFour;
        instNo = 4;
      }
      accountInfo = {
        name: account.student.fullName,
        contact: account.student.studentContact,
        dueDate: `${new Date(this.nextDueDate(account)).getDate()}-${
          new Date(this.nextDueDate(account)).getMonth().valueOf() + 1
        }-${new Date(this.nextDueDate(account)).getFullYear()}`,
        status: 'Due',
        instNo: instNo,
        amount: amount,
      };

      this.accountService.sendSms(accountInfo).subscribe((response) => {
        if (response.success) {
          this.delAccSuccessAlert = response.msg;
        } else {
          this.delAccErrorAlert = response.msg;
        }
      });
    }
  }

  // -------------------------Get Logs-----------------
  getAccountantLogs() {
    this.logger.fetchAccountantLogs().subscribe((response) => {
      if (response.success) {
        this.accountantLogs = response.logs;
        this.accountantLogs.forEach((log) => {
          var flag = 0;
          this.accountantLogs.forEach((element) => {
            if (element.rollNo == log.rollNo) {
              flag = 1;
            }
          });
          if (flag == 0) {
            this.accountantLogs.push(log);
          }
          //For Excel
          var logRow: any[] = [];
          logRow.push(log.paymentDate);
          logRow.push(log.rollNo);
          logRow.push(log.studentFullName);
          logRow.push(log.studentFatherName);
          logRow.push(log.batch);
          logRow.push(log.paymentAmount);
          logRow.push(log.modeOfPayment);
          this.logdata.push(logRow);
        });
      } else {
        console.log(response.message);
      }
    });
  }

  logBeforePrint() {
    this.accLogs.paymentDate = new Date();
    this.accLogs.rollNo = this.paySlipAccount.rollNo;
    this.accLogs.studentFullName = this.paySlipAccount.student.fullName;
    this.accLogs.studentFatherName = this.paySlipAccount.student.fatherName;
    this.accLogs.batch = this.paySlipAccount.student.batch.batch.toString();
    this.accLogs.paymentAmount = this.paySlipAmount;
    if (this.paySlipAccount.modeOfPayment.toLowerCase() === 'cash') {
      this.accLogs.modeOfPayment = 'Cash';
    } else {
      this.accLogs.modeOfPayment = 'UPI';
    }

    this.logger.postTheLogs(this.accLogs).subscribe((response) => {
      if (response.success) {
        this.feeslogger('feeslogger');
      } else {
        var logErrorAlert = response.msg;
        console.log(logErrorAlert);
      }
    });
  }

  downloadConfirmation(account: Account) {
    const fileName = account.confirmationFile;
    const fileUrl = 'http://localhost:3000/' + fileName;
    FileSaver.saveAs(fileUrl, 'image.jpg');
  }

  findTheChequeDetails() {
    var rollNo = this.onChequeStatusForm.get('chequeStatusRollNo')?.value;
    this.accountService
      .getChequeDetailByRollNo(rollNo)
      .subscribe((response) => {
        if (response.success) {
          console.log(response.msg);
          console.log(response.chequeDetails);
          this.chequeDetails = response.chequeDetails;
          this.displayChequeStatusDetails = true;
        } else {
          this.delAccErrorAlert = response.msg;
        }
      });
  }
}
