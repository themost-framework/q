import { QueryCollection, QueryExpression, count, min, max, mean, sum } from '../src';
import { MemoryAdapter } from './TestMemoryAdapter';
import { initDatabase } from './TestMemoryDatabase';

describe('Aggregate Functions', () => {
    beforeAll(async () => {
        await initDatabase();
    });
    it('should use min()', async () => {
        const a = new QueryExpression().select( (x: any) => {
            return {
                SmallestPrice: min(x.Price)
            }
        })
        .from('Products');
        const result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        expect(result[0].SmallestPrice).toBe(2.5);
    });
    it('should use max()', async () => {
        const a = new QueryExpression().select( (x: any) => {
            return {
                LargestPrice: max(x.Price)
            }
        })
        .from('Products');
        const result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        expect(result[0].LargestPrice).toBe(263.5);
    });
    it('should use avg()', async () => {
        const a = new QueryExpression().select( (x: any) => {
            return {
                AveragePrice: mean(x.Price)
            }
        })
        .from('Products');
        const result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        expect(result[0].AveragePrice).toBeGreaterThanOrEqual(28.866);
    });

    it('should use sum()', async () => {
        const OrderDetails = new QueryCollection('Order_Details');
        const a = new QueryExpression().select( (x: any) => {
            return {
                TotalQuantity: sum(x.Quantity)
            }
        })
        .from(OrderDetails);
        const result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        expect(result[0].TotalQuantity).toBeTruthy();
    });
    it('should use count()', async () => {
        const a = new QueryExpression().select( (x: any) => {
            return {
                TotalProducts: count(x.ProductID)
            }
        })
        .from('Products');
        const result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        expect(result[0].TotalProducts).toBeTruthy();
    });

});