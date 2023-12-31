import {Component, OnInit} from '@angular/core';
import {EventService} from '../service/eventservice';
import {SelectItem} from 'primeng/api';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ProductService } from '../service/productservice';
import { Product } from '../domain/product';

@Component({
    templateUrl: './dashboard.component.html',
    styleUrls: ['./tabledemo.scss'],
    styles: [`
        @media screen and (max-width: 960px) {
            :host ::ng-deep .fc-header-toolbar {
                display: flex;
                flex-wrap: wrap;
            }
        }
    `]
})
export class DashboardDemoComponent implements OnInit {

    cities: SelectItem[];

    products: Product[];

    chartData: any;

    events: any[];

    selectedCity: any;

    fullcalendarOptions: any;

    constructor(private productService: ProductService, private eventService: EventService) { }

    ngOnInit() {
        // this.productService.getProducts().then(data => this.products = data);

        // this.eventService.getEvents().then(events => {this.events = events; });

        this.cities = [];
        this.cities.push({label: 'New York', value: {id: 1, name: 'New York', code: 'NY'}});
        this.cities.push({label: 'Rome', value: {id: 2, name: 'Rome', code: 'RM'}});
        this.cities.push({label: 'London', value: {id: 3, name: 'London', code: 'LDN'}});
        this.cities.push({label: 'Istanbul', value: {id: 4, name: 'Istanbul', code: 'IST'}});
        this.cities.push({label: 'Paris', value: {id: 5, name: 'Paris', code: 'PRS'}});

        this.chartData = {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [
                {
                    label: 'First Dataset',
                    data: [65, 59, 80, 81, 56, 55, 40],
                    fill: false,
                    borderColor: '#FFC107'
                },
                {
                    label: 'Second Dataset',
                    data: [28, 48, 40, 19, 86, 27, 90],
                    fill: false,
                    borderColor: '#03A9F4'
                }
            ]
        };

        this.fullcalendarOptions = {
				plugins:[dayGridPlugin, timeGridPlugin, interactionPlugin],
				defaultDate: '2017-02-12',
				header: {
					left: 'prev,next',
					center: 'title',
					right: 'dayGridMonth,timeGridWeek,timeGridDay'
				},
				editable: true
        };
    }
}
