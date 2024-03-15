import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Emitters } from '../../emiters/emitters';
import { Router } from '@angular/router';

@Component({
  selector: 'app-trash',
  templateUrl: './trash.component.html',
  styleUrl: './trash.component.css'
})
export class TrashComponent {
  fileNames: string[] = [];
  searchText: string = '';
  
  constructor(private http: HttpClient,private router:Router) { }

    ngOnInit(): void{
      this.http.get('http://localhost:2000/api/user',{
        withCredentials:true
      })
      .subscribe(
        (res:any) => {
          Emitters.authEmitter.emit(true)
      },
      (err) => {
        Emitters.authEmitter.emit(false)
        this.router.navigate(['/login'])
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
  
}

