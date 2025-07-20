import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LegoService } from '../lego.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  page: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  isLoading: boolean = false;
  legoData: any = [];
  searchOptions: any = [];
  resultOptions: any = [];
  selectedOption: string = '';

  @ViewChild('searchInput') searchInput!: ElementRef;

  constructor(private legoService: LegoService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.legoService.getColumns().subscribe((result) => {
      this.searchOptions = result.nombres_columnas
      this.cdr.markForCheck();
    })
  }

  getSelectedOption(event: any) {
    this.selectedOption = event.target.value;
    this.searchInput.nativeElement.value = '';
    setTimeout(() => {
      this.searchInput.nativeElement.focus();
    }, 1000);
  }

  getResultOptions(event: any) {
    this.legoService.getOptions(this.selectedOption.toLowerCase(), event.target.value).subscribe({
      next: (result) => {
        this.resultOptions = result.data;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al obtener los resultados:', error.error.message);
        this.resultOptions = [];
        this.cdr.markForCheck();
      }
    })
  }

  getLegoPieces(selected: any) {
    this.resultOptions = [];
    this.searchInput.nativeElement.value = selected;
    this.isLoading = true;
    this.legoService.getResults(this.selectedOption.toLowerCase(), selected, this.page, this.pageSize).subscribe({
      next: (response) => {
        this.legoData = response.data;
        this.legoData = this.legoData.map((lego: any) => {
          return {
            ...lego,
            imgPiece: response.imgData.codeImage ? response.imgData.codeImage : response.imgData.codeImages.find((img: any) => img.piece === lego.pieza).img,
            imgLego: response.imgData.legoImage ? response.imgData.legoImage : response.imgData.legoImages.find((img: any) => img.lego === lego.lego).img
          }
        })
        console.log(this.legoData)
        this.pageSize = response.pagination.pageSize;
        this.totalPages = response.pagination.totalPages;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al obtener las piezas de Lego:', error.error.message);
      }
    });
  }
}
