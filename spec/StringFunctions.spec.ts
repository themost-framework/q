import { QueryCollection, QueryExpression } from '../src';
// eslint-disable-next-line no-unused-vars
import { min, max, mean, sum } from 'mathjs';
import { MemoryAdapter } from './TestMemoryAdapter';
import { initDatabase } from './TestMemoryDatabase';

describe('String Functions', () => {
    beforeAll(async () => {
        await initDatabase();
    });
    it('should use String.prototype.startsWith()', async () => {
        let a = new QueryExpression().select( (x: { CustomerID: any; CustomerName: any; ContactName: any; }) => {
            x.CustomerID,
            x.CustomerName,
            x.ContactName
        })
        .from('Customers').where( (x: { CustomerName: { startsWith: (arg0: string) => boolean; }; }) => {
            return x.CustomerName.startsWith('Cactus') === true;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x: any) => {
            expect(x.CustomerName.startsWith('Cactus')).toBe(true);
        });
    });

    it('should use String.prototype.endsWith()', async () => {
        let a = new QueryExpression().select( (x: { CustomerID: any; CustomerName: any; ContactName: any; }) => {
            x.CustomerID,
            x.CustomerName,
            x.ContactName
        })
        .from('Customers').where( (x: any) => {
            return x.CustomerName.endsWith('Holdings') === true;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x: any) => {
            expect(x.CustomerName.endsWith('Holdings')).toBe(true);
        });
    });

    it('should use String.prototype.toLowerCase()', async () => {
        let a = new QueryExpression().select( (x: { CustomerID: any; CustomerName: any; ContactName: any; }) => {
            x.CustomerID,
            x.CustomerName,
            x.ContactName
        })
        .from('Customers').where( (x: { CustomerName: { toLowerCase: () => string; }; }) => {
            return x.CustomerName.toLowerCase() === 'around the horn';
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
    });

    it('should use String.prototype.toUpperCase()', async () => {
        let a = new QueryExpression().select( (x: { CustomerID: any; CustomerName: any; ContactName: any; }) => {
            x.CustomerID,
            x.CustomerName,
            x.ContactName
        })
        .from('Customers').where( (x: { CustomerName: { toUpperCase: () => string; }; }) => {
            return x.CustomerName.toUpperCase() === 'AROUND THE HORN';
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
    });

    it('should use String.prototype.substr()', async () => {
        let a = new QueryExpression().select( (x: { CustomerID: any; CustomerName: any; ContactName: any; }) => {
            x.CustomerID,
            x.CustomerName,
            x.ContactName
        })
        .from('Customers').where( (x: any) => {
            return x.CustomerName.substr(0,6) === 'Cactus';
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x: any) => {
            expect(x.CustomerName.substr(0,6)).toBe('Cactus');
        });
    });

    it('should use String.prototype.indexOf()', async () => {
        let a = new QueryExpression().select( (x: { CustomerID: any; CustomerName: any; ContactName: any; }) => {
            x.CustomerID,
            x.CustomerName,
            x.ContactName
        })
        .from('Customers').where( (x: { CustomerName: { indexOf: (arg0: string) => number; }; }) => {
            return x.CustomerName.indexOf('Holdings') > 0;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x: { CustomerName: { indexOf: (arg0: string) => void; }; }) => {
            expect(x.CustomerName.indexOf('Holdings')).toBeGreaterThan(0);
        });
    });

    it('should use String.prototype.includes()', async () => {
        let a = new QueryExpression().select( (x: { CustomerID: any; CustomerName: any; ContactName: any; }) => {
            x.CustomerID,
            x.CustomerName,
            x.ContactName
        })
        .from('Customers').where( (x: { CustomerName: { includes: (arg0: string) => boolean; }; }) => {
            return x.CustomerName.includes('Holdings') === true;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x: { CustomerName: { includes: (arg0: string) => void; }; }) => {
            expect(x.CustomerName.includes('Holdings')).toBeTruthy();
        });
    });

    it('should use String.prototype.length', async () => {
        let a = new QueryExpression().select( (x: { CustomerID: any; CustomerName: any; ContactName: any; }) => {
            x.CustomerID,
            x.CustomerName,
            x.ContactName
        })
        .from('Customers').where( (x: { CustomerName: { length: number; }; }) => {
            return x.CustomerName.length >= 18;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x: { CustomerName: { length: any; }; }) => {
            expect(x.CustomerName.length).toBeGreaterThanOrEqual(18);
        });
    });

    it('should use String.prototype.trim()', async () => {
        const Customers = new QueryCollection('Customers');
        let a = new QueryExpression().select( (x: { CustomerID: any; CustomerName: any; ContactName: any; City: any; }) => {
            x.CustomerID,
            x.CustomerName,
            x.ContactName,
            x.City
        })
        .from(Customers).where( (x: any) => {
            return x.City.trim() === 'Nantes';
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x: any) => {
            expect(x.City.trim()).toBe('Nantes');
        });
    });

    it('should use String.prototype.concat()', async () => {
        let a = new QueryExpression().select( (x: { CustomerID: any; CustomerName: any; ContactName: any; City: any; }) => {
            x.CustomerID,
            x.CustomerName,
            x.ContactName,
            x.City
        })
        .from('Customers').where( (x: { City: { concat: (arg0: string) => string; }; }) => {
            return x.City.concat(', France') === 'Nantes, France';
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x: { City: { concat: (arg0: string) => any; }; }) => {
            expect(x.City.concat(', France')).toBe('Nantes, France');
        });

        let Categories = new QueryCollection('Categories');
        let Products = new QueryCollection('Products');
        a = new QueryExpression().select( (x: { ProductID: any; ProductName: { concat: (arg0: string, arg1: any) => void; }; }) => {
            return {
                ProductID: x.ProductID,
                CategoryName: x.ProductName.concat(' ', (<any>Categories).CategoryName)
            }
        }, {
            Categories
        })
        .from(Products)
        .join(Categories)
        .with( (x: { Category: any; }) => x.Category, (x: { CategoryID: any; }) => x.CategoryID );
        result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();


    });

});