module.exports = {

    //Calcolo della differenza di giorni fra due date
    inDays: function(d1, d2) {
        return Math.round((d2-d1)/(24*3600*1000));
    },

    //Calcolo della differenza di ore fra le due date
    inHours: function(d1, d2){
        let diff =(d2 - d1) / 1000;
        diff /= (60 * 60);
        return Math.abs(Math.round(diff));
    },

    //Permette di sommare alla data actualDate un numero di giorni add
    newDate: function(actualDate, add){
        let d = new Date(actualDate);
        d.setDate(d.getDate() + add);
        return d.toISOString();
    }
}