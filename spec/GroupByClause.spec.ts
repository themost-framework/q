import { QueryCollection, QueryExpression, count } from '../src';
// eslint-disable-next-line no-unused-vars
import { MemoryAdapter } from './TestMemoryAdapter';
import { initDatabase } from './TestMemoryDatabase';

describe('Aggregate Functions', () => {
    beforeAll(async () => {
        await initDatabase();
    });
    it('should use groupBy()', async () => {
        const a = new QueryExpression().select( (x: { CustomerID: any; Country: any; }) => {
            return {
                // eslint-disable-next-line no-undef
                TotalCustomers: count(x.CustomerID),
                Country: x.Country
            }
        })
        .from('Customers')
        .groupBy ( (x: { Country: any; }) => {
            x.Country
        });
        const result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
    });
    it('should use groupBy() with join()', async () => {
        const Shippers = new QueryCollection('Shippers');
        const Orders = new QueryCollection('Orders');
        const a = new QueryExpression().select( (x: { OrderID: any; }) => {
            return {
                // eslint-disable-next-line no-undef
                TotalOrders: count(x.OrderID),
                ShipperName: (Shippers as any).ShipperName
            }
        }, {
            Shippers
        })
        .from(Orders)
        .join(Shippers)
        .with(
            (x: any) => x.Shipper,
            (y: any) => y.ShipperID
         )
        // eslint-disable-next-line no-unused-vars
        .groupBy ( (x: any) => {
            (Shippers as any).ShipperName
        }, {
            Shippers
        });
        const result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
    });
});