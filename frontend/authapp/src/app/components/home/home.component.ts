import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Emitters } from '../../emiters/emitters';
import { FileUploadService } from '../../ftp-upload.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

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
  uploadProgress: number | undefined; // Variable to hold upload progress

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

      this.fileUploadService.uploadFile(formData).subscribe(
        (progress: number) => {
          console.log(`Upload progress: ${progress}%`);
          this.uploadProgress = progress; // Update uploadProgress variable
          if (progress === 100) {
            Swal.fire({
              icon: "success",
              title: "File uploaded successfully!",
              showConfirmButton: true,
              timer: 5000
            });
            this.uploadProgress = undefined;
          }
        },
        error => {
          Swal.fire('Error', 'Error uploading file:', 'error');
          setTimeout(() => {
            this.uploadProgress = undefined;
          }, 5000); 
          console.error('Error uploading file:', error);
          this.uploadProgress = undefined; // Clear progress on error
        },
        () => {
          console.log('File uploaded successfully');
          this.selectedFile = undefined;
          Emitters.fileUploaded.emit();
          this.uploadProgress = undefined; // Clear progress after upload completes
        }
      );
    } else {
      console.error('No file selected.');
    }
  }
}
