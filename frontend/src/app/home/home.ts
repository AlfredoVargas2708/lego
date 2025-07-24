import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LegoService } from '../lego.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  page: number = 1;
  pageSize: number = 6;
  totalPages: number = 0;
  totalLegos: number = 0;
  maxPagesToShow: number = 6;
  valueSelected: string = '';
  activeField: string = '';
  isLoading: boolean = false;
  legoData: any = [];
  searchOptions: any = [];
  resultOptions: any = [];
  inputFormOptions: any = [];
  selectedOption: string = '';
  isAdding: boolean = true;

  addLegoForm: FormGroup = new FormGroup({});
  editLegoForm: FormGroup = new FormGroup({})

  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('formInput') formInput!: ElementRef;

  constructor(private legoService: LegoService, private cdr: ChangeDetectorRef, private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.legoService.getColumns().subscribe((result) => {
      this.searchOptions = result.columnas.filter((column: any) => column !== 'id')
      result.columnas.forEach((option: any) => {
        this.addLegoForm.addControl(option, new FormControl(''));
        this.editLegoForm.addControl(option, new FormControl(''));
      })
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

  getOptionsInForm(event: any, fieldName: string) {
    this.activeField = fieldName;

    const value = event.target.value;
    if (value.trim() === '') {
      this.inputFormOptions = [];
      return;
    }

    this.legoService.getOptions(fieldName.toLowerCase(), value).subscribe({
      next: (res) => {
        this.inputFormOptions = res.data;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error:', err);
        this.inputFormOptions = [];
        this.cdr.markForCheck();
      }
    });
  }

  addNewValueToForm(value: any) {
    if (this.isAdding) {
      this.addLegoForm.get(this.activeField)?.setValue(value);
      this.inputFormOptions = [];
      this.cdr.markForCheck();
    } else {
      this.editLegoForm.get(this.activeField)?.setValue(value);
      this.inputFormOptions = [];
      this.cdr.markForCheck();
    }
  }

  getLegoPieces(selected: any) {
    this.valueSelected = selected;
    this.resultOptions = [];
    this.searchInput.nativeElement.value = selected;
    this.isLoading = true;
    this.legoService.getResults(this.selectedOption.toLowerCase(), selected, this.page, this.pageSize).subscribe({
      next: (response) => {
        console.log(response);
        this.legoData = response.data;
        this.legoData = this.legoData.map((lego: any) => {
          return {
            ...lego,
            imgLego: response.imgData.imgLego ? response.imgData.imgLego :
            response.imgData.legoImages.some((img: any) => img.lego === lego.lego) ?
            response.imgData.legoImages.find((img: any) => img.lego === lego.lego).url :
            response.imgData.legoImages.find((img: any) => img.lego === '').url,
            imgPiece: response.imgData.imgPiece ? response.imgData.imgPiece :
            response.imgData.piezaImages.some((img: any) => img.pieza === lego.pieza) ?
            response.imgData.piezaImages.find((img: any) => img.pieza === lego.pieza).url :
            response.imgData.piezaImages.find((img: any) => img.pieza === '').url
          }
        })
        this.pageSize = response.pagination.pageSize;
        this.totalPages = response.pagination.totalPages;
        this.totalLegos = response.pagination.totalLegos;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al obtener las piezas de Lego:', error.error.message);
      }
    });
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.page) {
      this.page = page;
      this.getLegoPieces(this.valueSelected)
    }
  }

  getPages(): number[] {
    const pages: number[] = [];
    let startPage = 1;
    let endPage = this.totalPages;

    if (this.totalPages > this.maxPagesToShow) {
      const half = Math.floor(this.maxPagesToShow / 2);
      startPage = Math.max(1, this.page - half);
      endPage = startPage + this.maxPagesToShow - 1;

      if (endPage > this.totalPages) {
        endPage = this.totalPages;
        startPage = Math.max(1, endPage - this.maxPagesToShow + 1);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  openAddLego() {
    this.isAdding = true;
  }

  openEditLego(piece: any) {
    this.isAdding = false;
    this.editLegoForm.patchValue(piece);
  }

  editLego() {
    const editData = this.editLegoForm.value;
    this.legoService.editLego(editData).subscribe({
      next: (response) => {
        console.log(response);
        this.legoData = this.legoData.map((lego: any) => lego.id === editData.id ? { ...lego, ...editData, imgPiece : response.imgData.imgPiece, imgLego : response.imgData.imgLego} : lego);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al editar el lego:', error.error.message)
      }
    })
  }

  addLego() {
    const addData = this.addLegoForm.value;
    this.legoService.addLego(addData).subscribe({
      next: (response) => {
        console.log(response);
        if (this.addLegoForm.get('lego')?.value !== '') {
          this.selectedOption = 'lego';
          this.getLegoPieces(this.addLegoForm.get('lego')?.value)
        } else if (this.addLegoForm.get('pieza')?.value !== '') {
          this.selectedOption = 'pieza';
          this.getLegoPieces(this.addLegoForm.get('pieza')?.value)
        } else {
          this.selectedOption = 'lego';
          this.getLegoPieces(this.addLegoForm.get('lego')?.value)
        }
        this.addLegoForm.reset();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error("Error al agregar el lego:", error.error.message);
      }
    })
  }

  deleteLego(id: number, lego: number) {
    Swal.fire({
      title: "Confirmación",
      text: "¿Estás seguro de eliminar el lego?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.legoService.deleteLego(id).subscribe({
          next: (result) => {
            console.log(result);
            this.selectedOption = 'lego'
            this.getLegoPieces(lego)
            this.cdr.markForCheck();
          },
          error: (error) => {
            console.error('Error al eliminar el lego:', error.error.message);
          }
        })
        Swal.fire({
          title: "Eliminado",
          text: "El lego ha sido eliminado",
          icon: "success"
        });
      }
    });
  }
}
