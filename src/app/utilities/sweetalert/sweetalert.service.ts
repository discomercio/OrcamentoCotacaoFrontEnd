import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SweetalertService {
    constructor() { }

    private subject = new Subject<any>();
    public swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'p-button p-button-success p-ripple p-component p-m-1',
            cancelButton: 'p-button p-button-danger p-ripple p-component p-m-1'
        },
        buttonsStyling: false
    });

    sucesso(mensagem: string): void {
        Swal.fire(
            'Sucesso!',
            mensagem,
            'success'
        );
    }

    aviso(mensagem: string): void {
        Swal.fire(
            'Aviso!',
            mensagem,
            'warning'
        );
    }

    dialogo(titulo: string, texto: string): Observable<any> {
        this.subject = new Subject<any>();
        this.swalWithBootstrapButtons.fire({
            title: titulo,
            text: texto,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Não',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                this.subject.next(true);
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                this.subject.next(false);
            }
        });

        return this.subject.asObservable();
    }

    dialogoVersao(titulo: string, texto: string): Observable<any> {
        this.subject = new Subject<any>();
        this.swalWithBootstrapButtons.fire({
            title: titulo,
            text: texto,
            icon: 'warning',
            showCancelButton: false,
            showConfirmButton: true,
            confirmButtonText: 'Ok',
            cancelButtonText: 'Não',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                this.subject.next(true);
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                this.subject.next(false);
            }
        });

        return this.subject.asObservable();
    }
}
