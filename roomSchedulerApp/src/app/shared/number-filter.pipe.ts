/* Developed By Davide Antonino Vincenzo Micale */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    // Nome del pipe
    name: 'numberfilter'
})

// I pipe devono implementare l'interfaccia PipeTransform
// La pipe si occupa di filtrare da un array tutti gli elementi per cui nel campo field
// non rispettino la comparazione con il filtro, in base all'operatore di confronto scelto
export class NumberFilterPipe implements PipeTransform {
    // Per implementare l'interfaccia è necessario implementare la funzione transform
    // Nel caso specifico prende in input l'array di elementi a cui applicare la
    // trasformazione, il campo che subirà il filtraggio e un oggetto di tipo
    // Parameters contenente il valore della data di filtraggio e l'operatore di
    // confronto
    transform(items: any[], field: string, parameters: Parameters): any[] {
        // Estraggo il valore e l'operatore per snellire il codice
        const value = parameters.value;
        const operator = parameters.operator;

        // Se il valore è nullo, vuol dire che non ci sono filtri e quindi è
        // possibile restituire l'intero array
        if (!value) { return items; }

        // Se l'array non esiste, restituisco un array vuoto
        if (!items) { return []; }

        // Se l'operatore di confronto non è impostato, restituisco l'array
        if (!operator) { return items; }

        // Ciò che restituisco è un nuovo array, generato dall'applicare la
        // funzione JavaScript filter all'array items. Come parametro del
        // filter passo una funzione, che prende in input un elemento
        // dell'array. La funzione che passo viene applicata una volta
        // per ogni elemento. Se la funzione restituisce true, l'elemento
        // farà parte del nuovo array, altrimenti viene scartato
        return items.filter(it => {
            // Converto da stringa a numero i due elementi di input
            const fieldValue = Number(it[field]);
            const val = Number(value);

            // Il risultato che darà la funzione. Di default si respinge
            // l'elemento
            let result = false;

            // L'operatore può assumere come valori gt, lt, gte, lte, e
            // Se le prime due lettere dell'operatore sono gt
            if (operator.substring(0, 2) === 'gt') {
                // Può avvenire sia se si vuole fare un confronto di
                // maggioranza stretta oppure se è un confronto di
                // non decresenza.
                // result assume il valore del confronto fra fieldValue
                // e value
                result = fieldValue > val;
                // Altrimenti se le prime due lettere dell'operatore sono lt
            } else if (operator.substring(0, 2) === 'lt') {
                // Può avvenire sia se si vuole fare un confronto di
                // minoranza stretta oppure se è un confronto di
                // non crescenza.
                // result assume il valore del confronto fra fieldValue
                // e value
                result = fieldValue < val;
            }
            // In questo caso ci si arriva o perchè l'operatore è 'e', quindi
            // di uguaglianza, oppure se l'operatore è 'lte' o 'gte'
            if (operator.charAt(2) === 'e' || operator.charAt(0) === 'e') {
                // Il risultato finale deve perciò tenere conto del precedente
                // confronto e dunque si effettua un OR fra il risultato
                // precedente e il confronto di uguaglianza fra le due date
                // (se è 'e', il confronto precedente non c'è stato,
                // e quindi value ha il valore di default false, quindi
                // dipenderà tutto solo dal confronto di uguaglianza)
                result = result || fieldValue === val;
            }
            return result;
        });
    }
}

// Il modello dei parametri
class Parameters {
    constructor(
        public value: string,
        public operator: string
    ) { }
}
