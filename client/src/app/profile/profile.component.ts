import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import PasswordValidation from '../_helpers/passwordValidation';
import { AlertService, UserService } from '../_services';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
    profileForm: FormGroup;
    user: any;
    loading = false;
    submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private userService: UserService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        this.userService.getProfile().subscribe(
            user => {
                this.user = user;

                this.profileForm = this.formBuilder.group({
                    currentPassword: ['', Validators.required],
                    firstName: [
                        this.user.firstName,
                        [Validators.required, Validators.minLength(3)]
                    ],
                    lastName: [
                        this.user.lastName,
                        [Validators.required, Validators.minLength(3)]
                    ],
                    username: [
                        this.user.username,
                        [Validators.required, Validators.minLength(3)]
                    ],
                    email: [
                        this.user.email,
                        [Validators.required, Validators.email]
                    ],
                    instagram: [this.user.social.instagram],
                    linkedin: [this.user.social.linkedin],
                    telegram: [this.user.social.telegram],
                    github: [this.user.social.github],
                    newPassword: ['', Validators.minLength(6)],
                    newConfirmPassword: ['', PasswordValidation('newPassword')]
                });
            },
            err => {
                return false;
            }
        );
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.profileForm.controls;
    }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.profileForm.invalid) {
            return;
        }

        this.loading = true;

        if (!this.profileForm.value.instagram) {
            delete this.profileForm.value.instagram;
        }
        if (!this.profileForm.value.linkedin) {
            delete this.profileForm.value.linkedin;
        }
        if (!this.profileForm.value.telegram) {
            delete this.profileForm.value.telegram;
        }
        if (!this.profileForm.value.github) {
            delete this.profileForm.value.github;
        }
        if (!this.profileForm.value.newPassword) {
            delete this.profileForm.value.newPassword;
        }
        if (!this.profileForm.value.newConfirmPassword) {
            delete this.profileForm.value.newConfirmPassword;
        }

        this.userService
            .updateProfile(this.profileForm.value)
            .pipe(first())
            .subscribe(
                user => {
                    this.alertService.success(
                        'Profile updated successfully',
                        true
                    );
                    this.router.navigate(['/']);
                },
                error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            );
    }
}
