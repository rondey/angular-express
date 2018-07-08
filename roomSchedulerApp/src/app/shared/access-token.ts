/* Developed By Davide Antonino Vincenzo Micale */
// Il modello del access token
export class AccessToken {
    constructor(
        public id: string,
        public ttl: number,
        public created: Date,
        public userId: number
    ) {  }
}

export const accessTokenStorageKey = 'accessToken';
