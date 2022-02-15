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

    setConfirm(titulo: string, texto: string) {
        this.subject = new Subject<any>();
        let timerInterval;
        this.swalWithBootstrapButtons.fire({
            title: titulo,
            text: texto,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sim, confirme para mim!',
            cancelButtonText: 'Não, cancele!',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title:'Confirmado!',
                    text:'Iremos precessar sua solicitação!',
                    icon: 'success',
                    timer:1000,
                    showConfirmButton:false,
                    didOpen: () => {
                        timerInterval = setInterval(() => {
                            this.swalWithBootstrapButtons.close();
                        }, 1000);
                      },
                      willClose: () => {
                        clearInterval(timerInterval);
                      }
                }).then(() => this.subject.next(true));
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.fire({
                    title:'Cancelado!',
                    icon: 'error',
                    timer:1000,
                    showConfirmButton:false,
                    didOpen: () => {
                        timerInterval = setInterval(() => {
                            this.swalWithBootstrapButtons.close();
                        }, 1000);
                      },
                      willClose: () => {
                        clearInterval(timerInterval);
                      }
                }).then(() => this.subject.next(false));
            }
        });
    }

    confirmarAprovacao(titulo: string, texto: string):Observable<any>{
        this.setConfirm(titulo, texto);
        return this.subject.asObservable();
    }
}