import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Emitters } from '../../emiters/emitters';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{
  form:FormGroup
  constructor(
   private FormBuilder:FormBuilder,
   private http:HttpClient,
   private router:Router,
   ){
    
   }
   containerClass: string = 'containerx';

ngOnInit():void{
  this.form=this.FormBuilder.group({
    fullname:"",
    email:"",
    password:""
  })
  const isAuthenticated = localStorage.getItem('isAuthenticated');

  if (isAuthenticated === 'true') {
    Emitters.authEmitter.emit(true);
  } else {
    Emitters.authEmitter.emit(false);
  }

  this.http.get('http://localhost:2000/api/user', { withCredentials: true })
    .subscribe(
      (res: any) => {
        localStorage.setItem('isAuthenticated', 'true');
        Emitters.authEmitter.emit(true);
        this.router.navigateByUrl('/');
      },
      (err) => {
        localStorage.setItem('isAuthenticated', 'false');
        Emitters.authEmitter.emit(false);
        this.router.navigateByUrl('/login');
      }
    );
}

toggleMode(): void {
  if (this.containerClass.includes('sign-up-mode')) {
    this.containerClass = 'containerx'; // Switch to sign-in mode
  } else {
    this.containerClass = 'containerx sign-up-mode'; // Switch to sign-up mode
  }
}

validateEmail(email: string): boolean {
  const emailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  return emailRegex.test(email);
}

Login ():void {
  let user = this.form.getRawValue()
  console.log(user)

  if( user.email == "" || user.password == ""){
    Swal.fire("Error","Please enter all the fieds","error")
  }
  else if (!this.validateEmail(user.email)){
    Swal.fire("Error","Invalid Email Format!","error");
  }else{
    this.http.post("http://localhost:2000/api/login",user,{
      withCredentials:true
    })
    .subscribe(() => this.router.navigate(['/']),(err) => {
      Swal.fire("error ",err.error.message,"error")
    })
  }
}

Register ():void {
  let user = this.form.getRawValue()
  console.log(user)

  if(user.fullname == "" || user.email == "" || user.password == ""){
    Swal.fire("Error","Please enter all the fieds","error")
  }
  else if (!this.validateEmail(user.email)){
    Swal.fire("Error","Invalid Email Format!","error");
  }else{
    this.http.post("http://localhost:2000/api/register",user,{
      withCredentials:true
    })
    .subscribe(() => this.router.navigate(['/']),(err) => {
      Swal.fire("error ",err.error.message,"error")

    })
  }
}

}

