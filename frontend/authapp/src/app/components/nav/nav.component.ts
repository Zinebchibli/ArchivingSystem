import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Emitters } from '../../emiters/emitters';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent {
  authenticated = false
  fullname = ""
  email = ""
  constructor(private http:HttpClient){}
  ngOnInit(): void {
    Emitters.authEmitter.subscribe((auth:boolean)=>{
      this.authenticated = auth
    })
    this.http.get('http://localhost:2000/api/user',{
      withCredentials:true
    })
    .subscribe(
      (res:any) => {
        this.fullname = res.fullname
        this.email = res.email
    },
    (err) => {
    }
    );
  }

  logout(){
    this.http.post('http://localhost:2000/api/logout',{},{
      withCredentials:true
    }).subscribe(() => this.authenticated = false)
  }
}

