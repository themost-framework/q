import { ClosureParser } from '../src';
// eslint-disable-next-line no-unused-vars
import { round, ceil, floor, mod, multiply, subtract, divide, add, bitAnd } from 'mathjs';
describe('ClosureParser', () => {
   it('should create instance', () => {
      const parser = new ClosureParser();
      expect(parser).toBeTruthy();
   });
    it('should use ClosureParser.parseSelect()', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect((x: any) => x.dateCreated);
        expect(expr).toBeTruthy();
        expect(expr instanceof Array).toBeTruthy();
        expect(expr[0]).toBe('$dateCreated');
    });
    it('should use ClosureParser.parseSelect()', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect((x: any) => {
            x.id,
            x.dateCreated
        });
        expect(expr).toBeTruthy();
        expect(expr).toBeInstanceOf(Array);
        expect(expr[0]).toBe('$id');
        expect(expr[1]).toBe('$dateCreated');
    });
    it('should use ClosureParser.parseSelect()', async () => {
        const parser = new ClosureParser();
        let select = parser.parseSelect( (x: any) => {
            return {
                id: x.id,
                createdAt: x.dateCreated
            }
        });
        expect(select).toBeTruthy();
        expect(select[0].id).toBeTruthy();
        expect(select[1].createdAt).toBeTruthy();

        select = parser.parseSelect(function(x: any) {
            return {
                id: x.id,
                createdAt: x.dateCreated
            }
        });
        expect(select).toBeTruthy();
    });

    it('should use ClosureParser.parseSelect() with SequenceExpression', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect((x: any) => {
            x.id,
            x.dateCreated.getMonth()
        });
        expect(expr).toBeTruthy();
    });

    it('should use Math.floor()', async () => {
        const parser = new ClosureParser();
        let select = parser.parseSelect((x: any) => {
                x.id,
                Math.floor(x.price)
        });
        expect(select).toBeTruthy();
        expect(select).toEqual([
            "$id",
            {
                $floor: "$price"
            }
        ]);
        select = parser.parseSelect((x: any) => {
                return {
                    "price": Math.floor(x.price)
                }
        });
        expect(select).toEqual([{
            price: {
                $floor: "$price"
            }
        }]);
    });

    it('should use Math.ceil()', async () => {
        const parser = new ClosureParser();
        let select = parser.parseSelect((x: any) => {
                x.id,
                Math.ceil(x.price)
        });
        expect(select).toBeTruthy();
        expect(select).toEqual([
            "$id",
            {
                $ceil: "$price"
            }
        ]);
        select = parser.parseSelect((x: any) => {
            return {
                "price": Math.ceil(x.price)
            }
        });
        expect(select).toEqual([{
            price: {
                $ceil: "$price"
            }
        }]);
        select = parser.parseSelect((x: any) => {
            return {
                "price": ceil(x.price)
            }
        });
        expect(select).toEqual([{
            price: {
                $ceil: "$price"
            }
        }]);
    });

    it('should use Math.round()', async () => {
        const parser = new ClosureParser();
        let select = parser.parseSelect((x: any) => {
            x.id,
            Math.round(x.price)
        });
        expect(select).toEqual([
            "$id",
            {
                $round: "$price"
            }
        ]);
        select = parser.parseSelect((x: any) => {
            return {
                "price": Math.round(x.price)
            }
        });
        expect(select).toEqual([{
            price: {
                $round: "$price"
            }
        }]);
    });


    it('should use mathjs.round()', async () => {
        const parser = new ClosureParser();
        let select = parser.parseSelect((x: any) => {
            return {
                "price": round(x.price, 4)
            }
        });
        expect(select).toEqual([{
            price: {
                $round: [ "$price", 4 ]
            }
        }]);
    });

    it('should use mathjs.floor()', async () => {
        const parser = new ClosureParser();
        let select = parser.parseSelect((x: any) => {
            return {
                "price": floor(x.price * 0.8)
            }
        });
        expect(select).toEqual(
        [{
            "price": {
                "$floor": { 
                    "$multiply": [ 
                        "$price",
                        0.8 
                    ] 
                }
            }
        }]);
    });

    it('should use mathjs.add()', async () => {
        const parser = new ClosureParser();
        let select = parser.parseSelect((x: any) => {
            return {
                "price": add(x.price, 4)
            }
        });
        expect(select).toEqual([{
            price: {
                $add: [ "$price", 4 ]
            }
        }]);
    });

    it('should use add javascript add operator', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect((x: any) => {
            return {
                "price": x.price + 4
            }
        });
        expect(expr).toEqual([
            {
                price: {
                    $add: [ "$price", 4 ]
                }
            }
        ]);
    });

    it('should use mathjs.subtract()', async () => {
        const parser = new ClosureParser();
        let select = parser.parseSelect((x: any) => {
            return {
                "price": subtract(x.price, 4)
            }
        });
        expect(select).toEqual([{
            price: {
                $subtract: [ "$price", 4 ]
            }
        }]);
    });

    it('should use add javascript subtract operator', async () => {
        const parser = new ClosureParser();
        let select = parser.parseSelect((x: any) => {
            return {
                "price": x.price - 4
            }
        });
        expect(select).toEqual([{
            price: {
                $subtract: [ "$price", 4 ]
            }
        }]);
    });

    it('should use mathjs.multiply()', async () => {
        const parser = new ClosureParser();
        let select = parser.parseSelect((x: any) => {
            return {
                "price": multiply(x.price, 0.9)
            }
        });
        expect(select).toEqual([{
            price: {
                $multiply: [ "$price", 0.9 ]
            }
        }]);
    });

    it('should use add javascript multiply operator', async () => {
        const parser = new ClosureParser();
        let select = parser.parseSelect((x: any) => {
            return {
                "price": x.price * 0.8
            }
        });
        expect(select).toEqual([{
            price: {
                $multiply: [ "$price", 0.8 ]
            }
        }]);
    });

    it('should use mathjs.divide()', async () => {
        const parser = new ClosureParser();
        let select = parser.parseSelect((x: any) => {
            return {
                "price": divide(x.price, 2)
            }
        });
        expect(select).toEqual([{
            price: {
                $divide: [ "$price", 2 ]
            }
        }]);
    });

    it('should use add javascript divide operator', async () => {
        const parser = new ClosureParser();
        let select = parser.parseSelect((x: any) => {
            return {
                "price": x.price / 2
            }
        });
        expect(select).toEqual([{
            price: {
                $divide: [ "$price", 2 ]
            }
        }]);
    });

    it('should use add javascript divide and add operator', async () => {
        const parser = new ClosureParser();
        let select = parser.parseSelect((x: any) => {
            return {
                "price": (x.price / 2) + 10
            }
        });
        expect(select).toEqual([{
            price: {
                $add: [ 
                    { $divide: [ "$price", 2 ] }, 
                    10 
                ]
            }
        }]);
    });

    it('should use String.prototype.substring()', async () => {
        const parser = new ClosureParser();
        let select = parser.parseSelect((x: any) => {
            return {
                "name": x.name.substring(0,4)
            }
        });
        expect(select).toEqual([{
            name: {
                $substr: [ "$name", 0, 4 ]
            }
        }]);
    });

    it('should use String.prototype.toLowerCase()', async () => {
        const parser = new ClosureParser();
        let select = parser.parseSelect((x: any) => {
            return {
                "status": x.status.toLowerCase()
            }
        });
        expect(select).toEqual([{
            status: {
                $toLower: "$status"
            }
        }]);
    });

    it('should use String.prototype.toUpperCase()', async () => {
        const parser = new ClosureParser();
        let select = parser.parseSelect((x: any) => {
            return {
                "status": x.status.toUpperCase()
            }
        });
        expect(select).toEqual([{
            status: {
                $toUpper: "$status"
            }
        }]);
    });

    it('should use Date.prototype.getFullYear()', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect((x: any) => {
            return {
                "yearCreated": x.dateCreated.getFullYear()
            }
        });
        expect(expr).toEqual([{
            yearCreated: {
                $year: "$dateCreated"
            }
        }]);
    });

    it('should use Date.prototype.getMonth()', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect((x: any) => {
            return {
                "monthCreated": x.dateCreated.getMonth()
            }
        });
        expect(expr).toEqual([{
            monthCreated: {
                $month: "$dateCreated"
            }
        }]);
    });

    it('should use Date.prototype.getDate()', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect((x: any) => {
            return {
                "dayCreated": x.dateCreated.getDate()
            }
        });
        expect(expr).toEqual([{
            dayCreated: {
                $dayOfMonth: "$dateCreated"
            }
        }]);
    });

    it('should use Date.prototype.getHours()', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect((x: any) => {
            return {
                "hourCreated": x.dateCreated.getHours()
            }
        });
        expect(expr).toEqual([{
            hourCreated: {
                $hour: "$dateCreated"
            }
        }]);
    });

    it('should use Date.prototype.getMinutes()', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect((x: any) => {
            return {
                "minuteCreated": x.dateCreated.getMinutes()
            }
        });
        expect(expr).toEqual([{
            minuteCreated: {
                $minute: "$dateCreated"
            }
        }]);
    });

    it('should use Date.prototype.getSeconds()', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect((x: any) => {
            return {
                "secondCreated": x.dateCreated.getSeconds()
            }
        });
        expect(expr).toEqual([{
            secondCreated: {
                $second: "$dateCreated"
            }
        }]);
    });



});
