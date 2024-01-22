import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderPipe } from 'ngx-order-pipe';
import { Batch } from 'src/app/Models/Batch';
import { Student } from 'src/app/Models/Student';
import { Upload } from 'src/app/Models/Upload';
import { BatchService } from 'src/app/services/batch.service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { LoggerService } from 'src/app/services/logger.service';
import { StudentService } from 'src/app/services/student.service';
import * as XLSX from 'xlsx';
import { StudentLogs } from './../../../Models/StudentLogs';

type AOA = any[][];

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css'],
})
export class StudentComponent implements OnInit {
  // Image Upload
  url: any = '';
  // Update Student Form
  updateStudentForm: FormGroup = new FormGroup({});
  // Update Alerts
  updateAlert!: String;
  updateSuccessAlert!: String;

  //Pagination
  collectionSize: Array<any> = [];
  totalRecords: number = 0;
  page: number = 1;
  pageSize = 4;

  //Table A Pagination
  totalRecords_A: number = 0;
  page_A: number = 1;

  //Filter Search
  filterTerm: string = '';

  //Sorting
  order: string = 'nameOfExam'; //check here
  reverse: boolean = false;
  sortedCollection: any[];
  oldBatch : string = '';
  newBatch : string = '';

  display = 'none';
  user: any;
  rollNo: any;
  public uploads: Upload[] = [];
  public isPresent: String[] = [];
  public marks: any[] = [];
  studentxi: number = 0;
  studentxii: number = 0;
  studenttarget: number = 0;
  batchxi: any[] = [];
  batchxii: any[] = [];
  batchtarget: any[] = [];
  studentLog : StudentLogs = new StudentLogs();

  headers: String[] = [
    'Name Of Exam',
    'Date Of Exam',
    'Marks Obtained',
    'Test Attendance',
  ];

  constructor(
    private router: Router,
    private studentService: StudentService,
    private dashboardService: DashboardService,
    private fb: FormBuilder,
    private batchService: BatchService,
    private orderPipe: OrderPipe,
    private logger: LoggerService
  ) {
    this.rollNo = this.router.getCurrentNavigation()?.extras?.state?.rollNo;
    this.sortedCollection = orderPipe.transform(this.uploads, 'nameOfExam'); //sorting
  }
  public student: Student = new Student();
  ngOnInit(): void {
    this.createUpdateStudentForm();
    this.user = localStorage.getItem('user');
    this.user = JSON.parse(this.user);
    if (this.user.role != 'Student' && this.user.role != 'Admin') {
      this.router.navigate(['/dashboard']);
    }
    if (this.user.role == 'Student') {
      this.studentService.getStudent(this.user.rollno).subscribe((response) => {
        if (response.success) {
          this.student = response.student[0];
          //console.log(this.student.batch.batch);
          //Getting Exams for batch of Student
          this.studentService
            .getExams(this.student.batch._id)
            .subscribe((response) => {
              if (response.success) {
                this.uploads = response.uploads;
                //Fetching Result of Student based on exam and batch
                this.uploads.forEach((upload) => {
                  this.studentService
                    .getExamResult(upload._id, this.user.rollno)
                    .subscribe((response) => {
                      if (response.success) {
                        this.isPresent.push(response.isPresent);
                        this.marks.push(response.result.score);
                      } else {
                        this.isPresent.push(response.isPresent);
                        this.marks.push(response.result);
                      }
                    });
                });
              }
            });
        } else {
          alert(response.msg);
        }
      });
    }
    if (this.user.role != 'Student') {
      //For Polar Chart Data
      this.fetchAllStudents();

      if (this.rollNo) {
        this.studentService.getStudent(this.rollNo).subscribe((response) => {
          if (response.success) {
            this.student = response.student[0];
            // Image Display
            const picName = this.student.profilePic;
            if (picName != undefined || picName != null) {
              this.url = 'http://localhost:3000/' + picName;
            } else {
              this.url = '';
            }
            //Getting Exams for batch of Student
            this.studentService
              .getExams(this.student.batch._id)
              .subscribe((response) => {
                if (response.success) {
                  this.uploads = response.uploads;
                  //Fetching Result of Student based on exam and batch
                  this.uploads.forEach((upload) => {
                    this.studentService
                      .getExamResult(upload._id, this.rollNo)
                      .subscribe((response) => {
                        var row: any[] = [];
                        row.push(upload.examName);
                        row.push(upload.examDate);
                        if (response.success) {
                          this.isPresent.push(response.isPresent);
                          this.marks.push(response.result.score);
                          row.push(response.result.score);
                          row.push(response.isPresent);
                          this.data.push(row);
                        } else {
                          this.isPresent.push(response.isPresent);
                          this.marks.push(response.result);
                          row.push(response.result);
                          row.push(response.isPresent);
                          this.data.push(row);
                        }
                      });
                  });
                }
              });
          } else {
            //alert(response.msg);
          }
        });
      }
    }
  }

