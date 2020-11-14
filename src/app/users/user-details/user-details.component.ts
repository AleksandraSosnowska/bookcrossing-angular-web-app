import { Component, OnInit } from '@angular/core';
import {UserDefinition} from "../../core/models/user-definition.model";
import {UsersService} from "../../core/services/users.service";
import {ActivatedRoute, Router} from "@angular/router";
import {FormControl, FormGroup} from "@angular/forms";
import {TokenStorageService} from "../../shared/helpers/token-storage.service";

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {

  form: FormGroup;
  username: string;

  constructor(protected userService: UsersService,
              protected route: ActivatedRoute,
              protected activatedRoute: ActivatedRoute,
              protected router: Router,
              protected tokenStorage: TokenStorageService) {
    this.username = this.route.snapshot.paramMap.get('id');
    this.form = this.generateForm();
    this.userService.getUser(this.username).subscribe( user => {
      this.setFormValues(user);
    });
  }

  ngOnInit(): void { }

  generateForm(): FormGroup {
    return new FormGroup({
      id: new FormControl(''),
      firstName: new FormControl(''),
      username: new FormControl(''),
      city: new FormControl(''),
      province: new FormControl(''),
      startDate: new FormControl(''),
      addedBooks: new FormControl(''),
    })
  }

  setFormValues(user: UserDefinition): void {
    this.form.get('id').setValue(user.id);
    this.form.get('firstName').setValue(user.firstName);
    this.form.get('username').setValue(user.username);
    this.form.get('city').setValue(user.city);
    this.form.get('province').setValue(user.province);
    this.form.get('startDate').setValue(user.startDate);
    this.form.get('addedBooks').setValue(user.addedBooks);
  }

  editProfile(): void {
    this.router.navigate(['users/edit']);
  }

  sendMessage() {

  }

  isProfileView(): boolean {
    return !this.username;
  }

  isLoggedIn(): boolean {
    return !!this.tokenStorage.getUsername();
  }
}
