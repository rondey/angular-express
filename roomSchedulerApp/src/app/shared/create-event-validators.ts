/* Developed By Davide Antonino Vincenzo Micale */
import { AbstractControl } from '@angular/forms';

// Esportazione del validatore che si occupa di verificare che l'ora di fine appuntamento
// sia maggiore dell'ora di inizio.
// La funzione di validazione riceve il control a cui deve essere applicata la verifica.
// Il FormControl è una sottoclasse della AbstractControl, per rendere la validazione
// applicabile in qualsiasi contesto, si riceve la sua versione astratta
export function maxHourValidator(control: AbstractControl) {
    // Con control.parent ottengo il riferimento al FormGroup di appartenenza
    const group = control.parent;
    // Nel caso in cui il gruppo non esiste ancora, restituisco null, cioè che il campo
    // è valido
    if (!group) {
        return null;
    }
    // Assegno alla costante min il valore del campo starting
    const min = group.controls['starting'].value;
    // Verifica che l'ora di inizio è minore dell'ora di fine
    // (nota bene: la data non è importante, basta che siano uguali)
    const start = new Date(`01/01/2018 ${min}:00`);
    const end = new Date(`01/01/2018 ${control.value}:00`);
    if (start >= end) {
        // Se l'ora di inizio è maggiore o uguale, restituisco l'errore valiMax
        return { 'validMax': true };

    }

    // In assenza di errori, restituisco che la validazione è andata a buon fine
    return null;

}

// Il validatore maxDateValidator si occupa di verificare che la data d'inizio
// sia uguale o minore della data di fine
export function maxDateValidator(control: AbstractControl) {
    const group = control.parent;
    if (!group) {
        return null;
    }
    const min = group.controls['dateStart'].value;
    // Verifica che la data di inizio sia minore della data di fine nel caso
    // in cui la data di fine venga effettivamente impostata
    const start = new Date(min);
    const end = new Date(control.value);
    if (control.value && start > end) {
        // Restituisco l'errore
        return { 'validMax': true };

    }

    return null;

}

// Si occupa di verificare che venga impostato uno ed uno solo fra il campo
// dateEnd e il campo hours
export function durationEventValidator(control: AbstractControl) {
    const group = control.parent;
    if (!group) {
        return null;
    }

    // Ottengo i valori di dateEnd e di hours
    const dateEnd = group.get('dateEnd').value;
    const hours = group.get('hours').value;

    // Se la dateEnd e hours sono impostate oppure se nè dateEnd nè hours
    // sono impostate
    if (dateEnd && hours || !dateEnd && !hours) {
        // Restituisco l'errore
        return { 'duration': true };
    }

    return null;
}

// La funzione verifica che almeno uno dei campi del giorno della settimana
// vengano impostati
export function daysEventValidator(control: AbstractControl) {
    const group = control.parent;
    if (!group) {
        return null;
    }

    // Se nessuno fra i giorni della settimana assume il valore true
    if (!(group.get('monday').value || group.get('tuesday').value || group.get('wednesday').value || group.get('thursday').value
        || group.get('friday').value || group.get('saturday').value || group.get('sunday').value)) {
        // Restituisco l'errore
        return { 'noDays': true };
    }

    return null;
}
