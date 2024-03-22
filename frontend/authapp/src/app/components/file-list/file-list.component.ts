import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FileUploadService } from '../../ftp-upload.service';
import { Emitters } from '../../emiters/emitters';

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.css']
})
export class FileListComponent implements OnInit {
  fileNames: string[] = [];
  @Input() searchText: string = '';

  constructor(private http: HttpClient,private fileUploadService: FileUploadService) { }

  ngOnInit(): void {
    this.fetchFileNames();
    Emitters.fileUploaded.subscribe(() => {
      this.fetchFileNames();
    });
  }
 
  fetchFileNames(): void {
    this.http.get<any[]>('http://localhost:2000/api/files',{
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
  
  trashFile(fileName: string): void {
    this.http.post('http://localhost:2000/api/trash', { fileName }, { withCredentials: true })
      .subscribe(
        () => {
          console.log('File trashed successfully');
          Emitters.fileUploaded.emit();
        },
        error => {
          console.error('Error trashing file:', error);
        }
      );
  }

}
