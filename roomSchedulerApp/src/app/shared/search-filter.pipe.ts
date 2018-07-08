/* Developed By Davide Antonino Vincenzo Micale */
import { Pipe, PipeTransform } from '@angular/core';
import { filterString } from './filter';

@Pipe({
 // Nome del pipe
 name: 'searchfilter'
})

// I pipe devono implementare l'interfaccia PipeTransform
// La pipe si occupa di filtrare da un array tutti gli elementi per cui nel campo field
// non sia presente al suo interno la sottostringa value, oppure hanno lo stesso valore
// booleano
export class SearchFilterPipe implements PipeTransform {
    // Per implementare l'interfaccia è necessario implementare la funzione transform
    // Nel caso specifico prende in input l'array di elementi a cui applicare la
    // trasformazione, il campo che subirà il filtraggio e la stringa contenente la
    // sottostringa da cercare
    transform(items: any[], field: string, value: string): any[] {
        // Se il valore è nullo, vuol dire che non ci sono filtri e quindi è
        // possibile restituire l'intero array
        if (!value) { return items; }

        // Se l'array non esiste, restituisco un array vuoto
        if (!items) { return []; }

        // Ciò che restituisco è un nuovo array, generato dall'applicare la
        // funzione JavaScript filter all'array items. Come parametro del
        // filter passo una funzione, che prende in input un elemento
        // dell'array. La funzione che passo viene applicata una volta
        // per ogni elemento. Se la funzione restituisce true, l'elemento
        // farà parte del nuovo array, altrimenti viene scartato
        return items.filter(it => {
            // Se l'elemento del campo non è booleano
            if (typeof(it[field]) !== 'boolean') {
                // È una stringa e quindi uso la funzione apposita filterString
                return filterString(value, it[field]);
            } else {
                // È un booleano, l'elemento viene mostrato se è true
                return (it[field]);
            }
        });
    }
}
