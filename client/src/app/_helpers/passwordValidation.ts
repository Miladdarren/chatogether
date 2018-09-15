import { AbstractControl } from '@angular/forms';
export class PasswordValidation {
    static Match(AC: AbstractControl) {
        const password = AC.get('newPassword').value;
        const confirmPassword = AC.get('newConfirmPassword').value;

        if (password !== confirmPassword) {
            AC.get('newConfirmPassword').setErrors({ MatchPassword: true });
        } else {
            return null;
        }
    }
}
