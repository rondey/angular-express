/* Developed By Davide Antonino Vincenzo Micale */
// La funzione consente di effettuare una ricerca di una stringa all'interno di un'altra
// che sia case unsensitive, non tenendo conto delle maiuscole e delle minuscole
export function filterString(search: string, on: string) {
    // La ricerca viene effettuata sfruttanto le regular expression. Si definisce
    // come regola di ricerca la stringa search e come flag 'i', cioè che sia case unsensitive
    const regex = new RegExp(search, 'i');
    // Con la funzione JavaScript test, viene effettuata la ricerca della stringa search
    // all'interno della stringa on e restituisce true al primo match, altrimenti restituisce
    // false
    return regex.test(on);
}
