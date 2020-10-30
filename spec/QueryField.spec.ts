import { QueryField } from '../src/index';

describe('QueryField', () => {
    it('should create QueryField', () => {
        const a = new QueryField('id');
        expect(a).toBeTruthy();
    });
    it('should use QueryField.count()', () => {
        const a: any = new QueryField('id').count();
        expect(a).toBeTruthy();
        expect(a.$count).toBeTruthy();
        expect(a.$count).toBe('$id');
    });
    it('should use QueryField.min()', () => {
        const a: any = new QueryField('price').min();
        expect(a).toBeTruthy();
        expect(a.$min).toBeTruthy();
        expect(a.$min).toBe('$price');
    });

    it('should use QueryField.max()', () => {
        const a: any = new QueryField('price').max();
        expect(a.$max).toBeTruthy();
        expect(a.$max).toBe('$price');
    });

    it('should use QueryField.sum()', () => {
        const a: any = new QueryField('price').sum();
        expect(a.$sum).toBeTruthy();
        expect(a.$sum).toBe('$price');
    });

    it('should use QueryField.avg()', () => {
        const a = new QueryField('price').avg();
        const match = Object.assign(new QueryField(),
        {
            $avg:'$price'
        });
        expect(a).toEqual(match);
    });

    it('should use QueryField.toDate()', () => {
        const a = new QueryField('dateCreated').toDate();
        const match = Object.assign(new QueryField(),
        {
            $date:'$dateCreated'
        });
        expect(a).toEqual(match);
    });

    it('should use QueryField.getDay()', () => {
        const a: any = new QueryField('dateCreated').getDay();
        expect(a.$dayOfWeek).toBeTruthy();
        expect(a.$dayOfWeek).toBe('$dateCreated');
        const match = Object.assign(new QueryField(),
        {
            "$dayOfWeek": "$dateCreated"
        });
        expect(a).toEqual(match);
    });

    it('should use QueryField.getDay().max()', () => {
        const a: any = new QueryField('dateCreated').getDay().max();
        const match = Object.assign(new QueryField(),
        {
            "$max": {
                "$dayOfWeek": "$dateCreated"
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryField.concat()', () => {
        const a = new QueryField('givenName').concat(' ', new QueryField('familyName'));
        const match = Object.assign(new QueryField(),
        {
            "$concat": [ '$givenName', ' ', '$familyName' ]
        });
        expect(a).toEqual(match);
    });

    it('should use QueryField.as()', () => {
        let a = new QueryField('dateCreated').as('createdAt');
        let match: any = Object.assign(new QueryField(),
        {
            "createdAt": "$dateCreated"
        });
        expect(a).toEqual(match);
        a = new QueryField('dateCreated').toDate().as('createdAt');
        match = Object.assign(new QueryField(),
        {
            "createdAt": {
                "$date": "$dateCreated"
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryField.add()', () => {
        const a = new QueryField('price').add(new QueryField('fee'));
        const match = Object.assign(new QueryField(),
        {
            "$add": [ "$price", "$fee" ]
        });
        expect(a).toEqual(match);
    });

    it('should use QueryField.subtract()', () => {
        const a = new QueryField('price').subtract(new QueryField('coupon'));
        const match = Object.assign(new QueryField(),
        {
            "$subtract": [ "$price", "$coupon" ]
        });
        expect(a).toEqual(match);
    });

    it('should use QueryField.multiply()', () => {
        const a = new QueryField('price').multiply(0.8);
        const match = Object.assign(new QueryField(),
        {
            "$multiply": [ "$price", 0.8 ]
        });
        expect(a).toEqual(match);
    });

    it('should use QueryField.divide()', () => {
        const a = new QueryField('workHours').divide(8);
        const match = Object.assign(new QueryField(),
        {
            "$divide": [ "$workHours", 8 ]
        });
        expect(a).toEqual(match);
    });

    it('should use QueryField.mod()', () => {
        const a = new QueryField('userFlags').mod(512);
        const match = Object.assign(new QueryField(),
        {
            "$mod": [ "$userFlags", 512 ]
        });
        expect(a).toEqual(match);
    });

    it('should use QueryField.round()', () => {
        let a: any = new QueryField('grade').round(4);
        let match = Object.assign(new QueryField(),
        {
            "$round": [ "$grade", 4 ]
        });
        expect(a).toEqual(match);
        a = new QueryField('grade').round();
        match = Object.assign(new QueryField(),
        {
            "$round": [ "$grade", 0 ]
        });
        expect(a).toEqual(match);
    });

    it('should use QueryField.substr()', () => {
        const a = new QueryField('givenName').substr(0, 1);
        const match = Object.assign(new QueryField(),
        {
            "$substr": [ "$givenName", 0, 1 ]
        });
        expect(a).toEqual(match);
    });

    it('should use QueryField.toLower()', () => {
        const a = new QueryField('givenName').toLowerCase();
        const match = Object.assign(new QueryField(),
        {
            "$toLower": "$givenName"
        });
        expect(a).toEqual(match);
    });

    it('should use QueryField.toUpper()', () => {
        const a = new QueryField('givenName').toUpperCase();
        const match = Object.assign(new QueryField(),
        {
            "$toUpper": "$givenName"
        });
        expect(a).toEqual(match);
    });

    it('should use QueryField.indexOf()', () => {
        const a = new QueryField('givenName').indexOf('Jo', 0);
        const match = Object.assign(new QueryField(),
        {
            "$indexOfBytes": ["$givenName", "Jo", 0]
        });
        expect(a).toEqual(match);
    });


});
