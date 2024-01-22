import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DemoStudent } from 'src/app/Models/DemoStudent';
import { StudentLogs } from 'src/app/Models/StudentLogs';
import { LoggerService } from 'src/app/services/logger.service';
import { ReceptionService } from 'src/app/services/reception.service';

@Component({
  selector: 'app-reception',
  templateUrl: './reception.component.html',
  styleUrls: ['./reception.component.css'],
})
export class ReceptionComponent implements OnInit {
  // Flip Reference Card
  flipped = false;
  printButton: string = 'disabled';
  refId: String = '';
  // Valid Upto Date Format
  days = 3;
  validUpto = new Date(Date.now() + this.days * 24 * 60 * 60 * 1000);
  // Using demoStudent Model for Declaration
  demoStudent: DemoStudent = new DemoStudent();
  user: any;
  studentLog : StudentLogs = new StudentLogs();
  

  /*------------- Tabs JS ---------------*/
  activeTab = 'demo';

  demo(activeTab: string) {
    this.activeTab = activeTab;
  }
  card(activeTab: string) {
    this.activeTab = activeTab;
    this.ngOnInit();
  }
  // Form Declarations
  studentForm: FormGroup = new FormGroup({});
  // Reference Form
  demoCardForm: FormGroup = new FormGroup({});
  // Error Message
  allAlert!: String;
  referenceAlert!: String;
  successAlert!: String;
  successDemoAlert!: String;
  // Getter Method
  // Personal
  get name() {
    return this.studentForm.get('name');
  }
  get fname() {
    return this.studentForm.get('fname');
  }
  get category() {
    return this.studentForm.get('category');
  }
  get contact() {
    return this.studentForm.get('contact');
  }
  // Educational
  get class() {
    return this.studentForm.get('class');
  }
  get medium() {
    return this.studentForm.get('medium');
  }
  get state() {
    return this.studentForm.get('state');
  }
  get district() {
    return this.studentForm.get('district');
  }
  // Address
  get address() {
    return this.studentForm.get('address');
  }
  get reference_from() {
    return this.studentForm.get('reference_from');
  }

  // Couseller
  get cname() {
    return this.studentForm.get('cname');
  }
  get cabin() {
    return this.studentForm.get('cabin');
  }
  // Reference No
  get reference_no() {
    return this.demoCardForm.get('reference_no');
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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private receptionService: ReceptionService,
    private logger: LoggerService
  ) {}

  ngOnInit(): void {
    this.user = localStorage.getItem('user');
    this.user = JSON.parse(this.user);
    if (this.user.role != 'Receptionist' && this.user.role != 'Admin') {
      this.router.navigate(['/dashboard']);
    }
    this.createStudentForm();
    this.createReferenceForm();
  }

  createStudentForm(): void {
    this.studentForm = this.fb.group({
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
  createReferenceForm(): void {
    this.demoCardForm = this.fb.group({
      reference_no: ['', Validators.required],
    });
  }
  onRegister(): void {
    if (this.studentForm.valid) {
      this.registerDemo();
    } else {
      this.allAlert = 'All fields are required to register.';
    }
  }
  onReference(): void {
    if (this.demoCardForm.valid) {
      this.createCard();
    } else {
      this.referenceAlert = 'Reference No. is required.';
    }
  }
  registerDemo() {
    this.receptionService
      .demoStudent(this.studentForm.value)
      .subscribe((response) => {
        if (response.success) {
          // alert('Your Reference id is '+ response.refId);
          this.refId = response.demoStudent.referenceId;
          this.successDemoAlert =
            'Student Registered for Demo with reference id';
            this.logDemoRegistration('demoregister');
        } else {
          location.reload();
          this.allAlert = 'Something went wrong. Please try again.';
          // this.router.navigate(['/dashboard/reception']);
        }
      });
  }
  createCard() {
    this.receptionService
      .getDemoStudent(this.demoCardForm.value)
      .subscribe((response) => {
        if (response.success) {
          this.demoStudent = response.demoStudent;
          this.flipped = !this.flipped;
          this.successAlert = 'Card Generated Successfully !';
          this.logDemoRegistration('democard');
          this.printButton = 'active';
        } else {
          //this.flipped = !this.flipped;
          this.referenceAlert = 'Reference no. not found. Please try again.';
        }
      });

    // alert('Card Generated Successfull');
  }
  refreshCurrentComponent() {
    console.log('Refresh Reception Component');
  }

  logDemoRegistration(agenda : string) : void {
    this.studentLog.timeStamp = new Date();
    this.studentLog.rollNo = this.refId.toString();
    switch (agenda) {
      case 'demoregister' :
        this.studentLog.logText = `The student ${this.name?.value} has been registered to demo batch by ${this.cname?.value}. `;
        break;
      case 'democard' :
        this.studentLog.logText = `The student ${this.demoStudent.fullName} has been provided demo card. `;
        break;
      default :
        break;
    }
    
    this.logger.postTheStudentLogs(this.studentLog).subscribe((response) => {
      if (response.success) {
        console.log("Data Logged successfully");
      } else {
        var logErrorAlert = response.msg;
        console.log(logErrorAlert);
      }
    })
  }
}
