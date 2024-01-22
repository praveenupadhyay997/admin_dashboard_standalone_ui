import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-refresh-button',
  templateUrl: './refresh-button.component.html',
  styleUrls: ['./refresh-button.component.css'],
})
export class RefreshButtonComponent implements OnInit {
  @Output() refreshClick = new EventEmitter();
  constructor() {}

  ngOnInit(): void {}

  onRefresh() {
    this.refreshClick.emit();
  }
}
