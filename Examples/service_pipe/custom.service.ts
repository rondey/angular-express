import {Injectable} from '@angular/core'
import {HttpClient} from '@angular/common/http'

@Injectable({providedIn:'root'})
export class CustomService{

    dataUrl = '../../assets/people.json';

    getData():Promise<any[]>{
        return this.http.get<any[]>(this.dataUrl).toPromise();
    }

    getStatus(){
        console.log('I\'m available');
    }

    ngOnInit(){
        this.getStatus();
    }
    constructor(private http: HttpClient){}
}