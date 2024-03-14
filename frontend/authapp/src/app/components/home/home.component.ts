import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Emitters } from '../../emiters/emitters';
import { FileUploadService } from '../../ftp-upload.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent  implements OnInit
{
  selectedFile: File | undefined;
  message :String
  authenticated = false

  constructor(private http:HttpClient,private fileUploadService: FileUploadService,private router:Router){}

  ngOnInit(): void{
    this.http.get('http://localhost:2000/api/user',{
      withCredentials:true
    })
    .subscribe(
      (res:any) => {
       this.message =`Hi ${res.fullname}`;
       Emitters.authEmitter.emit(true)
    },
    (err) => {
      this.message = "you are not logged in"
      Emitters.authEmitter.emit(false)
      this.router.navigate(['/login'])
    }
    );
  }
  

  
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] as File;
  }
  
  uploadFile() {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      this.fileUploadService.uploadFile(formData)
        .subscribe(
          response => {
            console.log('File uploaded successfully:', response);
            this.selectedFile = undefined;
          },
          error => {
            console.error('Error uploading file:', error);
          }
        );
    } else {
      console.error('No file selected.');
    }
    window.location.reload();

  }
}
