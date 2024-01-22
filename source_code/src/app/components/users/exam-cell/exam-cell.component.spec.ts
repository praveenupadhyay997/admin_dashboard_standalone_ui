import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamCellComponent } from './exam-cell.component';

describe('ExamCellComponent', () => {
  let component: ExamCellComponent;
  let fixture: ComponentFixture<ExamCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExamCellComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExamCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