  // Converting Table to Excel File
  data: AOA = [this.headers];
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
  fileName: string = new Date().toLocaleString().toString() + '_TestLogs.xlsx';

  export(): void {
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
  //Getting no. of students in each class
  fetchAllStudents() {
    this.dashboardService.fetchAllStudents().subscribe((response) => {
      if (response.success) {
        var students = response.students;
        students.forEach((student: any) => {
          if (student.class === '11') this.studentxi++;
          if (student.class === '12') this.studentxii++;
          if (student.class === 'Target') this.studenttarget++;
        });
        this.polarAreaChartData = [
          this.studentxi,
          this.studentxii,
          this.studenttarget,
        ];
      } else {
        //this.allAlert = response.msg;
      }
    });
  }
  //Get batch by class
  getbatch(cls: any): any {
    this.studentService.getDistinctBatch(cls).subscribe((response) => {
      if (response.success) {
        if (cls == '11') {
          this.batchxi = response.batch;
          this.elevenBarChartLabels = response.batch;
          this.forEleven('Physics');
        }
        if (cls == '12') {
          this.batchxii = response.batch;
          this.twelveBarChartLabels = response.batch;
          this.forTwelve('Physics');
        }
        if (cls == 'Target') {
          this.batchtarget = response.batch;
          this.targetBarChartLabels = response.batch;
          this.forTarget('Physics');
        }
      } else {
      }
    });
  }
  //11th Chart
  forEleven(sub: any): any {
    var data: any[] = [];
    this.batchxi.forEach((batch) => {
      this.studentService.getAverageMarks(batch).subscribe((response) => {
        if (response.success) {
          if (sub == 'Physics') {
            data.push(response.avg.avgPhy);
          } else if (sub == 'Chemistry') {
            data.push(response.avg.avgChem);
          } else if (sub == 'Botany') {
            data.push(response.avg.avgBot);
          } else if (sub == 'Zoology') {
            data.push(response.avg.avgZoo);
          }
          var chartData = [
            {
              data: data,
              label: sub,
            },
          ];

          this.elevenBarChartData = chartData;
          return chartData;
        } else return [{ data: [0], label: 'Error' }];
      });
    });
  }
  //12th Chart
  forTwelve(sub: any): any {
    var data: any[] = [];
    this.batchxii.forEach((batch) => {
      this.studentService.getAverageMarks(batch).subscribe((response) => {
        if (response.success) {
          if (sub == 'Physics') {
            data.push(response.avg.avgPhy);
          } else if (sub == 'Chemistry') {
            data.push(response.avg.avgChem);
          } else if (sub == 'Botany') {
            data.push(response.avg.avgBot);
          } else if (sub == 'Zoology') {
            data.push(response.avg.avgZoo);
          }
          var chartData = [
            {
              data: data,
              label: sub,
            },
          ];
          this.twelveBarChartData = chartData;
          return chartData;
        } else return [{ data: [0], label: 'Error' }];
      });
    });
  }
  //Target Chart
  forTarget(sub: any): any {
    var data: any[] = [];
    this.batchtarget.forEach((batch) => {
      this.studentService.getAverageMarks(batch).subscribe((response) => {
        if (response.success) {
          if (sub == 'Physics') {
            data.push(response.avg.avgPhy);
          } else if (sub == 'Chemistry') {
            data.push(response.avg.avgChem);
          } else if (sub == 'Botany') {
            data.push(response.avg.avgBot);
          } else if (sub == 'Zoology') {
            data.push(response.avg.avgZoo);
          }
          var chartData = [
            {
              data: data,
              label: sub,
            },
          ];
          this.targetBarChartData = chartData;
          return chartData;
        } else return [{ data: [0], label: 'Error' }];
      });
    });
  }
  // ----------------------Total Student Ploar Chart
  public polarAreaChartLabels = [
    '11 class Student',
    '12 class Student',
    'Target Student',
  ];
  public polarAreaChartData = [
    this.studentxi,
    this.studentxii,
    this.studenttarget,
  ];
  public polarAreaLegend = true;
  public polarAreaChartType: any = 'polarArea';
  public polarAreaChartColors: Array<any> = [
    {
      backgroundColor: ['#4BC0C0AA', '#FF6384AA', '#16DB93AA'],
    },
  ];
  //---------------------11th Class Student Bar Chart
  public elevenBarChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
            suggestedMax: 20,
          },
        },
      ],
    },
  };
  public elevenBarChartLabels: any = this.getbatch('11');
  public elevenBarChartType: any = 'bar';
  public elevenBarChartLegend = true;
  public elevenBarChartData = [
    { data: [0, 59, 80, 81, 56, 55, 40], label: '' },
  ];
  public elevenBarChartColors: Array<any> = [
    {
      backgroundColor: 'rgb(75, 192, 192)',
    },
  ];
  // 12th Class Student Bar Chart
  public twelveBarChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
            suggestedMax: 10,
          },
        },
      ],
    },
  };
  public twelveBarChartLabels: any = this.getbatch('12');
  public twelveBarChartType: any = 'bar';
  public twelveBarChartLegend = true;
  public twelveBarChartData = [
    { data: [0, 59, 80, 81, 56, 55, 40], label: '' },
  ];
  public twelveBarChartColors: Array<any> = [
    {
      backgroundColor: 'rgb(255, 99, 132)',
    },
  ];
  // Target Class Student Bar Chart
  public targetBarChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
            suggestedMax: 10,
          },
        },
      ],
    },
  };
  public targetBarChartLabels: any = this.getbatch('Target');
  public targetBarChartType: any = 'bar';
  public targetBarChartLegend = true;
  public targetBarChartData = [
    { data: [0, 59, 80, 81, 56, 55, 40], label: '' },
  ];
  public targetBarChartColors: Array<any> = [
    {
      backgroundColor: '#16DB93',
    },
  ];
  // Modal For Edit Student
  openModal() {
    this.display = 'block';
    this.autoFillForm();
  }
  onCloseHandled() {
    this.display = 'none';
  }
  // Getter Method for Update Student
  get referenceid() {
    return this.updateStudentForm.get('referenceid');
  }
  get rollno() {
    return this.updateStudentForm.get('rollno'); //
  }
  get file() {
    return this.updateStudentForm.get('file');
  }
  get name() {
    return this.updateStudentForm.get('name'); //students full name
  }
  get fname() {
    return this.updateStudentForm.get('fname'); //
  }
  get mname() {
    return this.updateStudentForm.get('mname'); //
  }
  get email() {
    return this.updateStudentForm.get('email'); //
  }
  get focc() {
    return this.updateStudentForm.get('focc'); //father's occupation
  }
  get mocc() {
    return this.updateStudentForm.get('mocc'); //mothers's occupation
  }
  get contact() {
    return this.updateStudentForm.get('contact'); //student contact
  }
  get fmno() {
    return this.updateStudentForm.get('fmno'); //fathers mob no
  }
  get mmno() {
    return this.updateStudentForm.get('mmno'); //mothers mob no
  }
  get lgmno() {
    return this.updateStudentForm.get('lgmno'); //local guardian mob no
  }
  get dob() {
    return this.updateStudentForm.get('dob'); //strudent dob
  }
  get aadhaarno() {
    return this.updateStudentForm.get('aadhaarno'); //student's adhaar
  }
  get category() {
    return this.updateStudentForm.get('category'); //
  }
  get pwd() {
    return this.updateStudentForm.get('pwd');
  }
  // Address
  get state() {
    return this.updateStudentForm.get('state'); //
  }
  get district() {
    return this.updateStudentForm.get('district'); //
  }
  get address() {
    return this.updateStudentForm.get('address'); //
  }
  get localaddress() {
    return this.updateStudentForm.get('localaddress'); //
  }
  get lgaddress() {
    return this.updateStudentForm.get('lgaddress'); //
  }
  get reference_from() {
    return this.updateStudentForm.get('reference_from'); //
  }
  get class() {
    return this.updateStudentForm.get('class'); //
  }
  get medium() {
    return this.updateStudentForm.get('medium'); //
  }
  // Couseller
  get cname() {
    return this.updateStudentForm.get('cname'); //
  }
  get cabin() {
    return this.updateStudentForm.get('cabin'); //
  }
  get poyoX() {
    return this.updateStudentForm.get('poyoX'); //pass year 10
  }
  get poyoXI() {
    return this.updateStudentForm.get('poyoXI'); //pass year 11
  }
  get poyoXII() {
    return this.updateStudentForm.get('poyoXII'); //pass year 12
  }
  get pastneetmarks() {
    return this.updateStudentForm.get('pastneetmarks');
  }
  get gradeX() {
    return this.updateStudentForm.get('gradeX'); //grades in 10 class
  }
  get gradeXI() {
    return this.updateStudentForm.get('gradeXI'); //grades in 11 class
  }
  get gradeXII() {
    return this.updateStudentForm.get('gradeXII'); //grades in 12 class
  }
  get pastneetair() {
    return this.updateStudentForm.get('pastneetair'); //past neet AIR
  }
  get schoolnameX() {
    return this.updateStudentForm.get('schoolnameX'); //School Name 10
  }
  get schoolnameXI() {
    return this.updateStudentForm.get('schoolnameXI'); //School Name 11
  }
  get schoolnameXII() {
    return this.updateStudentForm.get('schoolnameXII'); ///School Name 12
  }
  get pastneetattemptsno() {
    return this.updateStudentForm.get('pastneetattemptsno'); ///No of attempts in neet
  }
  get schooladdX() {
    return this.updateStudentForm.get('schooladdX'); //School Address of 10
  }
  get schooladdXI() {
    return this.updateStudentForm.get('schooladdXI'); //School Address of 11
  }
  get schooladdXII() {
    return this.updateStudentForm.get('schooladdXII'); //School Address of 12
  }
  get pastneetremarks() {
    return this.updateStudentForm.get('pastneetremarks');
  }
  //Coaching Ref Details
  get acadyear() {
    return this.updateStudentForm.get('acadyear');
  }
  get batch() {
    return this.updateStudentForm.get('batch');
  }
  get bag() {
    return this.updateStudentForm.get('bag');
  }
  get modulecard() {
    return this.updateStudentForm.get('modulecard');
  }
  // Batch Declaration
  batches: Batch[] = [];
  // Dropdown Arrays
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
  // Autofill For Updating Student
  autoFillForm() {
    this.batchService.fetchAllBatch().subscribe((response) => {
      if (response.success) {
        this.batches = response.batches;
      }
    });

    var studentTemporaryCache: Student = this.student;
    localStorage.setItem(
      'studentTemporaryCache',
      JSON.stringify(studentTemporaryCache)
    );

    this.updateStudentForm.patchValue({
      referenceid: this.student.referenceId, //Enter Pattern later on
      rollno: this.student.rollNo,
      name: this.student.fullName,
      fname: this.student.fatherName,
      mname: this.student.motherName,
      email: this.student.email,
      focc: this.student.fathersOccupation,
      mocc: this.student.mothersOccupation,
      contact: this.student.studentContact,
      fmno: this.student.fatherContact,
      mmno: this.student.motherContact,
      lgmno: this.student.localGuardNo,
      dob: this.student.dob,
      aadhaarno: this.student.aadhaarNo,
      category: this.student.category,
      pwd: this.student.pwd,
      state: this.student.state,
      district: this.student.district,
      address: this.student.address,
      localaddress: this.student.localAddress,
      lgaddress: this.student.localGuardAdd,
      reference_from: this.student.referenceMedium,
      class: this.student.class,
      medium: this.student.medium,
      cname: this.student.counsellorName,
      cabin: this.student.counsellorCabin,
      poyoX: this.student.passYearX,
      poyoXI: this.student.passYearXI,
      poyoXII: this.student.passYearXII,
      pastneetmarks: this.student.pastNeetMarks,
      gradeX: this.student.gradeInX,
      gradeXI: this.student.gradeInXI,
      gradeXII: this.student.gradeInXII,
      pastneetair: this.student.pastNeetAir,
      schoolnameX: this.student.schoolNameX,
      schoolnameXI: this.student.schoolNameXI,
      schoolnameXII: this.student.schoolNameXII,
      pastneetattemptsno: this.student.noOfAttemptsNeet,
      schooladdX: this.student.schoolAddressX,
      schooladdXI: this.student.schoolAddressXI,
      schooladdXII: this.student.schoolAddressXII,
      pastneetremarks: this.student.pastNeetRemarks,
      acadyear: this.student.acadYear,
      batch: this.student.batch._id,
      bag: this.student.bag,
      modulecard: this.student.moduleCard,
    });
  }
  // Update Student Record
  createUpdateStudentForm(): void {
    this.updateStudentForm = this.fb.group({
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
      this.updateStudentForm.get('file')?.setValue(file);
      // File Read and display
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      reader.onload = (event) => {
        // called once readAsDataURL is completed
        this.url = event.target?.result;
      };
    }
  }

  onUpdate(): void {
    if (this.updateStudentForm.valid) {
      const formData = new FormData();
      formData.append(
        'referenceid',
        this.updateStudentForm.get('referenceid')?.value
      );
      formData.append('rollno', this.updateStudentForm.get('rollno')?.value);
      formData.append('name', this.updateStudentForm.get('name')?.value);
      formData.append('fname', this.updateStudentForm.get('fname')?.value);
      formData.append('mname', this.updateStudentForm.get('mname')?.value);
      formData.append('email', this.updateStudentForm.get('email')?.value);
      formData.append('focc', this.updateStudentForm.get('focc')?.value);
      formData.append('mocc', this.updateStudentForm.get('mocc')?.value);
      formData.append('contact', this.updateStudentForm.get('contact')?.value);
      formData.append('fmno', this.updateStudentForm.get('fmno')?.value);
      formData.append('mmno', this.updateStudentForm.get('mmno')?.value);
      formData.append('lgmno', this.updateStudentForm.get('lgmno')?.value);
      formData.append('dob', this.updateStudentForm.get('dob')?.value);
      formData.append(
        'aadhaarno',
        this.updateStudentForm.get('aadhaarno')?.value
      );
      formData.append(
        'category',
        this.updateStudentForm.get('category')?.value
      );
      formData.append('pwd', this.updateStudentForm.get('pwd')?.value);
      formData.append('state', this.updateStudentForm.get('state')?.value);
      formData.append(
        'district',
        this.updateStudentForm.get('district')?.value
      );
      formData.append('address', this.updateStudentForm.get('address')?.value);
      formData.append(
        'localaddress',
        this.updateStudentForm.get('localaddress')?.value
      );
      formData.append(
        'lgaddress',
        this.updateStudentForm.get('lgaddress')?.value
      );
      formData.append(
        'reference_from',
        this.updateStudentForm.get('reference_from')?.value
      );
      formData.append('class', this.updateStudentForm.get('class')?.value);
      formData.append('medium', this.updateStudentForm.get('medium')?.value);
      formData.append('cname', this.updateStudentForm.get('cname')?.value);
      formData.append('cabin', this.updateStudentForm.get('cabin')?.value);
      formData.append('poyoX', this.updateStudentForm.get('poyoX')?.value);
      formData.append('poyoXI', this.updateStudentForm.get('poyoXI')?.value);
      formData.append('poyoXII', this.updateStudentForm.get('poyoXII')?.value);
      formData.append(
        'pastneetmarks',
        this.updateStudentForm.get('pastneetmarks')?.value
      );
      formData.append('gradeX', this.updateStudentForm.get('gradeX')?.value);
      formData.append('gradeXI', this.updateStudentForm.get('gradeXI')?.value);
      formData.append(
        'gradeXII',
        this.updateStudentForm.get('gradeXII')?.value
      );
      formData.append(
        'pastneetair',
        this.updateStudentForm.get('pastneetair')?.value
      );
      formData.append(
        'schoolnameX',
        this.updateStudentForm.get('schoolnameX')?.value
      );
      formData.append(
        'schoolnameXI',
        this.updateStudentForm.get('schoolnameXI')?.value
      );
      formData.append(
        'schoolnameXII',
        this.updateStudentForm.get('schoolnameXII')?.value
      );
      formData.append(
        'pastneetattemptsno',
        this.updateStudentForm.get('pastneetattemptsno')?.value
      );
      formData.append(
        'schooladdX',
        this.updateStudentForm.get('schooladdX')?.value
      );
      formData.append(
        'schooladdXI',
        this.updateStudentForm.get('schooladdXI')?.value
      );
      formData.append(
        'schooladdXII',
        this.updateStudentForm.get('schooladdXII')?.value
      );
      formData.append(
        'pastneetremarks',
        this.updateStudentForm.get('pastneetremarks')?.value
      );
      formData.append(
        'acadyear',
        this.updateStudentForm.get('acadyear')?.value
      );
      formData.append('batch', this.updateStudentForm.get('batch')?.value);
      formData.append('bag', this.updateStudentForm.get('bag')?.value);
      formData.append(
        'modulecard',
        this.updateStudentForm.get('modulecard')?.value
      );
      formData.append('file', this.updateStudentForm.value.file);
      this.studentService.updateStudent(formData).subscribe((response) => {
        if (response.success) {
          this.updateStudentForm.reset();
          this.updateSuccessAlert = response.msg;
          this.logTheBatchUpdate(this.updateStudentForm.value, 'updatebatch');
        } else {
          this.updateAlert = response.msg;
        }
      });
    } else {
      this.updateAlert = 'Please fill valid details';
    }
  }

  logTheBatchUpdate(data : any, agenda : string) {

    var user : any = JSON.parse(localStorage.getItem('studentTemporaryCache') || '');
    this.oldBatch = user.batch.batch;
    this.studentLog.rollNo = user.rollNo.toString();
    localStorage.removeItem('studentTemporaryCache');

    this.studentService.getStudent(parseInt(this.studentLog.rollNo)).subscribe((response) => {
      if (response.success) {
        console.log("Response is suceessful");
        this.newBatch = response.student[0].batch.batch;
        this.logStudentAction(user, agenda);
      } else {
        alert(response.msg);
      }
    });
  }

  logStudentAction(data: any, agenda : string) : void {
    this.studentLog.timeStamp = new Date();
    switch (agenda) {
      case 'demoregister' :
        this.studentLog.logText = `The student ${this.name?.value} has been registered to demo batch by ${this.cname?.value}. `;
        break;
      case 'democard' :
        this.studentLog.logText = `The student ${this.name?.value} has been provided demo card. `;
        break;
      case 'updatebatch' :
        this.studentLog.logText = `${data.fullName} batch has been changed from ${this.oldBatch} to ${this.newBatch} `;
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
