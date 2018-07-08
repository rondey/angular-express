# Room Scheduler

Il progetto richiede installato sul PC PostgreSql. Una volta installato, seguire i seguenti passaggi:
# per installare le dipendenze
1) npm install
2) all'interno del file 'server/datasources.json' l'oggetto 'database' contiene i dati che verranno usati dal server per interfacciarsi. È possibile
   modificarli liberamente oppure usare quelli di default. I dati sono:

   "host": "localhost",
    "port": 5432,
    "database": "roomscheduler",
    "password": "",
    "name": "database",
    "user": "davide"

    I dati che possono essere modificati sono 'host', eventualmente il 'port' se Postgresql lavora su una porta diversa dalla classica, il nome del 'database', 
    'user' il nome dell'utente che farà girare il database.
3) assicurarsi che il database esista
# per avviare il server
4) node . 
