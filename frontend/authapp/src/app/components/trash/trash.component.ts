import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Emitters } from '../../emiters/emitters';
import { Router } from '@angular/router';
import { FileUploadService } from '../../ftp-upload.service';

@Component({
  selector: 'app-trash',
  templateUrl: './trash.component.html',
  styleUrl: './trash.component.css'
})
export class TrashComponent {
  fileNames: string[] = [];
  searchText: string = '';
  
  constructor(private http: HttpClient,private router:Router,private fileUploadService: FileUploadService) { }

    ngOnInit(): void{
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
            this.router.navigateByUrl('/trash');
          },
          (err) => {
            localStorage.setItem('isAuthenticated', 'false');
            Emitters.authEmitter.emit(false);
            this.router.navigateByUrl('/login');
          }
        );
      this.fetchFileNames();
  }
 
  fetchFileNames(): void {
    this.http.get<any[]>('http://localhost:2000/api/trashfiles',{
      withCredentials:true
    }).subscribe(
      (files: any[]) => {
        this.fileNames = files.map(file => file.name);
      },
      error => {
        console.error('Error fetching file names:', error);
      }
    );
  }

  filterFiles(): string[] {
    const searchTerm = this.searchText.toLowerCase().trim();
    return this.fileNames.filter(fileName => fileName.toLowerCase().includes(searchTerm));
  }
  
  restore(): void {
    this.http.post<any[]>('http://localhost:2000/api/restoreall', {}, { 
      withCredentials: true
    }).subscribe(
      () => {
      },
      error => {
     }
    );
    window.location.href = '/trash';
  }

  delete(): void {
    this.http.post<any[]>('http://localhost:2000/api/deleteall', {}, { 
      withCredentials: true
    }).subscribe(
      () => {
      },
      error => {
     }
    );
    window.location.href = '/trash';
  }

}

