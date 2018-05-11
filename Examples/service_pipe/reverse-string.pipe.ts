import {Pipe,PipeTransform} from '@angular/core';

@Pipe({name:'reverseString'})
export class ReverseString implements PipeTransform{
  transform(value: string):string{
    let temp = '';
    for(var i=value.length-1; i>=0; i--){
      temp+=value.charAt(i);
    }
    return temp;
  }
}