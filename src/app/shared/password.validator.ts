import { AbstractControl } from '@angular/forms';

export function PasswordValidator(
  control: AbstractControl
): {
  [key: string]: boolean;
} | null {
  const newPass = control.get('newPass');
  const confirmPass = control.get('confirmPass');
  if (newPass?.pristine || confirmPass?.pristine) {
    return null;
  }
  return newPass && confirmPass && newPass.value != confirmPass.value
    ? { misMatch: true }
    : null;
}
