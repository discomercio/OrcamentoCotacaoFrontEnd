import { Directive, AfterContentInit, Input, ElementRef, OnInit, AfterViewInit } from "@angular/core";


@Directive({
    selector: '[appFocoAutomatico]'
})

export class AutofocusDirective {
    constructor(private el: ElementRef) {
        //Otherwise Angular throws error: Expression has changed after it was checked.
        window.setTimeout(() => {
            this.el.nativeElement.focus(); //For SSR (server side rendering) this is not safe. Use: https://github.com/angular/angular/issues/15008#issuecomment-285141070)
        });
    }
}
