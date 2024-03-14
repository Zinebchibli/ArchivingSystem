import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup,FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
 form:FormGroup


 constructor(
  private FormBuilder:FormBuilder,
  private http:HttpClient,
  private router:Router
 ){

 }

ngOnInit():void{
  this.form=this.FormBuilder.group({
    fullname:"",
    email:"",
    password:""
  })
}

validateEmail(email: string): boolean {
  const emailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  return emailRegex.test(email);
}

onSubmit ():void {
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
