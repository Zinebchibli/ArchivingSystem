import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Emitters } from '../../emiters/emitters';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-trash',
  templateUrl: './trash.component.html',
  styleUrl: './trash.component.css',
})
export class TrashComponent {
  fileNames: string[] = [];
  searchText: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const isAuthenticated = localStorage.getItem('isAuthenticated');

    if (isAuthenticated === 'true') {
      Emitters.authEmitter.emit(true);
    } else {
      Emitters.authEmitter.emit(false);
    }

    this.http
      .get('http://localhost:2000/api/user', { withCredentials: true })
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

    Emitters.fileUploaded.subscribe(() => {
      this.fetchFileNames();
    });
    this.fetchFileNames();
  }

  fetchFileNames(): void {
    this.http
      .get<any[]>('http://localhost:2000/api/trashfiles', {
        withCredentials: true,
      })
      .subscribe(
        (files: any[]) => {
          this.fileNames = files.map((file) => file.name);
        },
        (error) => {
          console.error('Error fetching file names:', error);
        }
      );
  }

  filterFiles(): string[] {
    const searchTerm = this.searchText.toLowerCase().trim();
    return this.fileNames.filter((fileName) =>
      fileName.toLowerCase().includes(searchTerm)
    );
  }

  restore(): void {
    this.http
      .post<any[]>(
        'http://localhost:2000/api/restoreall',
        {},
        {
          withCredentials: true,
        }
      )
      .subscribe(
        () => {
          Emitters.fileUploaded.emit();
          if (this.fileNames.length > 0) {
            Swal.fire(
              'Success',
              'All Files have been restored successfully!',
              'success'
            );
          } else {
            Swal.fire(
              'Error',
              'You dont have any files in your trash',
              'error'
            );
          }
        },
        (error) => {}
      );
  }

  delete(): void {
    if (this.fileNames.length > 0) {
      Swal.fire({
        title: 'Delete all files',
        text: 'Are you sure?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Delete',
      }).then((result) => {
        if (result.isConfirmed) {
          this.http
            .post<any[]>(
              'http://localhost:2000/api/deleteall',
              {},
              {
                withCredentials: true,
              }
            )
            .subscribe(
              () => {
                Emitters.fileUploaded.emit();
                Swal.fire({
                  icon: 'success',
                  title: 'All files have been deleted permanently!',
                  showConfirmButton: true,
                  timer: 5000,
                });
              },
              (error) => {
                console.error('Error occurred during deletion:', error);
              }
            );
        }
      });
    } else {
      Swal.fire('Error', 'You dont have any files in your trash', 'error');
    }
  }

  restoreFile(fileName: string): void {
    this.http
      .post(
        'http://localhost:2000/api/restore/',
        { fileName },
        {
          withCredentials: true,
        }
      )
      .subscribe(
        () => {
          console.log('File restored successfully');
          Emitters.fileUploaded.emit();
          Swal.fire({
            icon: 'success',
            title: 'File has been restored successfully!',
            showConfirmButton: true,
            timer: 5000,
          });
        },
        (error) => {
          console.error('Error restoring file:', error);
        }
      );
  }

  deleteFile(fileName: string): void {
    this.http
      .post(
        'http://localhost:2000/api/delete',
        { fileName },
        { withCredentials: true }
      )
      .subscribe(
        () => {
          console.log('File deleted successfully');
          Emitters.fileUploaded.emit();
          Swal.fire({
            icon: 'success',
            title: 'File has been deleted successfully!',
            showConfirmButton: true,
            timer: 5000,
          });
        },
        (error) => {
          console.error('Error deleting file:', error);
        }
      );
  }

  confirmDelete(fileName: string) {
    Swal.fire({
      title: 'Delete file',
      text: 'Are you sure',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteFile(fileName);
      }
    });
  }
}
