import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Upload } from 'src/app/Models/Upload';
import { ExamService } from '../../../services/exam.service';
import * as XLSX from 'xlsx';
import { OrderPipe } from 'ngx-order-pipe';
import { BatchService } from 'src/app/services/batch.service';
import { Batch } from 'src/app/Models/Batch';
import { Student } from 'src/app/Models/Student';

type AOA = any[][];

@Component({
  selector: 'app-exam-cell',
  templateUrl: './exam-cell.component.html',
  styleUrls: ['./exam-cell.component.css'],
})
export class ExamCellComponent implements OnInit {
  // todayDate: Date = new Date();
  /*------------- Tabs JS ---------------*/
  activeTab = 'demo';
  excel: any;
  user: any;

  students: Student[] = [];
  batches: Batch[] = [];

  detailedInfoExamStudents: Student[] = [];
  openDetailedModalUpload: Upload = new Upload();

  //Pagination
  collectionSize: Array<any> = [];
  totalRecords: number = 0;
  page: number = 1;
  pageSize = 4;

  //Filter Search
  filterTerm: string = '';

  //Sorting
  order: string = 'examName'; //check here
  reverse: boolean = false;
  sortedCollection: any[];

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
  // Delete Alerts
  deleteSuccessAlert!: String;
  deleteErrorAlert!: String;
  // Update Alerts
  updateAlert!: String;
  updateSuccessAlert!: String;
  modalSmsSuccess!: String;
  modalSmsError!: String;

  uploadList: Upload[] = [];
  headers: String[] = [
    'Name of Exam',
    'Date of Exam',
    'Upload File',
    'Upload Date',
    'Batch',
  ];

  //Modal
  display = 'none';

  // Getter Method for Upload Form
  get exam_name() {
    return this.uploadForm.get('exam_name');
  }
  get batch() {
    return this.uploadForm.get('batch');
  }
  get exam_date() {
    return this.uploadForm.get('exam_date');
  }
  get file() {
    return this.uploadForm.get('file');
  }
  // Getter Method for Updating Upload Form
  get update_exam_name() {
    return this.updateUploadForm.get('update_exam_name');
  }
  get update_batch() {
    return this.updateUploadForm.get('update_batch');
  }
  get update_exam_date() {
    return this.updateUploadForm.get('update_exam_date');
  }
  /*------------------------------------- */
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private examService: ExamService,
    private batchService: BatchService,
    private orderPipe: OrderPipe
  ) {
    this.sortedCollection = orderPipe.transform(this.uploadList, 'examName'); //sorting
  }

  //sorting
  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  ngOnInit(): void {
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
    // Upload Form
    this.createUploadForm();
    // Update Upload Form
    this.createUpdateUploadForm();
    this.examService.fetchAllUploads().subscribe((uploads) => {
      if (uploads.success) {
        this.uploadList = uploads.uploads;
        this.totalRecords = uploads.uploads.length; //pagination
        this.data = [this.headers];
        this.uploadList.forEach((upload) => {
          var row: any[] = [];
          row.push(upload.examName);
          row.push(upload.examDate);
          row.push(upload.originalName);
          row.push(upload.createdAt);
          row.push(upload.batch.batch);
          this.data.push(row);
        });
      } else {
        this.allAlert = uploads.msg;
      }
    });
  }

  createUploadForm(): void {
    this.uploadForm = this.fb.group({
      exam_name: ['', Validators.required],
      batch: ['', Validators.required],
      exam_date: ['', Validators.required],
      file: ['', Validators.required],
    });
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.uploadForm.get('file')?.setValue(file);
    }
  }

  onUpload(): void {
    if (this.uploadForm.valid) {
      const formData = new FormData();
      formData.append('exam_name', this.uploadForm.get('exam_name')?.value);
      formData.append('batch', this.uploadForm.get('batch')?.value);
      formData.append('exam_date', this.uploadForm.get('exam_date')?.value);
      formData.append('file', this.uploadForm.value.file);
      this.examService.uploadResult(formData).subscribe((response) => {
        if (response.success) {
          this.successAlert = response.msg;
        } else {
          this.allAlert = response.msg;
        }
      });
    } else {
      this.allAlert = 'Failed to upload the file';
    }
  }

  deactivateUpload(upload: Upload): void {
    let confirm = window.confirm(
      'Are you sure you want to delete the Exam Data of this particular exam?'
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
      this.examService.deactivateExamData(upload._id).subscribe((response) => {
        if (response.success) {
          this.deleteSuccessAlert = response.msg;
        } else {
          this.deleteErrorAlert = response.msg;
        }
      });
    }
   }
  }
  // Converting Table to Excel File
  data: AOA = [this.headers];
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
  fileName: string = new Date().toLocaleString().toString() + '_examList.xlsx';
  export(): void {
    /* generate worksheet */
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.data);
    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    /* save to file */
    XLSX.writeFile(wb, this.fileName);
  }
  // Modal
  openModal(upload: any) {
    this.display = 'block';
    this.autoFillForm(upload);
  }
  onCloseHandled() {
    this.display = 'none';
  }

  detailedInfoModal(upload:Upload){
    this.batchService
      .FetchBatchStudents(upload.batch.batch)
      .subscribe((response) => {
        if (response.success) {
          var details = {
            upload: upload,
            students: response.students,
          };
          this.examService.sendListOfStudent(details).subscribe((response) => {
            if (response.success) {
              this.detailedInfoExamStudents = response.students;
              this.openDetailedModalUpload = upload;
            } else {
              this.deleteErrorAlert = response.msg;
            }
          });
        }
      });
    
  }

  sendDetailedInfoSms(detailedInfoExamStudent:Student) {
    var detail = {
      upload: this.openDetailedModalUpload,
      student: detailedInfoExamStudent,
    };

    this.examService.detailedSingleSms(detail).subscribe((response) => {
      if (response.success) {
        this.deleteSuccessAlert = response.msg;
      } else {
        this.deleteErrorAlert = response.msg;
      }
    });


  }

  autoFillForm(upload: any) {
    this.updateUploadForm.patchValue({
      update_id: upload._id,
      update_exam_name: upload.examName, //Enter Pattern later on
      update_batch: upload.batch.batch,
      update_exam_date: upload.examDate,
    });
  }
  // Update Upload Form
  createUpdateUploadForm(): void {
    this.updateUploadForm = this.fb.group({
      update_id: [''],
      update_exam_name: ['', Validators.required],
      update_batch: ['', Validators.required],
      update_exam_date: ['', Validators.required],
    });
  }
  onUpdate(): void {
    if (this.updateUploadForm.valid) {
      this.examService
        .updateExamUpload(this.updateUploadForm.value)
        .subscribe((response) => {
          if (response.success) {
            this.ngOnInit();
            this.updateSuccessAlert = response.msg;
          } else {
            this.updateAlert = response.msg;
          }
        });
    } else {
      this.updateAlert = 'Please fill valid details';
    }
  }

  sendSms(upload: Upload) {
    this.batchService
      .FetchBatchStudents(upload.batch.batch)
      .subscribe((response) => {
        if (response.success) {
          var details = {
            upload: upload,
            students: response.students,
          };

          this.examService.sendSms(details).subscribe((response) => {
            if (response.success) {
              this.deleteSuccessAlert = response.msg;
            } else {
              this.deleteErrorAlert = response.msg;
            }
          });
        }
      });
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
  refreshCurrentComponent() {
    console.log('Refresh Exam Cell Component');
  }
}
