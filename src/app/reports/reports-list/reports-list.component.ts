import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";

import { ReportDefinition } from "../../core/models/report-definition.model";
import { ReportService } from "../../core/services/report.service";
import { TokenStorageService } from "../../shared/helpers/services/token-storage.service";
import {DeleteConfirmationComponent} from "../../shared/components/delete-confirmation/delete-confirmation.component";
import {MatSnackBar, MatSnackBarConfig} from "@angular/material/snack-bar";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-reports-list',
  templateUrl: './reports-list.component.html',
  styleUrls: ['./reports-list.component.css']
})
export class ReportsListComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  dataSource = new MatTableDataSource<ReportDefinition>();

  displayedColumns = ['user', 'reporter', 'description', 'date', 'delete'];

  public searchForm: FormGroup;
  public reportedUser = '';
  public reporter = '';
  public reportDate = '';

  constructor(private reportService: ReportService,
              private tokenStorage: TokenStorageService,
              protected router: Router,
              protected snackBar: MatSnackBar,
              protected dialog: MatDialog) { }

  ngOnInit(): void {
    this.reportService.getReports().subscribe(response => {
      this.dataSource.data = response;
      this.dataSource.filterPredicate = this.getFilterPredicate;
    });
    this.searchFormInit();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  searchFormInit() {
    this.searchForm = new FormGroup({
      user: new FormControl('', Validators.pattern('^[a-zA-Z ]+$')),
      reporter: new FormControl('', Validators.pattern('^[a-zA-Z ]+$')),
      date: new FormControl('')
    });
  }

  getUserLink(username: string) {
    return `/users/details/${username}`;
  }

  deleteReport(idReport: number): void {
    this.reportService.deleteReport(idReport).subscribe( response => {
      this.openDeletedSnackBar();
      let index = this.dataSource.data.findIndex( _report => _report.id_report === idReport);
      this.dataSource.data.splice(index, 1);
      this.refreshTable(this.dataSource.data);
    })
  }

  openDeleteDialog(idReport: number) {
    const dialogRef = this.dialog.open(DeleteConfirmationComponent, {
      data: {
        title: `delete this report`,
        button: `Delete`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteReport(idReport);
      }
    });
  }

  openDeletedSnackBar(): void {
    let config = new MatSnackBarConfig();
    config.duration = 5000;
    let message = "Report deleted";
    this.snackBar.open(message, "x", config);
  }

  refreshTable(data: ReportDefinition[]){
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  sortData(sort: any){
    const data = this.dataSource.data;
    if (!sort.active || sort.direction == '') {
      this.dataSource.data = data;
      return;
    }

    this.dataSource.data = data.sort((a, b) => {
      let isAsc = sort.direction == 'asc';
      switch (sort.active) {
        case 'user': return compare(a.user, b.user, isAsc);
        case 'reporter': return compare(a.reporter, b.reporter, isAsc);
        case 'description': return compare(a.description, b.description, isAsc);
        case 'date': return compare(a.date, b.date, isAsc);
        default: return 0;
      }
    });
  }

  /* this method well be called for each row in table  */
  getFilterPredicate = (row: ReportDefinition, filters: string) => {
    // split string per '$' to array
    const filterArray = filters.split('$');
    const user = filterArray[0];
    const reporter = filterArray[1];
    const date = filterArray[2];

    const matchFilter = [];

    // Fetch data from row
    const columnUser = row.user;
    const columnReporter = row.reporter;
    const columnDate = row.date;

    // verify fetching data by our searching values
    const customFilterUser = columnUser.toLowerCase().includes(user);
    const customFilterReporter = columnReporter.toLowerCase().includes(reporter);
    const customFilterDate = columnDate.toDateString().toLowerCase().includes(date);

    // push boolean values into array
    matchFilter.push(customFilterUser);
    matchFilter.push(customFilterReporter);
    matchFilter.push(customFilterDate);

    // return true if all values in array is true
    // else return false
    return matchFilter.every(Boolean);
  }

  applyFilter() {
    const user = this.searchForm.get('user').value;
    const reporter = this.searchForm.get('reporter').value;
    const date = this.searchForm.get('date').value;

    this.reportedUser = user === null ? '' : user;
    this.reporter = reporter === null ? '' : reporter;
    this.reportDate = (date === null || date === '') ? '' : date;

    // create string of our searching values and split if by '$'
    const filterValue = this.reportedUser + '$' + this.reporter + '$' + this.reportDate;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}

function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
