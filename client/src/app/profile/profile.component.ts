import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { FileUploader } from 'ng2-file-upload';

import PasswordValidation from '../_helpers/passwordValidation';
import { AlertService, UserService } from '../_services';
import { environment } from '../../environments/environment';
import { Cookies } from '../_helpers';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
    profileForm: FormGroup;
    user: any;
    loading = false;
    submitted = false;
    uploader: FileUploader = new FileUploader({
        url: `${environment.apiUrl}/users/uploadpic`,
        itemAlias: 'photo',
        authToken: this.cookies.getAccessToken()
    });

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private userService: UserService,
        private alertService: AlertService,
        private cookies: Cookies
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

        this.uploader.onCompleteItem = (
            item: any,
            response: any,
            status: any,
            headers: any
        ) => {
            response = JSON.parse(response);
            if (!response.success) {
                window.scrollTo(0, 0);
                this.alertService.error(
                    'Profile picture must be a PNG or JPEG less than 1 MB'
                );
                this.loading = false;
                return;
            }
            this.router
                .navigate(['/refresh'])
                .then(() => this.router.navigate(['/profile']));
        };
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
                    this.router
                        .navigate(['/refresh'])
                        .then(() => this.router.navigate(['/profile']));
                },
                error => {
                    window.scrollTo(0, 0);
                    this.alertService.error(error);
                    this.loading = false;
                }
            );
    }
}
