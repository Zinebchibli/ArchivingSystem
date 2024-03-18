import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Emitters } from '../../emiters/emitters';
import { FileUploadService } from '../../ftp-upload.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  searchText: string = '';
  selectedFile: File | undefined;
  message: string;
  authenticated = false;

  constructor(private http: HttpClient, private fileUploadService: FileUploadService, private router: Router) {}

  ngOnInit(): void {
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
  

  onSearch(): void {}

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
